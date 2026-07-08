import { Item, MaterialSet } from "./item"

import { EnumRarity, EnumStatAttribute } from "@/data/items"
import { EnumArcType } from "@/data/arcs"

type MainAttrInfo = {
	attribute: EnumStatAttribute
	baseValue: number
}

export interface Arc extends Item {
	rarity: EnumRarity.Uncommon | EnumRarity.Rare | EnumRarity.Epic
	type: EnumArcType
	baseAtk: number
	mainAttribute: MainAttrInfo
	ascensionMaterial1: MaterialSet
	ascensionMaterial2: MaterialSet
}