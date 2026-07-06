import { Item } from "./item"

import { EnumItemLvls } from "@/data/items"

interface SkillLvl {
	currentLvl: number
	targetLvl: number
}

export interface CharacterRecord extends Pick<Item, "id"> {
	currentLvl: EnumItemLvls
	targetLvl: EnumItemLvls
	abilitySet: {
		basicAttack: SkillLvl
		skill: SkillLvl
		ultimate: SkillLvl
		support: SkillLvl
		passive1: SkillLvl
		passive2?: SkillLvl
		passive3?: SkillLvl
		lifeSkill1: SkillLvl
		lifeSkill2?: SkillLvl
	}
	awakening: number
	requiredMaterials: {
		id: string
		amount: number
	}[]
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

export type PlannerRecord = {
	arcs: Record<string, WeaponRecord>
	characters: Record<string, CharacterRecord>
}

export type AgregateMaterialsType = Record<
	string,
	{
		amount: number
		sources: string[]
	}
>
