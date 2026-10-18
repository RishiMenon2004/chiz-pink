import { Item, Material, MaterialSet } from "./item"

import type { EnumRarity } from "@/data/items/item"
import type { EnumArcType } from "@/data/arcs/arc"
import type { EnumCharacterElement } from "@/data/characters/character"

export type AbilityDescription = {
	section?: string
	description: string
}

export type Ability = {
	name: string
	description: AbilityDescription[]
	maxLvl: number
}

export type CharacterAbilitySet = {
	basicAttack: Ability
	skill: Ability
	ultimate: Ability
	support: Ability
	passive1: Ability
	passive2: Ability
	passive3?: Ability
	lifeSkill1: Ability
	lifeSkill2?: Ability
}

export interface Character extends Item {
	description: string
	rarity: EnumRarity.Rare | EnumRarity.Epic
	element: EnumCharacterElement
	arcType: EnumArcType
	abilities: CharacterAbilitySet
	ascensionMaterialSet: MaterialSet
	ascensionBossMaterial: Material
	talentMaterialSet: MaterialSet
	talentBossMaterial: Material
}
