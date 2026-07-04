"use client"

import dynamic from "next/dynamic"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import { createPortal } from "react-dom"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { Feedback } from "@dnd-kit/dom"

import { ArcDeductedInventoryProvider } from "./ArcDeductedInventoryProvider"

import { usePlannerStore } from "@/hooks"
import { WeaponRecord } from "@/hooks/usePlannerStore"

import { EnumItemLvls, findMaterial } from "@/data/items"
import { getAllArcsAsArray } from "@/data/arcs"

import { ModalContainer, ModalEventType } from "@/components/layout/Modal"
import MaterialGroup from "@/components/inventory/MaterialGroup"
import PlannerToolbar from "@/components/planner/PlannerToolbar"
import PlannerAddArcBox from "@/components/planner/arcs/PlannerAddArcBox"
import PlannerMaterialBox from "@/components/planner/PlannerMaterialBox"
import { EmptyFilter } from "@/app/inventory/RenderInventory"

import styles from "./page.module.css"
import toolbarStyles from "@/components/planner/plannerToolbar.module.css"
import arcBoxStyles from "@/components/planner/arcs/plannerArcBox.module.css"

const PlannerArcBox = dynamic(
	() => import("@/components/planner/arcs/PlannerArcBox"),
	{ ssr: false }
)

type AddNewArcContextType = {
	newArcRecord: Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	setNewArcRecord: Dispatch<
		SetStateAction<
			Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
		>
	>
}
export const AddNewArcContext = createContext<AddNewArcContextType>(null!)

export default function RenderArcsPlanner() {
	const { plannerData, updatePlanner, getAgregatedMaterials, weapons } =
		usePlannerStore()

	const [activeDragArc, setActiveDragArc] = useState<string | null>(null)

	const [newArcRecord, setNewArcRecord] = useState<
		Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	>(null!)

	const allRequiredMaterials = getAgregatedMaterials()

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
		<ArcDeductedInventoryProvider
			arcRecords={Object.values(plannerData.arcs)}>
			<PlannerToolbar>
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
			</PlannerToolbar>

			{Object.entries(plannerData.arcs).length <= 0 && (
				<EmptyFilter>
					{"You don't have anything planned... Maybe you'd like to "}
					<a className="btn-anchor" onClick={handleStartAdding}>
						Add Something?
					</a>
				</EmptyFilter>
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
		</ArcDeductedInventoryProvider>
	)
}
