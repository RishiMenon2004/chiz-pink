import { EnumRarity } from "@/data/items/item"
import { EnumMaterialType } from "@/data/items/materials"

export type InventoryFilter =
	| "default"
	| "owned"
	| "required"
	| "acquired"
	| EnumMaterialType

export type InventoryRarityFilter = "default" | EnumRarity

export type InventoryGroup =
	| "default"
	| "type"
	| "rarity"
	| "owned"
	| "required"
	| "acquired"

export type InventorySort =
	| "default"
	| "owned"
	| "required"
	| "type"
	| "alphabetical"
