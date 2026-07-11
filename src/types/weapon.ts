import { Item, MaterialSet } from "./item"

import { EnumRarity, EnumStatAttribute } from "@/data/items"
import { EnumArcType } from "@/data/arcs"

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

export interface Arc extends Item {
	isFeatured?: boolean
	isPreview?: boolean
	rarity: EnumRarity.Uncommon | EnumRarity.Rare | EnumRarity.Epic
	type: EnumArcType
	baseAtk: number
	mainAttribute: MainAttrInfo
	ascensionMaterial1: MaterialSet
	ascensionMaterial2: MaterialSet
	effect: {
		name: string
		description: string[]
		values?: Record<
			EnumArcTiers,
			{ type: "Integer" | "Percent"; value: number }[]
		>
	}
}
