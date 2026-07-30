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

export type HybridPlannerRecord = {
	order: string[]
}

export type AggregateMaterial = {
	amount: number
	sources: Record<string, number>
}

export type AggregateMaterialsType = Record<string, AggregateMaterial>
