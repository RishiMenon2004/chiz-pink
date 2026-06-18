import { EnumMaterialType, EnumRarity } from "@/database/materials"

export type InventoryFilter = "Default" | "Required" | EnumRarity | EnumMaterialType

export type InventoryGroup = "Default" | "Type" | "Rarity"

export type inventorySort = "Default"