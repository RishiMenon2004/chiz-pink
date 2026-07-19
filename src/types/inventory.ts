import { EnumMaterialType, EnumRarity } from "@/data/items"

export type Inventory = Record<string, number>

export type CumulativeInventory = Record<
	string,
	{
		amount: number
		craftedAmount?: number
		craftedFrom?: { id: string; amount: number }[]
	}
>

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
