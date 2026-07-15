"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { DragEndEvent, DragStartEvent, Feedback } from "@dnd-kit/dom"

import type { ModalEventType } from "@/types"
import type { WeaponRecord } from "@/types/planner"

import { EnumItemLvls } from "@/data/items"
import { getAllArcsAsArray } from "@/data/arcs"

import { usePlannerStore } from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { AddNewArcContext } from "@/contexts"

import { InfoBox, ModalContainer, PullOutToolbar } from "@/components/layout"
import { MaterialGroup } from "@/components/inventory/"
import { PlannerAddArcBox } from "@/components/planner"
import { PlannerMaterialsList } from "@/components/planner/"

import { PlannerInventoryProvider } from "@/helpers"

import styles from "./page.module.css"
import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import plannerBoxStyles from "@/components/planner/plannerBox.module.css"

const PlannerArcBox = dynamic(
	() => import("@/components/planner").then((mod) => mod.PlannerArcBox),
	{ ssr: false }
)

export default function RenderArcsPlanner() {
	const { plannerData, actions } = usePlannerStore()

	const [activeDragArc, setActiveDragArc] = useState<string | null>(null)

	const [newArcRecord, setNewArcRecord] = useState<
		Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	>(null!)

	const allRequiredMaterials = useMemo(
		() => Object.entries(getAggregatedMaterials(plannerData, "arc")),
		[plannerData]
	)

	const handleStartAdding = () => {
		setNewArcRecord({
			id: getAllArcsAsArray()[0].id,
			currentLvl: EnumItemLvls.Lvl1,
			targetLvl: EnumItemLvls.Lvl80,
		})
	}

	const closeModal = (e: ModalEventType) => {
		e.stopPropagation()
		actions.addWeapon(newArcRecord)
		setNewArcRecord(null!)
	}

	const cancelModal = (e: ModalEventType) => {
		e.stopPropagation()
		setNewArcRecord(null!)
	}

	const onDragStart = (e: DragStartEvent) =>
		setActiveDragArc((e.operation.source?.id as string) || null)

	const onDragEnd = (e: DragEndEvent) => {
		if (e.canceled) return
		setActiveDragArc(null)

		const { source } = e.operation

		if (isSortable(source)) {
			const { initialIndex, index } = source

			if (initialIndex !== index) {
				const newArcsList = [
					...(Object.values(plannerData.arcs || {}) as WeaponRecord[]),
				]
				const [removed] = newArcsList.splice(initialIndex, 1)
				newArcsList.splice(index, 0, removed)

				const newArcsRecord: typeof plannerData.arcs = {}
				newArcsList.forEach((arcRecord) => {
					newArcsRecord[arcRecord.uid] = arcRecord
				})

				actions.updatePlanner({
					arcs: newArcsRecord,
				})
			}
		}
	}

	return (
		<PlannerInventoryProvider arcRecords={Object.values(plannerData.arcs)}>
			<PullOutToolbar>
				{/* =========================================================== */}
				{/*                     Adding New Entries                      */}
				{/* =========================================================== */}
				<button
					className={toolbarStyles.toolbarButton}
					onClick={handleStartAdding}>
					ADD ARC
				</button>

				<AddNewArcContext.Provider
					value={{ newArcRecord, setNewArcRecord }}>
					{newArcRecord &&
						createPortal(
							<ModalContainer
								onClose={closeModal}
								onCancel={cancelModal}>
								<PlannerAddArcBox onConfirm={closeModal} />
							</ModalContainer>,
							document.body
						)}
				</AddNewArcContext.Provider>
				{/* =========================================================== */}
			</PullOutToolbar>

			{/* ============================================================= */}
			{/*                     Empty Planner Message                     */}
			{/* ============================================================= */}
			{Object.entries(plannerData.arcs).length <= 0 && (
				<InfoBox>
					{
						"You don't have any arcs in the planner... Maybe you'd like to "
					}
					<a className="btn-anchor" onClick={handleStartAdding}>
						Add Something?
					</a>
				</InfoBox>
			)}
			{/* ============================================================= */}

			<div className={styles.page}>
				{/* =========================================================== */}
				{/*                   Total Materials Required                  */}
				{/* =========================================================== */}
				{allRequiredMaterials.length > 0 && (
					<MaterialGroup title="Total Required Materials">
						<div
							className={`${plannerBoxStyles.plannerRequiredMaterialsBox} ${styles.plannerRequiredMaterialsBox}`}>
							<PlannerMaterialsList
								materials={allRequiredMaterials.map(
									([id, { amount }]) => {
										return {
											id,
											amount,
										}
									}
								)}
							/>
						</div>
					</MaterialGroup>
				)}
				{/* =========================================================== */}
				
				<DragDropProvider
					plugins={(defaults) => [
						...defaults,
						Feedback.configure({
							dropAnimation: null,
						}),
					]}
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}>
					
					{/* ========================================================= */}
					{/*                       Planner Grid                        */}
					{/* ========================================================= */}
					<div className={styles.plannerGrid}>
						{Object.values(plannerData.arcs).map((arc, index) => (
							<PlannerArcBox
								key={arc.uid}
								arcRecord={arc}
								index={index}
							/>
						))}
						<DragOverlay>
							{activeDragArc && (
								<PlannerArcBox
									arcRecord={plannerData.arcs[activeDragArc]}
									index={-200}
								/>
							)}
						</DragOverlay>
					</div>
					{/* ========================================================= */}
				</DragDropProvider>
			</div>
		</PlannerInventoryProvider>
	)
}
