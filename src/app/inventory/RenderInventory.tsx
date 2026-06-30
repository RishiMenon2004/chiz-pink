"use client"

import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react"
import dynamic from "next/dynamic"
import { EnumRarity, EnumMaterialType } from "@/database/items"
import {
	InventoryFilter,
	InventoryGroup,
	InventoryRarityFilter,
	InventorySort,
} from "@/database/inventory/inventoryFilters"
import { useInventoryStore, useInventoryFilters } from "@/hooks"
import InventoryFilterToolbar from "@/components/inventory/InventoryFilterToolbar"
import styles from "./page.module.css"

const InventoryMaterialBox = dynamic(
	() => import("@/components/inventory/InventoryMaterialBox"),
	{ ssr: false }
)

export enum RarityRank {
	Common = "C-Rank",
	Uncommon = "B-Rank",
	Rare = "A-Rank",
	Epic = "S-Rank",
}

export function EmptyFilter({ children }: { children: ReactNode }) {
	return <div className={styles.emptyFilter}>{children}</div>
}

type InventoryFiltersContextType = {
	filter: InventoryFilter
	setFilter: Dispatch<SetStateAction<InventoryFilter>>
	rarityFilter: InventoryRarityFilter
	setRarityFilter: Dispatch<SetStateAction<InventoryRarityFilter>>
	group: InventoryGroup
	setGroup: Dispatch<SetStateAction<InventoryGroup>>
	sort: InventorySort
	setSort: Dispatch<SetStateAction<InventorySort>>
	sortReverse: boolean
	setSortReverse: Dispatch<SetStateAction<boolean>>
}

export const InventoryFilterContext = createContext<InventoryFiltersContextType>(
	null!
)

export default function RenderInventory() {
	const [filter, setFilter] = useState<InventoryFilter>("default")
	const [rarityFilter, setRarityFilter] =
		useState<InventoryRarityFilter>("default")
	const [group, setGroup] = useState<InventoryGroup>("default")
	const [sort, setSort] = useState<InventorySort>("default")
	const [sortReverse, setSortReverse] = useState<boolean>(false)

	const filters: {
		filter: InventoryFilter
		rarity: InventoryRarityFilter
		sorting: InventorySort
		sortReverse: boolean
	} = { filter, rarity: rarityFilter, sorting: sort, sortReverse }

	const { inventory: inventoryStore } = useInventoryStore()
	const filteredInventory = useInventoryFilters(filters)

	const clearAllFilters = () => {
		setFilter("default")
		setRarityFilter("default")
	}

	const doesInventoryExist = Object.entries(inventoryStore).length > 0

	function groupInventory() {
		if (filteredInventory.length <= 0) {
			return (
				<EmptyFilter>
					{
						"I-I can't seem to find anything with those filters. Would you like to "
					}
					<a onClick={clearAllFilters} className="btn-anchor">
						try again?
					</a>
				</EmptyFilter>
			)
		}

		switch (group) {
			case "rarity": {
				const ranks = Object.entries(EnumRarity).filter(
					(v) => typeof v[1] === "number"
				)
				const groups = ranks
					.map((rarity, index) => {
						const filteredRarity = filteredInventory.filter(
							(material) => material.rarity === rarity[1]
						)
						if (filteredRarity.length > 0) {
							return (
								<details
									key={rarity[1]}
									className={styles.matGroup}
									open>
									<summary>
										{Object.values(RarityRank).at(index)}
									</summary>
									<div className={styles.materialList}>
										{filteredRarity.map((material) => {
											return (
												<InventoryMaterialBox
													key={material.id}
													material={material}
												/>
											)
										})}
									</div>
								</details>
							)
						}
					})
					.reverse()
				return groups
			}

			case "type": {
				const types = Object.values(EnumMaterialType)
				const groups = types.map((type) => {
					const filteredType = filteredInventory.filter(
						(material) => material.materialType === type
					)
					if (filteredType.length > 0) {
						return (
							<details key={type} className={styles.matGroup} open>
								<summary>{type}</summary>

								<div className={styles.materialList}>
									{filteredType.map((material) => {
										return (
											<InventoryMaterialBox
												key={material.id}
												material={material}
											/>
										)
									})}
								</div>
							</details>
						)
					}
				})
				return groups
			}

			case "owned": {
				const materials = filteredInventory
				const ownedMats = materials.filter(
					(mat) => (inventoryStore[mat.id] || 0) > 0
				)
				const unownedMats = materials.filter(
					(mat) => !ownedMats.includes(mat)
				)

				const groups = [
					<details
						key={"owned"}
						className={`${styles.matGroup} ${ownedMats.length <= 0 && styles.emptyGroup}`}
						open={ownedMats.length > 0}>
						<summary>Owned</summary>
						{ownedMats.length > 0 ? (
							<div className={styles.materialList}>
								{ownedMats.map((material) => {
									return (
										<InventoryMaterialBox
											key={material.id}
											material={material}
										/>
									)
								})}
							</div>
						) : (
							<EmptyFilter>
								S-sorry... You don&apos;t seem to own anything.
							</EmptyFilter>
						)}
					</details>,
				]

				if (unownedMats.length > 0) {
					groups.push(
						<details key={"unowned"} className={styles.matGroup} open>
							<summary>Not Owned</summary>
							<div className={styles.materialList}>
								{unownedMats.map((material) => {
									return (
										<InventoryMaterialBox
											key={material.id}
											material={material}
										/>
									)
								})}
							</div>
						</details>
					)
				}

				return groups
			}

			case "default":
			default: {
				const materials = filteredInventory
				const groups = [
					<div key={"default"} className={styles.materialList}>
						{materials.map((material) => {
							return (
								<InventoryMaterialBox
									key={material.id}
									material={material}
								/>
							)
						})}
					</div>,
				]
				return groups
			}
		}
	}

	const contextValue: InventoryFiltersContextType = {
		filter,
		setFilter,
		rarityFilter,
		setRarityFilter,
		group,
		setGroup,
		sort,
		setSort,
		sortReverse,
		setSortReverse,
	}

	return (
		<InventoryFilterContext.Provider value={contextValue}>
			<InventoryFilterToolbar />

			{!doesInventoryExist && (
				<EmptyFilter>
					{
						"Seems like you're new here. W-would you like to open an account with us? "
					}
					<a className={`btn-anchor ${styles.editCursor}`}>
						Edit any item to get started.
					</a>
				</EmptyFilter>
			)}

			<div className={styles.page}>{groupInventory()}</div>
		</InventoryFilterContext.Provider>
	)
}
