"use client"

import { InventoryFilter, InventoryRarityFilter, InventorySort } from "@/database/inventoryFilters";
import { getInventoryList } from "@/database/materialLists";
import { EnumMaterialType, Material } from "@/database/materials";
import useInventoryStore from "@/hooks/useInventoryStore";

export default function useInventoryFilters({filter, rarity, sorting, sortReverse}: {filter: InventoryFilter, rarity: InventoryRarityFilter, sorting: InventorySort, sortReverse: boolean} ) {
	const { inventory } = useInventoryStore()
	const cachedInventoryList: Material[] = Object.values(getInventoryList())
	let filteredInventoryList = cachedInventoryList
	let rarityFilteredInventoryList = filteredInventoryList
	let sortedInventoryList = filteredInventoryList

	switch (filter) {
		case "default": {
			filteredInventoryList = cachedInventoryList
			break
		}

		case "required": //TODO: Add filter and sort after implementing planner
		case "acquired": //TODO: Add filter and grouping after implementing planner
		case "owned": {
			filteredInventoryList = cachedInventoryList.filter(material => {
				return (inventory[material.id] || 0) > 0
			})
			break
		}

		default: {
			filteredInventoryList = cachedInventoryList.filter(material => material.materialType === filter)
			break
		}
	}

	switch (rarity) {
		case "default": {
			rarityFilteredInventoryList = filteredInventoryList
			break
		}
		
		default: {
			rarityFilteredInventoryList = filteredInventoryList.filter(material => material.rarity.toString() === rarity.toString())
			break
		}
	}

	switch (sorting) {
		case "alphabetical": {
			sortedInventoryList = rarityFilteredInventoryList.toSorted((a, b) => a.id.localeCompare(b.id))
			break
		}

		case "required": //TODO: Add filter and sort after implementing planner
		case "owned": {
			sortedInventoryList = rarityFilteredInventoryList.toSorted((a, b) => (inventory[b.id] || 0) - (inventory[a.id] || 0))
			break
		}

		case "type": {
			const types = Object.values(EnumMaterialType)
			sortedInventoryList = rarityFilteredInventoryList.toSorted((a, b) => types.indexOf(a.materialType) - types.indexOf(b.materialType))
			console.log(sortedInventoryList.map(item => item.materialType))
			break
		}

		case "default":
		default: {
			sortedInventoryList = rarityFilteredInventoryList
			break
		}
	}

	if (sortReverse) {
		sortedInventoryList.reverse()
	}

	return sortedInventoryList
}