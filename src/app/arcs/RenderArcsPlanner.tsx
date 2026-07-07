"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { createPortal } from "react-dom"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { Feedback } from "@dnd-kit/dom"

import type { ModalEventType } from "@/types"
import type { WeaponRecord } from "@/types/planner"

import { EnumItemLvls, findMaterial } from "@/data/items"
import { getAllArcsAsArray } from "@/data/arcs"

import { usePlannerStore } from "@/hooks"

import { AddNewArcContext } from "@/contexts"

import { InfoBox, ModalContainer, PullOutToolbar } from "@/components/layout"
import { MaterialGroup } from "@/components/inventory/"
import { PlannerAddArcBox, PlannerMaterialBox } from "@/components/planner"

import { PlannerInventoryProvider } from "@/helpers/PlannerInventoryProvider"

import styles from "./page.module.css"
import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import { styles as arcBoxStyles } from "@/components/planner/ArcBox"

const PlannerArcBox = dynamic(
	() => import("@/components/planner").then((mod) => mod.PlannerArcBox),
	{ ssr: false }
)

export default function RenderArcsPlanner() {
	const { plannerData, updatePlanner, getAgregatedMaterials, weapons } =
		usePlannerStore()

	const [activeDragArc, setActiveDragArc] = useState<string | null>(null)

	const [newArcRecord, setNewArcRecord] = useState<
		Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	>(null!)

	const allRequiredMaterials = getAgregatedMaterials("arc")

	const closeModal = (e: ModalEventType) => {
		e.stopPropagation()
		weapons.addWeapon(newArcRecord)
		setNewArcRecord(null!)
	}

	const cancelModal = (e: ModalEventType) => {
		e.stopPropagation()
		setNewArcRecord(null!)
	}

	const handleStartAdding = () => {
		setNewArcRecord({
			id: getAllArcsAsArray()[0].id,
			currentLvl: EnumItemLvls.Lvl1,
			targetLvl: EnumItemLvls.Lvl80,
		})
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

			{Object.entries(plannerData.arcs).length <= 0 && (
				<InfoBox>
					{"You don't have anything planned... Maybe you'd like to "}
					<a className="btn-anchor" onClick={handleStartAdding}>
						Add Something?
					</a>
				</InfoBox>
			)}

			<div
				className={`${styles.page}${activeDragArc ? ` ${styles.dragging}` : ""}`}>
				{Object.values(allRequiredMaterials).length > 0 && (
					<MaterialGroup title="Total Required Materials">
						<div
							className={`${arcBoxStyles.arcRequiredMaterialsList} ${styles.arcRequiredMaterialsList}`}>
							{Object.entries(allRequiredMaterials).map(
								([id, { amount }]) => {
									return (
										<PlannerMaterialBox
											key={id}
											material={findMaterial(id)}
											requiredAmount={amount}
											entryIndex={-1}
										/>
									)
								}
							)}
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
					onDragStart={(e) =>
						setActiveDragArc(
							(e.operation.source?.id as string) || null
						)
					}
					onDragEnd={(e) => {
						if (e.canceled) return
						setActiveDragArc(null)

						const { source } = e.operation

						if (isSortable(source)) {
							const { initialIndex, index } = source

							if (initialIndex !== index) {
								const newArcsList = [
									...Object.values(plannerData.arcs),
								]
								const [removed] = newArcsList.splice(
									initialIndex,
									1
								)
								newArcsList.splice(index, 0, removed)

								const newArcsRecord: typeof plannerData.arcs = {}
								newArcsList.forEach((arcRecord) => {
									newArcsRecord[arcRecord.uid] = arcRecord
								})

								updatePlanner({
									...plannerData,
									arcs: newArcsRecord,
								})
							}
						}
					}}>
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
