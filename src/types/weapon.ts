import { DescriptionValuesRecord, Item, MaterialSet } from "./item"

import type { EnumRarity, EnumStatAttribute } from "@/data/items/item"
import type { EnumArcType } from "@/data/arcs/arc"

type MainAttrInfo = {
	attribute: EnumStatAttribute
	baseValue: number
}

export enum EnumArcTiers {
	Tier1 = 1,
	Tier2 = 2,
	Tier3 = 3,
	Tier4 = 4,
	Tier5 = 5,
}

// One entry per planner level step (1, 20, 20+, ... 80), in EnumItemLvls
// order.
export type ArcLevelStats = {
	atk: number[]
	mainStat: number[]
}

export interface Arc extends Item {
	// Announced but stats unknown: base ATK, main stat and materials are
	// stand-ins until the global release. Hidden from the planner; the
	// profile shows TBD stats.
	isPlaceholder?: boolean
	rarity: EnumRarity.Uncommon | EnumRarity.Rare | EnumRarity.Epic
	type: EnumArcType
	baseAtk: number
	mainAttribute: MainAttrInfo
	ascensionMaterialSet1: MaterialSet
	ascensionMaterialSet2: MaterialSet
	effect: {
		name: string
		description: string
		values: DescriptionValuesRecord
	}
}
