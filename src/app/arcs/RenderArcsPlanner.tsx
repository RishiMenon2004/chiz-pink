"use client"

import dynamic from "next/dynamic"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import { createPortal } from "react-dom"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { Feedback } from "@dnd-kit/dom"

import usePlanner, { WeaponRecord } from "@/hooks/usePlannerStore"

import { EnumItemLvls } from "@/database/items"
import { getAllArcsAsArray } from "@/database/arcs"

import ModalContainer, {
	ModalEventType,
} from "@/components/layout/ModalContainer"
import PlannerToolbar from "@/components/planner/PlannerToolbar"
import PlannerAddArcBox from "@/components/planner/PlannerAddArcBox"
import { EmptyFilter } from "@/app/inventory/RenderInventory"

import styles from "./page.module.css"
import toolbarStyles from "@/components/planner/plannerToolbar.module.css"
import { ArcDeductedInventoryProvider } from "./ArcDeductedInventoryProvider"

const PlannerArcBox = dynamic(
	() => import("@/components/planner/PlannerArcBox"),
	{ ssr: false }
)

type AddNewArcContextType = {
	newArcRecord: Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	setNewArcRecord: Dispatch<
		SetStateAction<Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">>
	>
}
export const AddNewArcContext = createContext<AddNewArcContextType>(null!)

export default function RenderArcsPlanner() {
	const { plannerData, updatePlanner, weapons } = usePlanner()

	const [activeDragArc, setActiveDragArc] = useState<string | null>(null)

	const [newArcRecord, setNewArcRecord] = useState<
		Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	>(null!)

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
		<ArcDeductedInventoryProvider arcRecords={Object.values(plannerData.arcs)}>
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

			<div className={`${styles.page}${activeDragArc ? ` ${styles.dragging}` : ""}`}>
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
