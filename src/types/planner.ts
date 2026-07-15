import { Item } from "./item"

import { EnumItemLvls } from "@/data/items"

interface SkillLvlRecord {
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
		passive2?: SkillLvlRecord
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
