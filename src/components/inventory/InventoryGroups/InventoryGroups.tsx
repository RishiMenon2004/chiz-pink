"use client"

import type { Material } from "@/types/item"
import type { Inventory } from "@/types/inventory"
import type { AggregateMaterialsType } from "@/types/planner"

import { EnumRarity, EnumMaterialType } from "@/data/items"

import { useInventoryFilters, useInventoryStore } from "@/hooks"
import { getAggregatedMaterials, usePlannerStore } from "@/hooks/usePlannerStore"

import { getRarityName } from "@/helpers"

import { useInventoryFilterContext } from "@/contexts"

import { InfoBox } from "@/components/layout"
import { MaterialGroup } from "../MaterialGroup"
import { MaterialList } from "../MaterialList"

import styles from "@/app/inventory/page.module.css"

export function EmptyFilterNotice({ onReset }: { onReset: () => void }) {
	return (
		<InfoBox className={styles.emptyFilter}>
			<div>
				{
					"I-I can't seem to find anything with those filters. Would you like to "
				}
				<a onClick={onReset} className="btn-anchor">
					try again?
				</a>
			</div>
		</InfoBox>
	)
}

export function RarityGroup({ materials }: { materials: Material[] }) {
	const ranks = Object.entries(EnumRarity)
		.filter((v) => typeof v[1] === "number")
		.reverse()

	return (
		<>
			{ranks.map((rarity) => {
				const filteredRarity = materials.filter(
					(material) => material.rarity === rarity[1]
				)
				if (filteredRarity.length <= 0) return null

				return (
					<MaterialGroup
						key={rarity[1]}
						title={getRarityName(Number(rarity[1]))}>
						<MaterialList materials={filteredRarity} inset />
					</MaterialGroup>
				)
			})}
		</>
	)
}

export function TypeGroup({ materials }: { materials: Material[] }) {
	const types = Object.values(EnumMaterialType)

	return (
		<>
			{types.map((type) => {
				const filteredType = materials.filter(
					(material) => material.materialType === type
				)
				if (filteredType.length <= 0) return null

				return (
					<MaterialGroup key={type} title={type}>
						<MaterialList materials={filteredType} inset />
					</MaterialGroup>
				)
			})}
		</>
	)
}

export function OwnedGroup({
	materials,
	inventoryStore,
}: {
	materials: Material[]
	inventoryStore: Inventory
}) {
	const ownedMats = materials.filter((mat) => (inventoryStore[mat.id] || 0) > 0)
	const unownedMats = materials.filter((mat) => !ownedMats.includes(mat))

	return (
		<>
			<MaterialGroup
				key="owned"
				isEmpty={ownedMats.length <= 0}
				isOpen={ownedMats.length > 0}
				emptyFallback={
					<InfoBox className={`inset-control ${styles.emptyFilter}`}>
						<div>S-sorry... You don&apos;t seem to own anything.</div>
					</InfoBox>
				}
				title="Owned">
				<MaterialList materials={ownedMats} inset />
			</MaterialGroup>
			{unownedMats.length > 0 && (
				<MaterialGroup key="unowned" title="Not Owned">
					<MaterialList materials={unownedMats} inset />
				</MaterialGroup>
			)}
		</>
	)
}

export function RequiredGroup({
	materials,
	aggregatedMaterials,
}: {
	materials: Material[]
	aggregatedMaterials: AggregateMaterialsType
}) {
	const { requiredMaterials, notRequiredMaterials } = materials.reduce(
		(
			result: {
				requiredMaterials: Material[]
				notRequiredMaterials: Material[]
			},
			material
		) => {
			if (Object.keys(aggregatedMaterials).includes(material.id)) {
				result.requiredMaterials.push(material)
			} else {
				result.notRequiredMaterials.push(material)
			}

			return result
		},
		{ requiredMaterials: [], notRequiredMaterials: [] }
	)

	return (
		<>
			<MaterialGroup
				key="required"
				title="Required"
				isEmpty={requiredMaterials.length <= 0}
				emptyFallback={
					<InfoBox className={`inset-control ${styles.emptyFilter}`}>
						<div>
							{
								"Hmm, looks like... you don't n-need anything right now."
							}
						</div>
					</InfoBox>
				}>
				<MaterialList materials={requiredMaterials} inset />
			</MaterialGroup>
			<MaterialList key="not required" materials={notRequiredMaterials} />
		</>
	)
}

