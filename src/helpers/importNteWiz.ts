import { CharacterRecord, WeaponRecord } from "@/types/planner"
import { CharacterAbilitySet } from "@/types/character"
import {
	NteWizAnalystCharacter,
	NteWizAnalystWeapon,
	NteWizBackup,
	NteWizProfile,
	NteWizTalents,
} from "@/types/nteWizImport"
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
	snapItemLvl,
	ExternalImportResult,
} from "./importExternal"

export function isNteWizBackup(data: unknown): data is NteWizBackup {
	if (typeof data !== "object" || data === null) return false

	const record = data as Record<string, unknown>

	return (
		typeof record.schema_version === "number" &&
		typeof record.analyst === "object" &&
		record.analyst !== null
	)
}

function mapNteWizStamina(profile?: NteWizProfile) {
	if (!profile) return null

	const patch: Partial<SettingsRecord["userdata"]> = {}

	if (typeof profile.city_stamina_current === "number") {
		patch["current-stamina"] = profile.city_stamina_current
	}
	if (typeof profile.city_stamina_max === "number") {
		patch["max-stamina"] = profile.city_stamina_max
	}
	if (typeof profile.stamina_current === "number") {
		patch["current-pixels"] = profile.stamina_current
	}
	if (typeof profile.stamina_max === "number") {
		patch["max-pixels"] = profile.stamina_max
	}
	if (typeof profile.stamina_last_seen === "string") {
		const parsed = Date.parse(profile.stamina_last_seen)
		if (!Number.isNaN(parsed)) patch["pixels-last-edited"] = parsed
	}

	return Object.keys(patch).length > 0 ? patch : null
}

// Unlike NTE Planner, NTEWiz's ascension_phase (0-6, surfaced here as
// currentAscension/goalAscension) counts how many of chiz-pink's six
// ascendable breakpoints (20/30/40/50/60/70) have actually been passed, so
// it can be trusted directly instead of guessing from the raw level alone.
const ASCENSION_BREAKPOINTS = [20, 30, 40, 50, 60, 70] as const

function snapAscensionLevel(level: number, ascensionPhase: number): EnumItemLvls {
	const phase = Math.max(0, Math.min(6, Math.round(ascensionPhase)))

	if (phase === 0) {
		return level >= 20 ? EnumItemLvls.Lvl20 : EnumItemLvls.Lvl1
	}

	const lower = ASCENSION_BREAKPOINTS[phase - 1]
	const upper = phase < 6 ? ASCENSION_BREAKPOINTS[phase] : 80

	return (level >= upper ? upper : lower + 1) as EnumItemLvls
}

const DIRECT_SKILL_KEY_MAP: Partial<Record<keyof CharacterAbilitySet, string>> = {
	basicAttack: "basic-attack",
	skill: "skill",
	ultimate: "ultimate",
	support: "support-skill",
}
const PASSIVE_KEYS: (keyof CharacterAbilitySet)[] = [
	"passive1",
	"passive2",
	"passive3",
]
const LIFE_SKILL_KEYS: (keyof CharacterAbilitySet)[] = ["lifeSkill1", "lifeSkill2"]

function readTalentValue(
	talents: NteWizTalents | undefined,
	key: keyof NteWizTalents
): number | undefined {
	const value = talents?.[key]
	return typeof value === "number" ? value : undefined
}

// chiz-pink splits passives into passive1/passive2 (each capped at level 1)
// and life skills into lifeSkill1/lifeSkill2, while NTEWiz collapses each
// pair into a single "passive"/"life-skill" count. This is an inferred
// best-effort split, not a confirmed schema: a passive count of N unlocks
// the first N passive slots, and life-skill points fill lifeSkill1 up to
// its cap before spilling into lifeSkill2.
function distributeAcrossKeys(
	base: CharacterRecord["abilitySet"],
	keys: (keyof CharacterAbilitySet)[],
	total: number | undefined
): Partial<Record<keyof CharacterAbilitySet, number>> {
	if (total === undefined) return {}

	let remaining = total
	const allocation: Partial<Record<keyof CharacterAbilitySet, number>> = {}

	for (const key of keys) {
		const cap = base[key]?.targetLvl
		if (cap === undefined) continue

		const allocated = Math.max(0, Math.min(remaining, cap))
		allocation[key] = allocated
		remaining -= allocated
	}

	return allocation
}

