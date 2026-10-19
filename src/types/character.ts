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

// Base stats, one entry per planner level step (1, 20, 20+, ... 80), in
// EnumItemLvls order.
export type CharacterLevelStats = {
	hp: number[]
	atk: number[]
	def: number[]
}

export interface Character extends Item {
	// Announced but kit unknown: abilities, arc type and materials are
	// stand-ins. Hidden from the planner; the profile shows a TBD notice.
	isPlaceholder?: boolean
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
