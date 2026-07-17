import { EnumMaterialType, EnumRarity } from "@/data/items"

export interface Item {
	isFeatured?: boolean
	isPreview?: boolean
	id: string
	name: string
	description?: string
	rarity: EnumRarity
	imageSrc: string
}

export interface Material extends Item {
	materialType: EnumMaterialType
	sources: string[]
	linkedMaterials?: string[]
}

export type MaterialSet = readonly [Material, Material, Material]

export type DescriptionValuesRecord = Record<number, DescriptionValueType[]>

export type DescriptionValueType = { type: "Integer" | "Percent"; value: number }
