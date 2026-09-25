import { Item } from "./item"

import { EnumItemLvls } from "@/data/items"

export interface SkillLvlRecord {
	isDisabled: boolean
	currentLvl: number
	targetLvl: number
}

export interface CharacterRecord extends Pick<Item, "id"> {
	currentLvl: EnumItemLvls
	targetLvl: EnumItemLvls
	isDisabled: boolean
	abilitySet: {
		basicAttack: SkillLvlRecord
		skill: SkillLvlRecord
		ultimate: SkillLvlRecord
		support: SkillLvlRecord
		passive1: SkillLvlRecord
		passive2: SkillLvlRecord
		passive3?: SkillLvlRecord
		lifeSkill1: SkillLvlRecord
		lifeSkill2?: SkillLvlRecord
	}
	awakening: number
	requiredMaterials: {
		id: string
		amount: number
	}[]
}

export type CharacterMaterialCosts = {
	fons: number
	dreamlessSeed: number
	beetleCoin: number
	bossMaterial: number
	exp: { common: number; uncommon: number; rare: number }
	ascMaterial: { common: number; uncommon: number; rare: number }
	talentMaterial: { common: number; uncommon: number; rare: number }
	talentBossMaterial: number
}
export interface WeaponRecord extends Pick<Item, "id"> {
	uid: string
	currentLvl: EnumItemLvls
	targetLvl: EnumItemLvls
	isDisabled: boolean
	requiredMaterials: {
		id: string
		amount: number
	}[]
}

export type WeaponMaterialsCost = {
	beetleCoin: number
	exp: { common: number; uncommon: number; rare: number }
	ascMaterial1: { common: number; uncommon: number; rare: number }
	ascMaterial2: { common: number; uncommon: number; rare: number }
}

export type PlannerRecord = {
	arcs: Record<string, WeaponRecord>
	characters: Record<string, CharacterRecord>
}

// Three independent orderings, one per planner view, stored together under
// a single `plannerOrder` records entry. They're independent arrays (not
// derived from one another) because the views can diverge item-by-item -
// hybrid interleaves both types, so filtering it down to one type after a
// hybrid-mode reorder doesn't losslessly recover what a split-mode drag
// would have produced, and vice versa. See usePlannerItems.tsx for how an
// edit to one ripples into the others.
export type PlannerOrderRecord = {
	hybrid: string[]
	characters: string[]
	arcs: string[]
}

export type PlannerItemType = "character" | "weapon"

// The `planner` IndexedDB store keeps one row per character/weapon instead
// of nesting both collections inside a single { arcs, characters } blob -
// addCharacter/updateCharacter/deleteCharacter only ever touch `characters`
// and addWeapon/updateWeapon/deleteWeapon only ever touch `arcs`, one item
// at a time, so a combined blob meant every character edit also rewrote the
// entire (unrelated) arcs collection alongside it.
//
// itemType + refId is a compound primary key rather than reusing the raw
// id/uid directly - character ids (catalog slugs like "linko") and weapon
// uids (crypto.randomUUID()) live in genuinely different namespaces that
// shouldn't be assumed distinct just because a collision hasn't happened.
export type StoredPlannerCharacter = {
	itemType: "character"
	refId: string
	data: CharacterRecord
}

export type StoredPlannerWeapon = {
	itemType: "weapon"
	refId: string
	data: WeaponRecord
}

export type StoredPlannerItem = StoredPlannerCharacter | StoredPlannerWeapon

export type AggregateMaterial = {
	amount: number
	sources: Record<string, number>
}

export type AggregateMaterialsType = Record<string, AggregateMaterial>