function buildNteWizAbilitySet(
	id: string,
	talentsCurrent: NteWizTalents | undefined,
	talentsGoal: NteWizTalents | undefined
): CharacterRecord["abilitySet"] {
	const base = generateNewCharacter(id).abilitySet
	const abilitySet = { ...base }

	const currentPassives = distributeAcrossKeys(
		base,
		PASSIVE_KEYS,
		readTalentValue(talentsCurrent, "passive")
	)
	const targetPassives = distributeAcrossKeys(
		base,
		PASSIVE_KEYS,
		readTalentValue(talentsGoal, "passive")
	)
	const currentLifeSkills = distributeAcrossKeys(
		base,
		LIFE_SKILL_KEYS,
		readTalentValue(talentsCurrent, "life-skill")
	)
	const targetLifeSkills = distributeAcrossKeys(
		base,
		LIFE_SKILL_KEYS,
		readTalentValue(talentsGoal, "life-skill")
	)

	for (const key of Object.keys(base) as (keyof CharacterAbilitySet)[]) {
		const original = base[key]
		if (!original) continue

		const cap = original.targetLvl
		const directKey = DIRECT_SKILL_KEY_MAP[key]

		let currentOverride: number | undefined
		let targetOverride: number | undefined

		if (directKey) {
			currentOverride = readTalentValue(
				talentsCurrent,
				directKey as keyof NteWizTalents
			)
			targetOverride = readTalentValue(
				talentsGoal,
				directKey as keyof NteWizTalents
			)
		} else if (key in currentPassives || key in targetPassives) {
			currentOverride = currentPassives[key]
			targetOverride = targetPassives[key]
		} else if (key in currentLifeSkills || key in targetLifeSkills) {
			currentOverride = currentLifeSkills[key]
			targetOverride = targetLifeSkills[key]
		}

		if (currentOverride === undefined && targetOverride === undefined) continue

		abilitySet[key] = {
			isDisabled: false,
			currentLvl:
				currentOverride === undefined
					? original.currentLvl
					: Math.min(Math.max(currentOverride, 0), cap),
			targetLvl:
				targetOverride === undefined
					? original.targetLvl
					: Math.min(Math.max(targetOverride, 0), cap),
		}
	}

	return abilitySet
}

export function mapNteWizCharacter(
	analystChar: NteWizAnalystCharacter,
	talentsCurrent: NteWizTalents | undefined,
	talentsGoal: NteWizTalents | undefined
): Omit<CharacterRecord, "requiredMaterials" | "isDisabled"> | null {
	const id = kebabToSnake(analystChar.slug)
	if (!findCharacter(id)) return null

	const currentLvl = snapAscensionLevel(
		analystChar.currentLevel,
		analystChar.currentAscension
	)
	const targetLvl = snapAscensionLevel(
		analystChar.goalLevel ?? analystChar.currentLevel,
		analystChar.goalAscension ?? analystChar.currentAscension
	)

	return {
		id,
		currentLvl,
		targetLvl: Math.max(currentLvl, targetLvl) as EnumItemLvls,
		abilitySet: buildNteWizAbilitySet(id, talentsCurrent, talentsGoal),
		awakening: analystChar.currentAwakening ?? 0,
	}
}

export function mapNteWizArc(
	analystWeapon: NteWizAnalystWeapon
): Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled"> | null {
	const id = kebabToSnake(analystWeapon.slug)
	if (!findArc(id)) return null

	// NTEWiz doesn't report an ascension phase for weapons, so this falls
	// back to the same level-only heuristic used for NTE Planner arcs.
	const currentLvl = snapItemLvl(analystWeapon.currentLevel)
	const targetLvl = snapItemLvl(analystWeapon.goalLevel ?? analystWeapon.currentLevel)

	return {
		id,
		currentLvl,
		targetLvl: Math.max(currentLvl, targetLvl) as EnumItemLvls,
	}
}

export function parseNteWizImport(data: NteWizBackup): ExternalImportResult {
	const rawInventory: Record<string, unknown> = {
		...(data.currencies ?? {}),
		...(data.inventory ?? {}),
	}
	delete rawInventory.id

	const { matched: inventory, unmatched: unmatchedMaterials } =
		mapMaterialAmounts(rawInventory)

	const staminaPatch = mapNteWizStamina(data.profile)

	const characters: ImportedCharacter[] = []
	const skippedCharacterIds: string[] = []

	for (const analystChar of data.analyst?.characters ?? []) {
		if (!analystChar.owned) continue

		const talentsCurrent = data.characters?.[analystChar.slug]?.talents
		const talentsGoal = data.goals?.[analystChar.slug]?.talents

		const mapped = mapNteWizCharacter(analystChar, talentsCurrent, talentsGoal)

		if (mapped) {
			characters.push({ id: mapped.id, character: mapped })
		} else {
			skippedCharacterIds.push(analystChar.slug)
		}
	}

	const arcs: ImportedArc[] = []
	const skippedArcIds: string[] = []

	for (const analystWeapon of data.analyst?.weapons ?? []) {
		if (!analystWeapon.owned) continue

		const mapped = mapNteWizArc(analystWeapon)

		if (mapped) {
			arcs.push({ id: mapped.id, arc: mapped })
		} else {
			skippedArcIds.push(analystWeapon.slug)
		}
	}

	return {
		source: "NTEWiz",
		inventory,
		unmatchedMaterials,
		staminaPatch,
		characters,
		skippedCharacterIds,
		arcs,
		skippedArcIds,
		hasActivitiesData: Array.isArray(data.checklist) && data.checklist.length > 0,
		hasEventsData: false,
	}
}
