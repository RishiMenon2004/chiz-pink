import { Item, EnumRarity, EnumStatAttribute, MaterialSet } from "@/database/items"

export enum EnumArcType {
	Solid = "Solid",
	Liquid = "Liquid",
	Gas = "Gas",
	Plasma = "Plasma",
	Condensate = "Condensate",
}

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
	effect: {
		name: string
		description: string
	}
}
