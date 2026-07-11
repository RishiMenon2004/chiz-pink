"use client"

import type { Material } from "@/types/item"
import type {
	FilterByType,
	FilterRarityType,
	SortByType,
} from "@/types/inventory"

import { getInventoryMaterials } from "@/data/items"
import { EnumMaterialType } from "@/data/items/materials"

import { useInventoryStore, usePlannerStore } from "@/hooks"
import { getAggregatedMaterials } from "./usePlannerStore"

export function useInventoryFilters(
	filter: FilterByType,
	rarity: FilterRarityType,
	sorting: SortByType,
	sortReverse: boolean
) {
	const { inventory } = useInventoryStore()
	const { plannerData } = usePlannerStore()
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
			const agregatedMaterials = getAggregatedMaterials(plannerData)

			filteredInventoryList = cachedInventoryList.filter((material) => {
				return Object.keys(agregatedMaterials).includes(material.id)
			})
			break
		}

		case "acquired": {
			const agregatedMaterials = getAggregatedMaterials(plannerData)

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
			const agregatedMaterials = getAggregatedMaterials(plannerData)

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
