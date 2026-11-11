"use client"

import { useState } from "react"

import type {
	FilterByType,
	GroupByType,
	FilterRarityType,
	SortByType,
} from "@/types/inventory"

import { useInventoryStore } from "@/hooks"
import { InventoryFilterContext, useT } from "@/contexts"
import { InfoBox, ToolIntro } from "@/components/layout"
import { InventoryFilterToolbar, GroupedInventory } from "@/components/inventory"

import styles from "./page.module.css"

export default function RenderInventory() {
	const t = useT()
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

			<ToolIntro id="inventory">
				<div>{t("inventory.intro")}</div>
			</ToolIntro>

			{!doesInventoryExist && (
				<InfoBox className={styles.emptyFilter} sticker="peek">
					<div>
						{t.rich("inventory.newUser", {
							start: (text) => (
								<a className={`btn-anchor ${styles.editCursor}`}>
									{text}
								</a>
							),
						})}
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
