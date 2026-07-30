import { CharacterRecord, WeaponRecord } from "@/types/planner"
import { CharacterAbilitySet } from "@/types/character"
import {
	NtePlannerArc,
	NtePlannerBackup,
	NtePlannerCharacter,
	NtePlannerStamina,
} from "@/types/ntePlannerImport"
import { SettingsRecord } from "@/types/settings"

import { EnumItemLvls } from "@/data/items"
import { findCharacter } from "@/data/characters"
import { findArc } from "@/data/arcs"

import { generateNewCharacter } from "./generateNewCharacter"
import {
	ImportedArc,
	ImportedCharacter,
	kebabToSnake,
	mapMaterialAmounts,
	normalizeId,
	snapItemLvl,
	ExternalImportResult,
} from "./importExternal"

export function isNtePlannerBackup(data: unknown): data is NtePlannerBackup {
	return (
		typeof data === "object" &&
		data !== null &&
		Object.keys(data).some((key) => key.startsWith("nte:"))
	)
}

// Materials whose NTE Planner id doesn't reduce to the same normalized form
// as chiz-pink's id (e.g. a variant/skin suffix chiz-pink doesn't track
// separately), keyed by normalized NTE id.
const MATERIAL_ID_ALIASES: Record<string, string> = {
	[normalizeId("confessional-flower-seed-serenetti")]: "confessional_flower_seed",
}

export function mapNteInventory(nteInventory: Record<string, number> = {}) {
	return mapMaterialAmounts(nteInventory, MATERIAL_ID_ALIASES)
}

export function mapNteStamina(nteStamina?: NtePlannerStamina) {
	if (!nteStamina) return null

	const patch: Partial<SettingsRecord["userdata"]> = {}

	if (typeof nteStamina.city?.current === "number") {
		patch["current-stamina"] = nteStamina.city.current
	}
	if (typeof nteStamina.city?.cap === "number") {
		patch["max-stamina"] = nteStamina.city.cap
	}
	if (typeof nteStamina.city?.lastReset === "number") {
		patch["last-stamina-reset"] = nteStamina.city.lastReset
	}
	if (typeof nteStamina.pixels?.amount === "number") {
		patch["current-pixels"] = nteStamina.pixels.amount
	}
	if (typeof nteStamina.pixels?.cap === "number") {
		patch["max-pixels"] = nteStamina.pixels.cap
	}
	if (typeof nteStamina.pixels?.timestamp === "number") {
		patch["pixels-last-edited"] = nteStamina.pixels.timestamp
	}

	return Object.keys(patch).length > 0 ? patch : null
}

const NTE_SKILL_KEY_MAP: Record<keyof CharacterAbilitySet, string> = {
	basicAttack: "basic-attack",
	skill: "skill",
	ultimate: "ultimate",
	support: "support-skill",
	passive1: "passive-skill-1",
	passive2: "passive-skill-2",
	passive3: "passive-skill-3",
	lifeSkill1: "life-skill-1",
	lifeSkill2: "life-skill-2",
}

export function mapNteCharacter(
	id: string,
	nteChar: NtePlannerCharacter
): Omit<CharacterRecord, "requiredMaterials" | "isDisabled"> | null {
	if (!findCharacter(id)) return null

	const base = generateNewCharacter(id)
	const abilitySet = { ...base.abilitySet }

	for (const key of Object.keys(abilitySet) as (keyof CharacterAbilitySet)[]) {
		const current = abilitySet[key]
		if (!current) continue

		const nteSkill = nteChar.skills?.[NTE_SKILL_KEY_MAP[key]]
		if (!nteSkill) continue

		// Default targetLvl is already the character's true max for this
		// skill (accounting for maxLvl quirks like binary life skills), so
		// it doubles as the clamp ceiling here.
		const cap = current.targetLvl

		abilitySet[key] = {
			isDisabled: false,
			currentLvl: Math.min(Math.max(nteSkill.current ?? 0, 0), cap),
			targetLvl: Math.min(Math.max(nteSkill.target ?? cap, 0), cap),
		}
	}

	const currentLvl = snapItemLvl(nteChar.currentLevel)
	const targetLvl = snapItemLvl(nteChar.targetLevel)

	return {
		id,
		currentLvl,
		targetLvl: Math.max(currentLvl, targetLvl) as EnumItemLvls,
		abilitySet,
		awakening: nteChar.awakeningTier ?? 0,
	}
}

export function mapNteArc(
	id: string,
	nteArc: NtePlannerArc
): Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled"> | null {
	if (!findArc(id)) return null

	const currentLvl = snapItemLvl(nteArc.currentLevel)
	const targetLvl = snapItemLvl(nteArc.targetLevel)

	return {
		id,
		currentLvl,
		targetLvl: Math.max(currentLvl, targetLvl) as EnumItemLvls,
	}
}

export function parseNtePlannerImport(
	data: NtePlannerBackup
): ExternalImportResult {
	const { matched: inventory, unmatched: unmatchedMaterials } = mapNteInventory(
		data["nte:inventory"]
	)

	const staminaPatch = mapNteStamina(data["nte:stamina"])

	const characters: ImportedCharacter[] = []
	const skippedCharacterIds: string[] = []

	for (const [rawId, nteChar] of Object.entries(data["nte:characters"] ?? {})) {
		const id = kebabToSnake(rawId)
		const mapped = mapNteCharacter(id, nteChar)

		if (mapped) {
			characters.push({ id, character: mapped })
		} else {
			skippedCharacterIds.push(rawId)
		}
	}

	const arcs: ImportedArc[] = []
	const skippedArcIds: string[] = []

	for (const [rawId, nteArc] of Object.entries(data["nte:arcs"] ?? {})) {
		const id = kebabToSnake(rawId)
		const mapped = mapNteArc(id, nteArc)

		if (mapped) {
			arcs.push({ id, arc: mapped })
		} else {
			skippedArcIds.push(rawId)
		}
	}

	return {
		source: "NTE Planner",
		inventory,
		unmatchedMaterials,
		staminaPatch,
		characters,
		skippedCharacterIds,
		arcs,
		skippedArcIds,
		hasActivitiesData: Boolean(data["nte:activities"]),
		hasEventsData: Boolean(data["nte:events"]),
	}
}
