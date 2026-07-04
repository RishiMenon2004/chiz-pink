"use client"

import {
	InventoryFilter,
	InventoryRarityFilter,
	InventorySort,
} from "@/database/inventory/inventoryFilters"
import { getInventoryMaterials } from "@/database/items"
import { EnumMaterialType, Material } from "@/database/items/materials"
import { useInventoryStore, usePlannerStore } from "@/hooks"

export function useInventoryFilters({
	filter,
	rarity,
	sorting,
	sortReverse,
}: {
	filter: InventoryFilter
	rarity: InventoryRarityFilter
	sorting: InventorySort
	sortReverse: boolean
}) {
	const { inventory } = useInventoryStore()
	const { getAgregatedMaterials } = usePlannerStore()
	const cachedInventoryList: Material[] = Object.values(getInventoryMaterials())
	let filteredInventoryList = cachedInventoryList
	let rarityFilteredInventoryList = filteredInventoryList
	let sortedInventoryList = filteredInventoryList

	switch (filter) {
		case "default": {
			filteredInventoryList = cachedInventoryList
			break
		}

		case "required": {
			const agregatedMaterials = getAgregatedMaterials()

			filteredInventoryList = cachedInventoryList.filter((material) => {
				return Object.keys(agregatedMaterials).includes(material.id)
			})
			break
		}

		case "acquired": {
			const agregatedMaterials = getAgregatedMaterials()

			filteredInventoryList = cachedInventoryList.filter((material) => {
				const matAgr = agregatedMaterials[material.id]
				if (matAgr) {
					return inventory[material.id] >= matAgr.amount
				}
				return false
			})
			break
		}

		case "owned": {
			filteredInventoryList = cachedInventoryList.filter((material) => {
				return (inventory[material.id] || 0) > 0
			})
			break
		}

		default: {
			filteredInventoryList = cachedInventoryList.filter(
				(material) => material.materialType === filter
			)
			break
		}
	}

	switch (rarity) {
		case "default": {
			rarityFilteredInventoryList = filteredInventoryList
			break
		}

		default: {
			rarityFilteredInventoryList = filteredInventoryList.filter(
				(material) => material.rarity.toString() === rarity.toString()
			)
			break
		}
	}

	switch (sorting) {
		case "alphabetical": {
			sortedInventoryList = rarityFilteredInventoryList.toSorted((a, b) =>
				a.id.localeCompare(b.id)
			)
			break
		}

		case "required": {
			const agregatedMaterials = getAgregatedMaterials()

			sortedInventoryList = rarityFilteredInventoryList.toSorted((a, b) => {
				const aAgr = agregatedMaterials[a.id]
				const bAgr = agregatedMaterials[b.id]

				let aRequired = 0
				let bRequired = 0

				if (aAgr) {
					aRequired = Math.max(aAgr.amount - (inventory[a.id] || 0), 0)
				}

				if (bAgr) {
					bRequired = Math.max(bAgr.amount - (inventory[b.id] || 0), 0)
				}

				return bRequired - aRequired
			})
			break
		}
		case "owned": {
			sortedInventoryList = rarityFilteredInventoryList.toSorted(
				(a, b) => (inventory[b.id] || 0) - (inventory[a.id] || 0)
			)
			break
		}

		case "type": {
			const types = Object.values(EnumMaterialType)
			sortedInventoryList = rarityFilteredInventoryList.toSorted(
				(a, b) =>
					types.indexOf(a.materialType) - types.indexOf(b.materialType)
			)
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
