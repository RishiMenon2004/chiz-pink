"use client"

import dynamic from "next/dynamic"
import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react"

import { EnumRarity, EnumMaterialType, Material } from "@/data/items"
import {
	InventoryFilter,
	InventoryGroup,
	InventoryRarityFilter,
	InventorySort,
} from "@/data/inventory/filters"

import { useInventoryStore, useInventoryFilters, usePlannerStore } from "@/hooks"

import InventoryFilterToolbar from "@/components/inventory/InventoryFilterToolbar"
import MaterialGroup from "@/components/inventory/MaterialGroup"

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
	const { getAgregatedMaterials } = usePlannerStore()

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
								<MaterialGroup
									key={rarity[1]}
									title={String(
										Object.values(RarityRank).at(index)
									)}>
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
								</MaterialGroup>
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
							<MaterialGroup key={type} title={type}>
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
							</MaterialGroup>
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
					<MaterialGroup
						key="owned"
						isEmpty={ownedMats.length <= 0}
						isOpen={ownedMats.length > 0}
						emptyFalback={
							<EmptyFilter>
								S-sorry... You don&apos;t seem to own anything.
							</EmptyFilter>
						}
						title="Owned">
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
					</MaterialGroup>,
				]

				if (unownedMats.length > 0) {
					groups.push(
						<MaterialGroup key="unowned" title="Not Owned">
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
						</MaterialGroup>
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
				groups.push(
					<MaterialGroup
						key="required"
						title="Required"
						isEmpty={requiredMaterials.length <= 0}
						emptyFalback={
							<EmptyFilter>
								{
									"Hmm, looks like... you don't n-need anything right now."
								}
							</EmptyFilter>
						}>
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
					</MaterialGroup>
				)

				groups.push(
					<div key="not required" className={styles.materialList}>
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

				groups.push(
					<MaterialGroup
						key="acquired"
						title="Acquired"
						isEmpty={acquiredMaterials.length <= 0}
						isOpen={acquiredMaterials.length > 0}
						emptyFalback={
							<EmptyFilter>
								{notAcquiredMaterials.length <= 0
									? ""
									: "Y-you haven't finished collecting... a-anything."}
							</EmptyFilter>
						}>
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
					</MaterialGroup>
				)
				groups.push(
					<MaterialGroup
						key="required"
						title="Required"
						isEmpty={notAcquiredMaterials.length <= 0}
						emptyFalback={
							<EmptyFilter>
								{acquiredMaterials.length > 0
									? "Oh wow! You've collected e-everything you needed!"
									: "Hmm, looks like... you don't n-need anything right now."}
							</EmptyFilter>
						}>
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
					</MaterialGroup>
				)

				groups.push(
					<div key={"not required"} className={styles.materialList}>
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
					<div key="default" className={styles.materialList}>
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