export function AcquiredGroup({
	materials,
	inventoryStore,
	aggregatedMaterials,
}: {
	materials: Material[]
	inventoryStore: Inventory
	aggregatedMaterials: AggregateMaterialsType
}) {
	const { requiredMaterials, notRequiredMaterials } = materials.reduce(
		(
			result: {
				requiredMaterials: Material[]
				notRequiredMaterials: Material[]
			},
			material
		) => {
			if (Object.keys(aggregatedMaterials).includes(material.id)) {
				result.requiredMaterials.push(material)
			} else {
				result.notRequiredMaterials.push(material)
			}

			return result
		},
		{ requiredMaterials: [], notRequiredMaterials: [] }
	)

	const { acquiredMaterials, notAcquiredMaterials } = requiredMaterials.reduce(
		(
			result: {
				acquiredMaterials: Material[]
				notAcquiredMaterials: Material[]
			},
			material
		) => {
			if (
				inventoryStore[material.id] >=
				aggregatedMaterials[material.id].amount
			) {
				result.acquiredMaterials.push(material)
			} else {
				result.notAcquiredMaterials.push(material)
			}

			return result
		},
		{ acquiredMaterials: [], notAcquiredMaterials: [] }
	)

	return (
		<>
			<MaterialGroup
				key="acquired"
				title="Acquired"
				isEmpty={acquiredMaterials.length <= 0}
				isOpen={acquiredMaterials.length > 0}
				emptyFallback={
					<InfoBox className={`inset-control ${styles.emptyFilter}`}>
						<div>
							{notAcquiredMaterials.length <= 0
								? ""
								: "Y-you haven't finished collecting... a-anything."}
						</div>
					</InfoBox>
				}>
				<MaterialList materials={acquiredMaterials} inset />
			</MaterialGroup>
			<MaterialGroup
				key="required"
				title="Required"
				isEmpty={notAcquiredMaterials.length <= 0}
				emptyFallback={
					<InfoBox className={`inset-control ${styles.emptyFilter}`}>
						<div>
							{acquiredMaterials.length > 0
								? "Oh wow! You've collected e-everything you needed!"
								: "Hmm, looks like... you don't n-need anything right now."}
						</div>
					</InfoBox>
				}>
				<MaterialList materials={notAcquiredMaterials} inset />
			</MaterialGroup>
			<MaterialList key="not required" materials={notRequiredMaterials} />
		</>
	)
}

export function DefaultGroup({ materials }: { materials: Material[] }) {
	return <MaterialList key="default" materials={materials} />
}

export function GroupedInventory({
	onResetFilters,
}: {
	onResetFilters: () => void
}) {
	const { inventory: inventoryStore } = useInventoryStore()
	const { plannerData } = usePlannerStore()

	const { filter, rarityFilter, sort, group, sortReverse } =
		useInventoryFilterContext()

	const filteredMaterials = useInventoryFilters(
		filter,
		rarityFilter,
		sort,
		sortReverse
	)

	if (filteredMaterials.length <= 0) {
		return <EmptyFilterNotice onReset={onResetFilters} />
	}

	const aggregatedMaterials = getAggregatedMaterials(plannerData)

	switch (group) {
		case "rarity":
			return <RarityGroup materials={filteredMaterials} />
		case "type":
			return <TypeGroup materials={filteredMaterials} />
		case "owned":
			return (
				<OwnedGroup
					materials={filteredMaterials}
					inventoryStore={inventoryStore}
				/>
			)
		case "required":
			return (
				<RequiredGroup
					materials={filteredMaterials}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
		case "acquired":
			return (
				<AcquiredGroup
					materials={filteredMaterials}
					inventoryStore={inventoryStore}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
		case "default":
		default:
			return <DefaultGroup materials={filteredMaterials} />
	}
}
