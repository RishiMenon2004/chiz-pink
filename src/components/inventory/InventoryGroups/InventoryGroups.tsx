"use client"

import { useMemo } from "react"

import type { Material } from "@/types/item"
import type { Inventory } from "@/types/inventory"
import type { AggregateMaterialsType } from "@/types/planner"

import { EnumRarity, EnumMaterialType } from "@/data/items"

import { useInventoryFilters, useInventoryWhen } from "@/hooks"
import { getAggregatedMaterials, usePlannerStore } from "@/hooks/usePlannerStore"

import { getRarityName } from "@/helpers"

import { useInventoryFilterContext, useT } from "@/contexts"

import { InfoBox, MaterialDrawerTip } from "@/components/layout"
import { MaterialGroup } from "../MaterialGroup"
import { MaterialList } from "../MaterialList"

import styles from "@/app/[lang]/inventory/page.module.css"

export function EmptyFilterNotice({ onReset }: { onReset: () => void }) {
	const t = useT()

	return (
		<InfoBox className={styles.emptyFilter} sticker="cry">
			<div>
				{t.rich("inventory.groups.emptyFilter", {
					retry: (text) => (
						<a onClick={onReset} className="btn-anchor">
							{text}
						</a>
					),
				})}
			</div>
		</InfoBox>
	)
}

export function RarityGroup({
	materials,
	aggregatedMaterials,
}: {
	materials: Material[]
	aggregatedMaterials: AggregateMaterialsType
}) {
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
						<MaterialList
							materials={filteredRarity}
							aggregatedMaterials={aggregatedMaterials}
							inset
						/>
					</MaterialGroup>
				)
			})}
		</>
	)
}

export function TypeGroup({
	materials,
	aggregatedMaterials,
}: {
	materials: Material[]
	aggregatedMaterials: AggregateMaterialsType
}) {
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
						<MaterialList
							materials={filteredType}
							aggregatedMaterials={aggregatedMaterials}
							inset
						/>
					</MaterialGroup>
				)
			})}
		</>
	)
}

