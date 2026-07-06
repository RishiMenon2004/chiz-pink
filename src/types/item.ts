import { EnumMaterialType, EnumRarity } from "@/data/items"

export interface Item {
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