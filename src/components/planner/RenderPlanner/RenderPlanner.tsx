"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { DragEndEvent, DragStartEvent, Feedback } from "@dnd-kit/dom"

import type { PlannerRecord } from "@/types/planner"

import { getAllMaterialsList } from "@/data/items"

import { usePlannerItems, usePlannerStore, useSettingsStore } from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { PlannerInventoryProvider } from "@/helpers"

import { MaterialGroup } from "@/components/inventory/"
import { PlannerMaterialsList } from "../MaterialsList"

import plannerBoxStyles from "./plannerBox.module.css"
import styles from "./renderPlanner.module.css"
import { useRouter } from "next/navigation"

const PlannerCharacterBox = dynamic(
	() => import("@/components/planner").then((mod) => mod.PlannerCharacterBox),
	{ ssr: false }
)
const PlannerArcBox = dynamic(
	() => import("@/components/planner").then((mod) => mod.PlannerArcBox),
	{ ssr: false }
)

const materialOrder = new Map<string, number>()
getAllMaterialsList().forEach((material, index) =>
	materialOrder.set(material.id, index)
)

export function RenderPlanner({
	plannerType,
}: {
	plannerType: keyof PlannerRecord | "both"
}) {
	const { settings } = useSettingsStore()
	const router = useRouter()

	const combinedEnabled = settings.appearance?.["use-hybrid-planner"] ?? false

	//redirect to /characters if accessing /planner and disabled combined planner
	//vice versa, redirect to /planner if accessing /characters or /arcs and enabled combined planner
	const shouldRedirect =
		plannerType === "both" ? !combinedEnabled : combinedEnabled
	const redirectTo = plannerType === "both" ? "/planner/characters" : "/planner"

	useEffect(() => {
		if (shouldRedirect) router.replace(redirectTo)
	}, [shouldRedirect, redirectTo, router])

	const { plannerData } = usePlannerStore()
	const { items, itemsList, handleDragEnd } = usePlannerItems(plannerType)

	const [activeDragId, setActiveDragId] = useState<string | null>(null)

	const allRequiredMaterials = useMemo(
		() =>
			Object.entries(
				getAggregatedMaterials(
					plannerData,
					plannerType === "characters"
						? "char"
						: plannerType === "arcs"
							? "arc"
							: "both"
				)
			).sort(
				([idA], [idB]) =>
					(materialOrder.get(idA) ?? 0) - (materialOrder.get(idB) ?? 0)
			),
		[plannerData, plannerType]
	)

	const onDragStart = (e: DragStartEvent) =>
		setActiveDragId((e.operation.source?.id as string) || null)

	const onDragEnd = (e: DragEndEvent) => {
		setActiveDragId(null)
		handleDragEnd(e)
	}

	return (
		<PlannerInventoryProvider itemRecords={itemsList}>
			<main className={`page ${styles.page}`} role="main">
				{allRequiredMaterials.length > 0 && (
					<MaterialGroup title="Required Materials">
						<div
							className={`${plannerBoxStyles.plannerRequiredMaterialsBox} ${styles.plannerRequiredMaterialsBox}`}>
							<PlannerMaterialsList
								materials={allRequiredMaterials.map(
									([id, { amount }]) => ({
										id,
										amount,
									})
								)}
							/>
						</div>
					</MaterialGroup>
				)}

				<DragDropProvider
					plugins={(defaults) => [
						...defaults,
						Feedback.configure({
							dropAnimation: null,
						}),
					]}
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}>
					<div className={styles.plannerGrid}>
						{itemsList.map((item, index) =>
							"uid" in item ? (
								<PlannerArcBox
									key={item.uid}
									arcRecord={item}
									index={index}
								/>
							) : (
								<PlannerCharacterBox
									key={item.id}
									charRecord={item}
									index={index}
								/>
							)
						)}
						<DragOverlay>
							{activeDragId &&
								(() => {
									const active = items[activeDragId]
									if (!active) return null
									return "uid" in active ? (
										<PlannerArcBox
											arcRecord={active}
											index={-200}
										/>
									) : (
										<PlannerCharacterBox
											charRecord={active}
											index={-200}
										/>
									)
								})()}
						</DragOverlay>
					</div>
				</DragDropProvider>
			</main>
		</PlannerInventoryProvider>
	)
}
