import { EnumMaterialType, EnumRarity } from "@/data/items"

export type Inventory = Record<string, number>

// The `inventory` IndexedDB store keeps one row per material instead of a
// single Record<id, amount> blob, so a single-material update (the common
// case - a stepper click, a currency edit) only touches the row that
// changed instead of rewriting the whole collection.
export type StoredInventoryItem = {
	id: string
	amount: number
}

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
