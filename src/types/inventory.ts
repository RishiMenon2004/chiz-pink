export type Inventory = Record<string, number>

export type CumulativeInventory = {
	[x: string]: { amount: number; craftedAmount?: number }
}

import { EnumRarity } from "@/data/items/item"
import { EnumMaterialType } from "@/data/items/materials"

export type FilterByType =
	| "default"
	| "owned"
	| "required"
	| "acquired"
	| EnumMaterialType

export type FilterRarityType = "default" | EnumRarity

export type GroupByType =
	| "default"
	| "type"
	| "rarity"
	| "owned"
	| "required"
	| "acquired"

export type SortByType =
	| "default"
	| "owned"
	| "required"
	| "type"
	| "alphabetical"
