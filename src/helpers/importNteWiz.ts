import { CharacterRecord, WeaponRecord } from "@/types/planner"
import { CharacterAbilitySet } from "@/types/character"
import {
	NteWizAnalystCharacter,
	NteWizAnalystWeapon,
	NteWizCharacterState,
	NteWizGoalState,
	NteWizImportData,
	NteWizInventoryRow,
	NteWizProfile,
	NteWizTalents,
	NteWizWeaponGoalState,
	NteWizWeaponState,
	NteWizWish,
} from "@/types/nteWizImport"
import { BannerType, MiracleBoxPull, ScarboroughFairPull } from "@/types/pulls"
import { SettingsRecord } from "@/types/settings"

import { EnumItemLvls, EnumRarity, findReward, findRewardByName } from "@/data/items"
import { findCharacter, findCharacterByName } from "@/data/characters"
import { findArc, findArcByName } from "@/data/arcs"

import { generateNewCharacter } from "./generateNewCharacter"
import {
	ExternalImportResult,
	ImportedArc,
	ImportedCharacter,
	ImportedPullsByBanner,
	kebabToSnake,
	mapMaterialAmounts,
	maxItemLvl,
	snapItemLvl,
} from "./importExternal"
import { poolIdForBanner } from "./pullBanner"

// NTEWiz character slugs that differ from chiz-pink's character IDs.
const NTEWIZ_CHARACTER_ALIASES: Record<string, string> = {
	"akane-rin": "akane",
	"esper-zero": "zero",
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isNteWizBackup(data: unknown): data is NteWizImportData {
	if (!isPlainObject(data)) return false

	if (data.source === "ntewiz-idb") return true

	if (typeof data.schema_version === "number") {
		const hasAnalyst = isPlainObject(data.analyst)
		const hasNativeStores =
			isPlainObject(data.characters) ||
			isPlainObject(data.inventory) ||
			Array.isArray(data.wishes)
		return hasAnalyst || hasNativeStores
	}

	return false
}

function resolveNteWizCharacterId(slug: string): string {
	const aliased = NTEWIZ_CHARACTER_ALIASES[slug.toLowerCase()]
	if (aliased) return aliased
	return kebabToSnake(slug)
}

function pickSingleton<T>(value: T | T[] | undefined): T | undefined {
	if (Array.isArray(value)) return value[0]
	return value
}

function toSlugMap<T extends { slug?: string }>(
	input: T[] | Record<string, T> | undefined
): Record<string, T> {
	if (!input) return {}
	if (!Array.isArray(input)) return input

	const map: Record<string, T> = {}
	for (const row of input) {
		if (row && typeof row.slug === "string" && row.slug.length > 0) {
			map[row.slug] = row
		}
	}
	return map
}

function toRawInventoryMap(
	inventory: NteWizInventoryRow[] | Record<string, unknown> | undefined,
	currencies: Record<string, unknown> | Record<string, unknown>[] | undefined
): Record<string, unknown> {
	const currencyObj = pickSingleton(currencies)
	const raw: Record<string, unknown> = {
		...(isPlainObject(currencyObj) ? currencyObj : {}),
	}

	if (Array.isArray(inventory)) {
		for (const row of inventory) {
			if (row && typeof row.slug === "string" && typeof row.qty === "number") {
				raw[row.slug] = row.qty
			}
		}
	} else if (isPlainObject(inventory)) {
		Object.assign(raw, inventory)
	}

	delete raw.id
	return raw
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
const ASCENSION_RANGES: readonly (readonly [EnumItemLvls, EnumItemLvls])[] = [
	[EnumItemLvls.Lvl20A, EnumItemLvls.Lvl30],
	[EnumItemLvls.Lvl30A, EnumItemLvls.Lvl40],
	[EnumItemLvls.Lvl40A, EnumItemLvls.Lvl50],
	[EnumItemLvls.Lvl50A, EnumItemLvls.Lvl60],
	[EnumItemLvls.Lvl60A, EnumItemLvls.Lvl70],
	[EnumItemLvls.Lvl70A, EnumItemLvls.Lvl80],
]

function snapAscensionLevel(level: number, ascensionPhase: number): EnumItemLvls {
	const phase = Number.isFinite(ascensionPhase)
		? Math.max(0, Math.min(6, Math.round(ascensionPhase)))
		: 0

	if (phase === 0) {
		return level >= 20 ? EnumItemLvls.Lvl20 : EnumItemLvls.Lvl1
	}

	const [ascended, upper] = ASCENSION_RANGES[phase - 1]
	return level >= upper ? upper : ascended
}

const DIRECT_SKILL_KEY_MAP: Partial<
	Record<keyof CharacterAbilitySet, keyof NteWizTalents>
> = {
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
			currentOverride = readTalentValue(talentsCurrent, directKey)
			targetOverride = readTalentValue(talentsGoal, directKey)
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
	const id = resolveNteWizCharacterId(analystChar.slug)
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
		targetLvl: maxItemLvl(currentLvl, targetLvl),
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
		targetLvl: maxItemLvl(currentLvl, targetLvl),
	}
}

function buildAnalystCharactersFromNative(
	charactersMap: Record<string, NteWizCharacterState>,
	goalsMap: Record<string, NteWizGoalState>
): NteWizAnalystCharacter[] {
	return Object.entries(charactersMap).map(([slug, state]) => {
		const goal = goalsMap[slug]
		return {
			slug,
			owned: Boolean(state.owned),
			currentLevel: typeof state.level === "number" ? state.level : 1,
			currentAscension:
				typeof state.ascension_phase === "number" ? state.ascension_phase : 0,
			currentAwakening:
				typeof state.awakening_rank === "number" ? state.awakening_rank : 0,
			goalLevel: typeof goal?.level === "number" ? goal.level : null,
			goalAscension:
				typeof goal?.ascension_phase === "number" ? goal.ascension_phase : null,
			goalAwakening:
				typeof goal?.awakening_rank === "number" ? goal.awakening_rank : null,
		}
	})
}

function buildAnalystWeaponsFromNative(
	weaponsMap: Record<string, NteWizWeaponState>,
	weaponGoalsMap: Record<string, NteWizWeaponGoalState>
): NteWizAnalystWeapon[] {
	return Object.entries(weaponsMap).map(([slug, state]) => {
		const goal = weaponGoalsMap[slug]
		return {
			slug,
			owned: Boolean(state.owned),
			currentLevel: typeof state.level === "number" ? state.level : 1,
			goalLevel: typeof goal?.level === "number" ? goal.level : null,
		}
	})
}

function parseWishRarity(rarity: string | undefined): EnumRarity | null {
	switch (rarity?.toUpperCase()) {
		case "B":
			return EnumRarity.Uncommon
		case "A":
			return EnumRarity.Rare
		case "S":
			return EnumRarity.Epic
		default:
			return null
	}
}

function parseWishResultType(
	kind: string | null | undefined
): ScarboroughFairPull["resultType"] {
	switch (kind) {
		case "points_gift":
		case "pointsGift":
			return "pointsGift"
		case "slumberland":
		case "chase_reward":
			return "slumberland"
		default:
			return "dice"
	}
}

function parseWishBanner(banner: string): {
	bannerType: BannerType
	poolId?: string
} {
	const normalized = banner.trim().toLowerCase()
	if (normalized === "standard" || normalized === "permanent") {
		return {
			bannerType: "permanentBanner",
			poolId: poolIdForBanner("permanentBanner", undefined),
		}
	}

	const arcMatch = normalized.match(/^([a-z0-9-]+?)-arc(?:-|$)/)
	if (arcMatch) {
		const character = resolveNteWizCharacterId(arcMatch[1])
		return {
			bannerType: "arcsBanner",
			poolId: poolIdForBanner("arcsBanner", { character }),
		}
	}

	const charSlug = normalized.replace(/-v\d.*$/, "")
	const character = resolveNteWizCharacterId(charSlug)
	return {
		bannerType: "limitedBanner",
		poolId: poolIdForBanner("limitedBanner", { rateupItem: character }),
	}
}

function resolveWishItem(
	rawItem: string,
	bannerType: BannerType
): {
	rewardId: string
	rewardType: ScarboroughFairPull["rewardType"]
	rarity?: EnumRarity
} {
	const trimmed = rawItem.trim()
	const snake = kebabToSnake(trimmed)

	if (bannerType === "arcsBanner") {
		const arc = findArc(snake) ?? findArcByName(trimmed)
		return {
			rewardId: arc?.id ?? trimmed,
			rewardType: "arc",
			rarity: arc?.rarity,
		}
	}

	const characterId = resolveNteWizCharacterId(trimmed)
	const character = findCharacter(characterId) ?? findCharacterByName(trimmed)
	if (character) {
		return {
			rewardId: character.id,
			rewardType: "character",
			rarity: character.rarity,
		}
	}

	// NTEWiz stores arcs as kebab-case slugs ("clear-skies") and cosmetics/items
	// as title-case display names ("Clear Skies", "Warp Piece", "Day Adrift").
	// Checking lowercase slug arcs first avoids colliding with same-named outfits.
	const isSlugLike = trimmed === trimmed.toLowerCase() && !trimmed.includes(" ")
	if (isSlugLike) {
		const arc = findArc(snake)
		if (arc) {
			return {
				rewardId: arc.id,
				rewardType: "arc",
				rarity: arc.rarity,
			}
		}
	}

	const reward = findRewardByName(trimmed) ?? findReward(snake)
	if (reward) {
		return {
			rewardId: reward.id,
			rewardType: reward.imageSrc.includes("cosmetics/") ? "cosmetic" : "item",
			rarity: reward.rarity,
		}
	}

	const arcByName = findArc(snake) ?? findArcByName(trimmed)
	if (arcByName) {
		return {
			rewardId: arcByName.id,
			rewardType: "arc",
			rarity: arcByName.rarity,
		}
	}

	return {
		rewardId: trimmed,
		rewardType: "item",
	}
}

function parseWishTimestamp(pulledAt: string | number | undefined): number | null {
	if (typeof pulledAt === "number" && Number.isFinite(pulledAt)) {
		return pulledAt
	}
	if (typeof pulledAt === "string" && pulledAt.trim().length > 0) {
		const parsed = Date.parse(pulledAt)
		if (!Number.isNaN(parsed)) return parsed
	}
	return null
}

function parseNteWizWishes(wishes: NteWizWish[] | undefined): {
	pulls?: ImportedPullsByBanner
	skippedPullsCount: number
} {
	if (!Array.isArray(wishes) || wishes.length === 0) {
		return { skippedPullsCount: 0 }
	}

	type NormalizedWish = {
		bannerType: BannerType
		timestamp: number
		id: number
		index: number
		pull: MiracleBoxPull | ScarboroughFairPull
	}

	const parsed: NormalizedWish[] = []
	let skippedPullsCount = 0

	for (let index = 0; index < wishes.length; index++) {
		const wish = wishes[index]
		if (!wish || typeof wish.banner !== "string" || typeof wish.item !== "string") {
			skippedPullsCount++
			continue
		}

		const timestamp = parseWishTimestamp(wish.pulled_at)
		if (timestamp === null) {
			skippedPullsCount++
			continue
		}

		const { bannerType, poolId } = parseWishBanner(wish.banner)
		const resolved = resolveWishItem(wish.item, bannerType)
		const rank =
			parseWishRarity(wish.rarity) ?? resolved.rarity ?? EnumRarity.Uncommon
		const uid =
			typeof wish.uid === "string" && wish.uid.trim().length > 0
				? wish.uid.trim()
				: `ntewiz-${bannerType}-${wish.id ?? index}-${timestamp}-${resolved.rewardId}`

		if (bannerType === "arcsBanner") {
			const pull: MiracleBoxPull = {
				uid,
				timestamp,
				rank,
				rewardId: resolved.rewardId,
				...(poolId ? { poolId } : {}),
			}
			parsed.push({
				bannerType,
				timestamp,
				id: typeof wish.id === "number" ? wish.id : index,
				index,
				pull,
			})
		} else {
			const pull: ScarboroughFairPull = {
				uid,
				timestamp,
				rank,
				rewardId: resolved.rewardId,
				...(poolId ? { poolId } : {}),
				resultType: parseWishResultType(wish.kind),
				rewardType: resolved.rewardType,
				quantity: 0,
			}
			parsed.push({
				bannerType,
				timestamp,
				id: typeof wish.id === "number" ? wish.id : index,
				index,
				pull,
			})
		}
	}

	// Chiz.Pink expects pulls newest-first; within a shared timestamp, NTEWiz's
	// ascending auto-increment `id` is chronological (oldest-first), so higher
	// `id` is newer.
	parsed.sort((a, b) => {
		if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp
		if (a.id !== b.id) return b.id - a.id
		return b.index - a.index
	})

	const pulls: ImportedPullsByBanner = {
		arcsBanner: [],
		limitedBanner: [],
		permanentBanner: [],
	}

	for (const entry of parsed) {
		if (entry.bannerType === "arcsBanner") {
			pulls.arcsBanner.push(entry.pull as MiracleBoxPull)
		} else if (entry.bannerType === "limitedBanner") {
			pulls.limitedBanner.push(entry.pull as ScarboroughFairPull)
		} else {
			pulls.permanentBanner.push(entry.pull as ScarboroughFairPull)
		}
	}

	const total =
		pulls.arcsBanner.length +
		pulls.limitedBanner.length +
		pulls.permanentBanner.length

	return {
		pulls: total > 0 ? pulls : undefined,
		skippedPullsCount,
	}
}

export function parseNteWizImport(data: NteWizImportData): ExternalImportResult {
	const rawInventory = toRawInventoryMap(data.inventory, data.currencies)
	const { matched: inventory, unmatched: unmatchedMaterials } =
		mapMaterialAmounts(rawInventory)

	const staminaPatch = mapNteWizStamina(pickSingleton(data.profile))

	const charactersMap = toSlugMap(data.characters)
	const goalsMap = toSlugMap(data.goals)
	const weaponsMap = toSlugMap(data.weapons)
	const weaponGoalsMap = toSlugMap(data.weapon_goals)

	const analyst =
		"analyst" in data && isPlainObject(data.analyst) ? data.analyst : undefined
	const analystCharacters = Array.isArray(analyst?.characters)
		? (analyst.characters as NteWizAnalystCharacter[])
		: buildAnalystCharactersFromNative(charactersMap, goalsMap)
	const analystWeapons = Array.isArray(analyst?.weapons)
		? (analyst.weapons as NteWizAnalystWeapon[])
		: buildAnalystWeaponsFromNative(weaponsMap, weaponGoalsMap)

	const characters: ImportedCharacter[] = []
	const skippedCharacterIds: string[] = []

	for (const analystChar of analystCharacters) {
		if (!analystChar.owned) continue

		const talentsCurrent = charactersMap[analystChar.slug]?.talents
		const talentsGoal = goalsMap[analystChar.slug]?.talents

		const mapped = mapNteWizCharacter(analystChar, talentsCurrent, talentsGoal)

		if (mapped) {
			characters.push({ id: mapped.id, character: mapped })
		} else {
			skippedCharacterIds.push(analystChar.slug)
		}
	}

	const arcs: ImportedArc[] = []
	const skippedArcIds: string[] = []

	for (const analystWeapon of analystWeapons) {
		if (!analystWeapon.owned) continue

		const mapped = mapNteWizArc(analystWeapon)

		if (mapped) {
			arcs.push({ id: mapped.id, arc: mapped })
		} else {
			skippedArcIds.push(analystWeapon.slug)
		}
	}

	const { pulls, skippedPullsCount } = parseNteWizWishes(data.wishes)

	return {
		source: "NTEWiz",
		inventory,
		unmatchedMaterials,
		staminaPatch,
		characters,
		skippedCharacterIds,
		arcs,
		skippedArcIds,
		pulls,
		skippedPullsCount,
		hasActivitiesData: Array.isArray(data.checklist) && data.checklist.length > 0,
		hasEventsData: false,
	}
}
