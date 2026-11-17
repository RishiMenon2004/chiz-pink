import type { EnumMaterialType, EnumRarity } from "@/data/items/item"

export interface Item {
	// Hand-set for content announced before its banner dates are known.
	// Featured status, and previews with a scheduled banner, come from the
	// banner data instead - see helpers/bannerStatus.ts.
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
	// Selection boxes: opening one grants `amount` of any one of these.
	selectionOptions?: SelectionOption[]
	// Cycle the options in a corner badge, for boxes that share one icon.
	showOptionsBadge?: boolean
}

export type SelectionOption = { id: string; amount: number }

export type MaterialSet = readonly [Material, Material, Material]

export type DescriptionValuesRecord = Record<number, DescriptionValueType[]>

export type DescriptionValueType = { type: "Integer" | "Percent"; value: number }
