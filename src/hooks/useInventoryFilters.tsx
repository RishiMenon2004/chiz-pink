"use client"

import { useMemo } from "react"

import type { Material } from "@/types/item"
import type {
	FilterByType,
	FilterRarityType,
	SortByType,
} from "@/types/inventory"

import { EnumMaterialType, getInventoryMaterialsList } from "@/data/items"

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

	return useMemo(() => {
		const cachedInventoryList: Material[] = getInventoryMaterialsList()

		const needsAggregate =
			filter === "required" ||
			filter === "acquired" ||
			sorting === "required"
		const agregatedMaterials = needsAggregate
			? getAggregatedMaterials(plannerData)
			: null

		let filteredInventoryList = cachedInventoryList

		switch (filter) {
			case "default": {
				filteredInventoryList = cachedInventoryList
				break
			}

			case "required": {
				filteredInventoryList = cachedInventoryList.filter((material) => {
					return Object.keys(agregatedMaterials!).includes(material.id)
				})
				break
			}

			case "acquired": {
				filteredInventoryList = cachedInventoryList.filter((material) => {
					const matAgr = agregatedMaterials![material.id]
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

		let rarityFilteredInventoryList = filteredInventoryList

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

		let sortedInventoryList = rarityFilteredInventoryList

		switch (sorting) {
			case "alphabetical": {
				sortedInventoryList = rarityFilteredInventoryList.toSorted(
					(a, b) => a.id.localeCompare(b.id)
				)
				break
			}

			case "required": {
				sortedInventoryList = rarityFilteredInventoryList.toSorted(
					(a, b) => {
						const aAgr = agregatedMaterials![a.id]
						const bAgr = agregatedMaterials![b.id]

						let aRequired = 0
						let bRequired = 0

						if (aAgr) {
							aRequired = Math.max(
								aAgr.amount - (inventory[a.id] || 0),
								0
							)
						}

						if (bAgr) {
							bRequired = Math.max(
								bAgr.amount - (inventory[b.id] || 0),
								0
							)
						}

						return bRequired - aRequired
					}
				)
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
						types.indexOf(a.materialType) -
						types.indexOf(b.materialType)
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
			sortedInventoryList = [...sortedInventoryList].reverse()
		}

		return [...sortedInventoryList]
	}, [filter, rarity, sorting, sortReverse, inventory, plannerData])
}
