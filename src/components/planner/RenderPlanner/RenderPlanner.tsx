"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { DragEndEvent, DragStartEvent, Feedback } from "@dnd-kit/dom"

import type {
	CharacterRecord,
	PlannerRecord,
	WeaponRecord,
} from "@/types/planner"

import { getAllMaterialsList } from "@/data/items"

import { useHybridPlannerStore, usePlannerStore, useSettingsStore } from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { PlannerInventoryProvider } from "@/helpers"

import { MaterialGroup } from "@/components/inventory/"
import { PlannerMaterialsList } from "../MaterialsList"

import plannerBoxStyles from "./plannerBox.module.css"
import styles from "./renderPlanner.module.css"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { PlannerReorderBox } from "@/components/layout/ReorderBox/PlannerReorderBox"
import { ModalContainer } from "@/components/layout"

import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import { KeyMouseEventType } from "@/types"
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

	//reditect to /characters if accessing /planner and disabled combined planner
	//vice versa, redirect to /planner if accessing /characters or /arcs and enabled combined planner
	const shouldRedirect =
		plannerType === "both" ? !combinedEnabled : combinedEnabled
	const redirectTo = plannerType === "both" ? "planner/characters" : "/planner"

	useEffect(() => {
		if (shouldRedirect) router.replace(redirectTo)
	}, [shouldRedirect, redirectTo, router])

	const { plannerData, actions } = usePlannerStore()
	const { hybridPlanner, actions: hybridActions } = useHybridPlannerStore()

	const items: Record<string, CharacterRecord | WeaponRecord> = useMemo(() => {
		if (plannerType !== "both") return plannerData[plannerType]

		const combined: Record<string, CharacterRecord | WeaponRecord> = {
			...plannerData.characters,
			...plannerData.arcs,
		}

		const orderedIds = hybridPlanner.order.filter((id) => id in combined)
		const remainingIds = Object.keys(combined).filter(
			(id) => !orderedIds.includes(id)
		)

		const ordered: Record<string, CharacterRecord | WeaponRecord> = {}
		;[...remainingIds, ...orderedIds].forEach((id) => {
			ordered[id] = combined[id]
		})
		return ordered
	}, [plannerType, plannerData, hybridPlanner])

	const itemsList = Object.values(items)

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

	const [showReorder, setShowReorder] = useState(false)
	const closeReorder = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setShowReorder(false)
	}

	const onDragStart = (e: DragStartEvent) =>
		setActiveDragId((e.operation.source?.id as string) || null)

	const onDragEnd = (e: DragEndEvent) => {
		if (e.canceled) return
		setActiveDragId(null)

		const { source } = e.operation
		if (!isSortable(source)) return

		const { initialIndex, index } = source
		if (initialIndex === index) return

		const list = Object.values(items)
		const [removed] = list.splice(initialIndex, 1)
		list.splice(index, 0, removed)

		if (plannerType === "both") {
			hybridActions.setOrder(
				list.map((item) => ("uid" in item ? item.uid : item.id))
			)
			return
		}

		const newRecord: typeof items = {}
		list.forEach((item) => {
			newRecord["uid" in item ? item.uid : item.id] = item
		})
		actions.updatePlanner({ [plannerType]: newRecord })
	}

	const [priorityPortalTarget, setPriorityPortalTarget] =
		useState<HTMLElement | null>(null)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPriorityPortalTarget(document.getElementById("adjust-priority"))
	}, [])

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

				{priorityPortalTarget &&
					createPortal(
						<button
							disabled={itemsList.length <= 1}
							className={`pill-button ${toolbarStyles.toolbarButton} ${styles.hideOnDesktop}`}
							onClick={() => setShowReorder(true)}>
							ADJUST PRIORITY
						</button>,
						priorityPortalTarget
					)}

				{showReorder &&
					createPortal(
						<ModalContainer onClickOut={closeReorder}>
							<DragDropProvider
								plugins={(defaults) => [
									...defaults,
									Feedback.configure({
										dropAnimation: null,
									}),
								]}
								onDragStart={onDragStart}
								onDragEnd={onDragEnd}>
								<PlannerReorderBox items={items} />
							</DragDropProvider>
						</ModalContainer>,
						document.body
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
