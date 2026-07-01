"use client"

import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react"
import dynamic from "next/dynamic"
import { EnumRarity, EnumMaterialType, Material } from "@/database/items"
import {
	InventoryFilter,
	InventoryGroup,
	InventoryRarityFilter,
	InventorySort,
} from "@/database/inventory/inventoryFilters"
import { useInventoryStore, useInventoryFilters } from "@/hooks"
import InventoryFilterToolbar from "@/components/inventory/InventoryFilterToolbar"
import styles from "./page.module.css"
import usePlanner from "@/hooks/usePlannerStore"

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
	const { getAgregatedMaterials } = usePlanner()

	function groupInventory() {
		const agregatedMaterials = getAgregatedMaterials()

		const materials = [...filteredInventory]

		if (materials.length <= 0) {
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
						const filteredRarity = materials.filter(
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
					const filteredType = materials.filter(
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

			case "required": {
				const { requiredMaterials, notRequiredMaterials } =
					materials.reduce(
						(
							result: {
								requiredMaterials: Material[]
								notRequiredMaterials: Material[]
							},
							material
						) => {
							if (
								Object.keys(agregatedMaterials).includes(
									material.id
								)
							) {
								result.requiredMaterials.push(material)
							} else {
								result.notRequiredMaterials.push(material)
							}

							return result
						},
						{ requiredMaterials: [], notRequiredMaterials: [] }
					)

				const groups = []

				if (requiredMaterials.length > 0) {
					groups.push(
						<details
							key={"required"}
							className={styles.matGroup}
							open>
							<summary>Required</summary>
							<div className={styles.materialList}>
								{requiredMaterials.map((material) => {
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

				groups.push(
					<div className={styles.materialList}>
						{notRequiredMaterials.map((material) => {
							return (
								<InventoryMaterialBox
									key={material.id}
									material={material}
								/>
							)
						})}
					</div>
				)

				return groups
			}

			case "acquired": {
				const { requiredMaterials, notRequiredMaterials } =
					materials.reduce(
						(
							result: {
								requiredMaterials: Material[]
								notRequiredMaterials: Material[]
							},
							material
						) => {
							if (
								Object.keys(agregatedMaterials).includes(
									material.id
								)
							) {
								result.requiredMaterials.push(material)
							} else {
								result.notRequiredMaterials.push(material)
							}

							return result
						},
						{ requiredMaterials: [], notRequiredMaterials: [] }
					)

				const { acquiredMaterials, notAcquiredMaterials } =
					requiredMaterials.reduce(
						(
							result: {
								acquiredMaterials: Material[]
								notAcquiredMaterials: Material[]
							},
							material
						) => {
							if (
								inventoryStore[material.id] >=
								agregatedMaterials[material.id].amount
							) {
								result.acquiredMaterials.push(material)
							} else {
								result.notAcquiredMaterials.push(material)
							}

							return result
						},
						{ acquiredMaterials: [], notAcquiredMaterials: [] }
					)

				const groups = []

				if (acquiredMaterials.length > 0) {
					groups.push(
						<details
							key={"acquired"}
							className={styles.matGroup}
							open>
							<summary>Acquired</summary>
							<div className={styles.materialList}>
								{acquiredMaterials.map((material) => {
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

				if (notAcquiredMaterials.length > 0) {
					groups.push(
						<details
							key={"required"}
							className={styles.matGroup}
							open>
							<summary>Required</summary>
							<div className={styles.materialList}>
								{notAcquiredMaterials.map((material) => {
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

				groups.push(
					<div className={styles.materialList}>
						{notRequiredMaterials.map((material) => {
							return (
								<InventoryMaterialBox
									key={material.id}
									material={material}
								/>
							)
						})}
					</div>
				)

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
