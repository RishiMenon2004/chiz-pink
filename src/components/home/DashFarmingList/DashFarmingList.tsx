"use client"

import Link from "next/link"
import {
	Dispatch,
	SetStateAction,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"

import { CharacterRecord, WeaponRecord } from "@/types/planner"

import { findMaterial } from "@/data/items"

import { usePlannerOrderStore } from "@/hooks"
import { getAggregatedMaterials, usePlannerStore } from "@/hooks/usePlannerStore"

import { PlannerInventoryProvider } from "@/helpers/PlannerInventoryProvider"

import { usePlannerMaterialsContext } from "@/contexts"

import { InfoBox } from "@/components/layout/InfoBox"
import { PlannerMaterialBox } from "@/components/planner/MaterialBox"

import pageStyles from "@/app/page.module.css"
import styles from "./DashFarmingList.module.css"

export function DashFarmingList() {
	const { plannerData, isLoaded } = usePlannerStore()
	const { plannerOrder } = usePlannerOrderStore()

	const listRef = useRef<HTMLDivElement>(null)
	const [columnCount, setColumnCount] = useState(6)
	const showAllState = useState<boolean>(false)
	const [showAll, setShowAll] = showAllState

	useEffect(() => {
		const el = listRef.current
		if (!el) return

		const updateColumnCount = () => {
			const columns = getComputedStyle(el)
				.gridTemplateColumns.split(" ")
				.filter(Boolean).length

			if (columns > 0) setColumnCount(columns)
		}

		updateColumnCount()

		const observer = new ResizeObserver(updateColumnCount)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	const materials = useMemo(
		() =>
			Object.entries(getAggregatedMaterials(plannerData)).toSorted(
				([, a], [, b]) => b.amount - a.amount
			),
		[plannerData]
	)

	const items: Record<string, CharacterRecord | WeaponRecord> = useMemo(() => {
		const combined: Record<string, CharacterRecord | WeaponRecord> = {
			...plannerData.characters,
			...plannerData.arcs,
		}

		const orderedIds = plannerOrder.hybrid.filter((id) => id in combined)
		const remainingIds = Object.keys(combined).filter(
			(id) => !orderedIds.includes(id)
		)

		const ordered: Record<string, CharacterRecord | WeaponRecord> = {}
		;[...orderedIds, ...remainingIds].forEach((id) => {
			ordered[id] = combined[id]
		})
		return ordered
	}, [plannerData, plannerOrder])

	const itemsList = Object.values(items)

	return (
		<div className={`metallic-panel ${pageStyles.section} ${styles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>Farming List</h2>
				<button
					type="button"
					style={{
						visibility: showAll ? "visible" : "hidden",
					}}
					className={`pill-button ${pageStyles.sectionButton}`}
					onClick={() => setShowAll(false)}>
					{"COLLAPSE"}
				</button>
			</div>
			<div
				ref={listRef}
				className={`inset-control ${styles.materialsList}`}>
				<PlannerInventoryProvider itemRecords={itemsList}>
					<FarmingMaterialsList
						isLoaded={isLoaded}
						materials={materials}
						columnCount={columnCount}
						showAllState={showAllState}
					/>
				</PlannerInventoryProvider>
			</div>
		</div>
	)
}

function FarmingMaterialsList({
	isLoaded,
	materials,
	columnCount,
	showAllState,
}: {
	isLoaded: boolean
	materials: [string, { amount: number }][]
	columnCount: number
	showAllState: [boolean, Dispatch<SetStateAction<boolean>>]
}) {
	const cumulativeInventory = usePlannerMaterialsContext()
	const usableInventory = useMemo(
		() => cumulativeInventory[cumulativeInventory.length - 1] ?? {},
		[cumulativeInventory]
	)

	const [showAll, setShowAll] = showAllState

	const requiredMaterials = useMemo(
		() =>
			materials
				.map(([id, aggregate]) => {
					const material = findMaterial(id)

					const availableAmount =
						usableInventory[material.id]?.amount ?? 0

					const craftedAmount =
						usableInventory[material.id]?.craftedAmount ?? 0

					const remainingAmount = Math.max(
						0,
						aggregate.amount - (availableAmount + craftedAmount)
					)

					return {
						material,
						remainingAmount,
						required: aggregate.amount,
					}
				})
				.filter(({ remainingAmount }) => remainingAmount >= 1),
		[materials, usableInventory]
	)

	if (isLoaded && materials.length === 0) {
		return (
			<InfoBox sticker="peek" className={styles.emptyNotice}>
				<div>
					{"Y-you haven't planned anything yet... "}
					<Link href="/planner" className="btn-anchor">
						Start planning
					</Link>
					{" and I'll l-list what to farm right here!"}
				</div>
			</InfoBox>
		)
	}

	if (isLoaded && requiredMaterials.length === 0) {
		return (
			<InfoBox sticker="rich" className={styles.emptyNotice}>
				<div>
					{"Wow, you already have e-everything your plans need! Nothing to farm right now."}
				</div>
			</InfoBox>
		)
	}

	const visibleCount = showAll ? 100 : columnCount * 2
	const overflowMaterials = requiredMaterials.length - visibleCount

	return (
		<>
			{requiredMaterials
				.slice(0, visibleCount)
				.map(({ material, required }) => (
					<PlannerMaterialBox
						key={material.id}
						material={findMaterial(material.id)}
						requiredAmount={required}
					/>
				))}
			{overflowMaterials > 0 && (
				<button
					className={styles.viewMore}
					onClick={() => setShowAll(true)}>
					<span>View All (+{overflowMaterials})</span>
				</button>
			)}
		</>
	)
}