export function OwnedGroup({
	materials,
	inventoryStore,
	aggregatedMaterials,
}: {
	materials: Material[]
	inventoryStore: Inventory
	aggregatedMaterials: AggregateMaterialsType
}) {
	const t = useT()
	const ownedMats = materials.filter((mat) => (inventoryStore[mat.id] || 0) > 0)
	const unownedMats = materials.filter((mat) => !ownedMats.includes(mat))

	return (
		<>
			<MaterialGroup
				key="owned"
				isEmpty={ownedMats.length <= 0}
				isOpen={ownedMats.length > 0}
				emptyFallback={
					<InfoBox className={`inset-control ${styles.emptyFilter}`} sticker="cry">
						<div>{t("inventory.groups.noOwned")}</div>
					</InfoBox>
				}
				title={t("inventory.groups.owned")}>
				<MaterialList
					materials={ownedMats}
					aggregatedMaterials={aggregatedMaterials}
					inset
				/>
			</MaterialGroup>
			{unownedMats.length > 0 && (
				<MaterialGroup key="unowned" title={t("inventory.groups.notOwned")}>
					<MaterialList
						materials={unownedMats}
						aggregatedMaterials={aggregatedMaterials}
						inset
					/>
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
	const t = useT()
	const { requiredMaterials, notRequiredMaterials } = materials.reduce(
		(
			result: {
				requiredMaterials: Material[]
				notRequiredMaterials: Material[]
			},
			material
		) => {
			if (material.id in aggregatedMaterials) {
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
				title={t("inventory.groups.required")}
				isEmpty={requiredMaterials.length <= 0}
				emptyFallback={
					<InfoBox className={`inset-control ${styles.emptyFilter}`} sticker="rich">
						<div>{t("inventory.groups.noRequired")}</div>
					</InfoBox>
				}>
				<MaterialList
					materials={requiredMaterials}
					aggregatedMaterials={aggregatedMaterials}
					inset
				/>
			</MaterialGroup>
			<MaterialList
				key="not required"
				materials={notRequiredMaterials}
				aggregatedMaterials={aggregatedMaterials}
			/>
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
	const t = useT()
	const { requiredMaterials, notRequiredMaterials } = materials.reduce(
		(
			result: {
				requiredMaterials: Material[]
				notRequiredMaterials: Material[]
			},
			material
		) => {
			if (material.id in aggregatedMaterials) {
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
				title={t("inventory.groups.acquired")}
				isEmpty={acquiredMaterials.length <= 0}
				isOpen={acquiredMaterials.length > 0}
				emptyFallback={
					<InfoBox
						className={`inset-control ${styles.emptyFilter}`}
						sticker={notAcquiredMaterials.length <= 0 ? undefined : "faint"}>
						<div>
							{notAcquiredMaterials.length <= 0
								? t("inventory.groups.nothingToCollect")
								: t("inventory.groups.nothingCollected")}
						</div>
					</InfoBox>
				}>
				<MaterialList
					materials={acquiredMaterials}
					aggregatedMaterials={aggregatedMaterials}
					inset
				/>
			</MaterialGroup>
			<MaterialGroup
				key="required"
				title={t("inventory.groups.required")}
				isEmpty={notAcquiredMaterials.length <= 0}
				emptyFallback={
					<InfoBox
						className={`inset-control ${styles.emptyFilter}`}
						sticker={acquiredMaterials.length > 0 ? "rich" : "peek"}>
						<div>
							{acquiredMaterials.length > 0
								? t("inventory.groups.allCollected")
								: t("inventory.groups.noRequired")}
						</div>
					</InfoBox>
				}>
				<MaterialList
					materials={notAcquiredMaterials}
					aggregatedMaterials={aggregatedMaterials}
					inset
				/>
			</MaterialGroup>
			<MaterialList
				key="not required"
				materials={notRequiredMaterials}
				aggregatedMaterials={aggregatedMaterials}
			/>
		</>
	)
}

export function DefaultGroup({
	materials,
	aggregatedMaterials,
}: {
	materials: Material[]
	aggregatedMaterials: AggregateMaterialsType
}) {
	return (
		<MaterialList
			key="default"
			materials={materials}
			aggregatedMaterials={aggregatedMaterials}
		/>
	)
}

export function GroupedInventory({
	onResetFilters,
}: {
	onResetFilters: () => void
}) {
	const { plannerData } = usePlannerStore()

	const { filter, rarityFilter, sort, group, sortReverse } =
		useInventoryFilterContext()

	const inventoryStore = useInventoryWhen(
		group === "owned" || group === "acquired"
	)

	const aggregatedMaterials = useMemo(
		() => getAggregatedMaterials(plannerData),
		[plannerData]
	)

	const filteredMaterials = useInventoryFilters(
		filter,
		rarityFilter,
		sort,
		sortReverse,
		aggregatedMaterials
	)

	if (filteredMaterials.length <= 0) {
		return <EmptyFilterNotice onReset={onResetFilters} />
	}

	let content
	switch (group) {
		case "rarity":
			content = (
				<RarityGroup
					materials={filteredMaterials}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
			break
		case "type":
			content = (
				<TypeGroup
					materials={filteredMaterials}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
			break
		case "owned":
			content = (
				<OwnedGroup
					materials={filteredMaterials}
					inventoryStore={inventoryStore}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
			break
		case "required":
			content = (
				<RequiredGroup
					materials={filteredMaterials}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
			break
		case "acquired":
			content = (
				<AcquiredGroup
					materials={filteredMaterials}
					inventoryStore={inventoryStore}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
			break
		case "default":
		default:
			content = (
				<DefaultGroup
					materials={filteredMaterials}
					aggregatedMaterials={aggregatedMaterials}
				/>
			)
			break
	}

	return (
		<>
			<MaterialDrawerTip />
			{content}
		</>
	)
}
