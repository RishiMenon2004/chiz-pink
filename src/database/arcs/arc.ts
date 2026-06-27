import Item, { EnumRarity, EnumStatAttribute } from "@/database/item"
import { MaterialSet } from "../materials"

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
	ascensionMaterial1: MaterialSet
	ascensionMaterial2: MaterialSet
	effect: {
		name: string
		description: string
	}
}
