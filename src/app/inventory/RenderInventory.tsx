"use client"

import { useState } from "react"

import type {
	FilterByType,
	GroupByType,
	FilterRarityType,
	SortByType,
} from "@/types/inventory"

import { useInventoryStore } from "@/hooks"
import { InventoryFilterContext } from "@/contexts"
import { InfoBox } from "@/components/layout"
import { InventoryFilterToolbar, GroupedInventory } from "@/components/inventory"

import styles from "./page.module.css"

export default function RenderInventory() {
	const { inventory } = useInventoryStore()

	const doesInventoryExist = Object.entries(inventory).length > 0

	const [filter, setFilter] = useState<FilterByType>("default")
	const [rarityFilter, setRarityFilter] = useState<FilterRarityType>("default")
	const [grouping, setGrouping] = useState<GroupByType>("default")
	const [sorting, setSorting] = useState<SortByType>("default")
	const [sortReverse, setSortReverse] = useState<boolean>(false)

	const clearAllFilters = () => {
		setFilter("default")
		setRarityFilter("default")
	}

	return (
		<InventoryFilterContext.Provider
			value={{
				filter,
				setFilter,
				rarityFilter,
				setRarityFilter,
				group: grouping,
				setGroup: setGrouping,
				sort: sorting,
				setSort: setSorting,
				sortReverse,
				setSortReverse,
			}}>
			<InventoryFilterToolbar />

			{!doesInventoryExist && (
				<InfoBox className={styles.emptyFilter}>
					<div>
						{
							"Seems like you're new here. W-would you like to open an account with us? "
						}
						<a className={`btn-anchor ${styles.editCursor}`}>
							Edit any item to get started.
						</a>
					</div>
				</InfoBox>
			)}

			<main className={`page ${styles.page}`} role="main">
				<GroupedInventory
					onResetFilters={clearAllFilters}
				/>
			</main>
		</InventoryFilterContext.Provider>
	)
}
