import Item, { EnumRarity, EnumStatAttribute } from "@/database/item"

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
	mainAttribute: MainAttrInfo
	effect: {
		name: string
		description: string
	}
}
