import { CharacterRecord, WeaponRecord } from "@/types/planner"
import { Inventory } from "@/types/inventory"
import { SettingsRecord } from "@/types/settings"

import { EnumItemLvls, getAllMaterialsList } from "@/data/items"
import { getAllArcsList } from "@/data/arcs"

// Third-party planner exports (NTE Planner, NTEWiz, ...) use kebab-case ids
// we use snake_case
export function normalizeId(id: string) {
	return id.toLowerCase().replace(/[^a-z0-9]/g, "")
}

export function kebabToSnake(id: string) {
	return id.replace(/-/g, "_")
}

let materialIndex: Map<string, string> | null = null

function getMaterialIndex() {
	if (!materialIndex) {
		materialIndex = new Map(
			getAllMaterialsList().map((material) => [
				normalizeId(material.id),
				material.id,
			])
		)
	}
	return materialIndex
}

export function matchMaterialId(
	rawMaterialId: string,
	aliases: Record<string, string> = {}
): string | null {
	const normalized = normalizeId(rawMaterialId)

	return getMaterialIndex().get(normalized) ?? aliases[normalized] ?? null
}

let arcIdIndex: Set<string> | null = null

function getArcIdIndex() {
	if (!arcIdIndex) {
		arcIdIndex = new Set(getAllArcsList().map((arc) => normalizeId(arc.id)))
	}
	return arcIdIndex
}

// Some source apps mix arc names into the same flat id/amount record as
// materials (e.g. "a-time-will-come" is an arc, not a material). Those
// aren't a failed match - there was never a material to find - so they're
// dropped silently rather than reported as unmatched.
function isKnownArcId(rawId: string) {
	return getArcIdIndex().has(normalizeId(rawId))
}

export function mapMaterialAmounts(
	rawInventory: Record<string, unknown>,
	aliases?: Record<string, string>
) {
	const matched: Inventory = {}
	const unmatched: string[] = []

	for (const [rawId, amount] of Object.entries(rawInventory)) {
		if (typeof amount !== "number") continue

		const chizId = matchMaterialId(rawId, aliases)

		if (chizId) {
			matched[chizId] = amount
		} else if (!isKnownArcId(rawId)) {
			unmatched.push(rawId)
		}
	}

	return { matched, unmatched }
}

export function snapItemLvl(level: number): EnumItemLvls {
	if (level <= 1) return EnumItemLvls.Lvl1
	if (level >= 80) return EnumItemLvls.Lvl80

	if (level < 20) {
		return 20 - level <= level - 1 ? EnumItemLvls.Lvl20 : EnumItemLvls.Lvl1
	}

	const low = Math.floor(level / 10) * 10
	const remainder = level - low

	if (remainder === 0 || remainder === 5) return low as EnumItemLvls
	if (remainder <= 4) return (low + 1) as EnumItemLvls

	return (low + 10) as EnumItemLvls
}

export type ImportedCharacter = {
	id: string
	character: Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
}

export type ImportedArc = {
	id: string
	arc: Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
}

export type ExternalImportResult = {
	source: string
	inventory: Inventory
	unmatchedMaterials: string[]
	staminaPatch: Partial<SettingsRecord["userdata"]> | null
	characters: ImportedCharacter[]
	skippedCharacterIds: string[]
	arcs: ImportedArc[]
	skippedArcIds: string[]
	hasActivitiesData: boolean
	hasEventsData: boolean
}
