"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

import type { Material } from "@/types/item"
import type {
	FilterByType,
	GroupByType,
	FilterRarityType,
	SortByType,
} from "@/types/inventory"

import { EnumRarity, EnumMaterialType } from "@/data/items"

import { useInventoryStore, useInventoryFilters, usePlannerStore } from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { getRarityName } from "@/helpers"

import { InventoryFilterContext } from "@/contexts"

import { InfoBox } from "@/components/layout"
import { InventoryFilterToolbar, MaterialGroup } from "@/components/inventory"

import styles from "./page.module.css"

const InventoryMaterialBox = dynamic(
	() => import("@/components/inventory").then((mod) => mod.MaterialItemBox),
	{ ssr: false }
)

export default function RenderInventory() {
	const { inventory: inventoryStore } = useInventoryStore()
	const { plannerData } = usePlannerStore()

	const doesInventoryExist = Object.entries(inventoryStore).length > 0

	const [filter, setFilter] = useState<FilterByType>("default")
	const [rarityFilter, setRarityFilter] = useState<FilterRarityType>("default")
	const [grouping, setGrouping] = useState<GroupByType>("default")
	const [sorting, setSorting] = useState<SortByType>("default")
	const [sortReverse, setSortReverse] = useState<boolean>(false)

	const filteredInventory = useInventoryFilters(
		filter,
		rarityFilter,
		sorting,
		sortReverse
	)

	const clearAllFilters = () => {
		setFilter("default")
		setRarityFilter("default")
	}

	function groupInventory() {
		const agregatedMaterials = getAggregatedMaterials(plannerData)

		const materials = [...filteredInventory]

		if (materials.length <= 0) {
			return (
				<InfoBox className={styles.emptyFilter}>
					{
						"I-I can't seem to find anything with those filters. Would you like to "
					}
					<a onClick={clearAllFilters} className="btn-anchor">
						try again?
					</a>
				</InfoBox>
			)
		}

		switch (grouping) {
			case "rarity": {
				const ranks = Object.entries(EnumRarity)
					.filter((v) => typeof v[1] === "number")
					.reverse()
				const groups = ranks.map((rarity) => {
					const filteredRarity = materials.filter(
						(material) => material.rarity === rarity[1]
					)
					if (filteredRarity.length > 0) {
						return (
							<MaterialGroup
								key={rarity[1]}
								title={getRarityName(Number(rarity[1]))}>
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
							<InfoBox className={styles.emptyFilter}>
								S-sorry... You don&apos;t seem to own anything.
							</InfoBox>
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
							<InfoBox className={styles.emptyFilter}>
								{
									"Hmm, looks like... you don't n-need anything right now."
								}
							</InfoBox>
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
							<InfoBox className={styles.emptyFilter}>
								{notAcquiredMaterials.length <= 0
									? ""
									: "Y-you haven't finished collecting... a-anything."}
							</InfoBox>
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
							<InfoBox className={styles.emptyFilter}>
								{acquiredMaterials.length > 0
									? "Oh wow! You've collected e-everything you needed!"
									: "Hmm, looks like... you don't n-need anything right now."}
							</InfoBox>
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
					{
						"Seems like you're new here. W-would you like to open an account with us? "
					}
					<a className={`btn-anchor ${styles.editCursor}`}>
						Edit any item to get started.
					</a>
				</InfoBox>
			)}

			<main className={`page ${styles.page}`} role="main">{groupInventory()}</main>
		</InventoryFilterContext.Provider>
	)
}
