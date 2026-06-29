"use client"

import dynamic from "next/dynamic"
import styles from "./page.module.css"
import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { Feedback } from "@dnd-kit/dom"
import { isSortable } from "@dnd-kit/react/sortable"
import usePlanner, { WeaponRecord } from "@/hooks/usePlannerStore"
import { EnumItemLvls } from "@/database/items"
import { Inventory, useInventoryStore } from "@/hooks/useInventoryStore"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import { getAllArcs } from "@/database/arcs"
import { createPortal } from "react-dom"
import ModalContainer, {
	ModalEventType,
} from "@/components/layout/ModalContainer"
import PlannerAddArcBox from "@/components/planner/PlannerAddArcBox"

const PlannerArcBox = dynamic(
	() => import("@/components/planner/PlannerArcBox"),
	{ ssr: false }
)

type AddNewArcContextType = {
	newArcRecord: Omit<WeaponRecord, "uid" | "requiredMaterials">
	setNewArcRecord: Dispatch<
		SetStateAction<Omit<WeaponRecord, "uid" | "requiredMaterials">>
	>
}

export const AddNewArcContext = createContext<AddNewArcContextType>(null!)

type ArcPlannerUsableMaterialsType = {
	currentInventory: Inventory
}

export const ArcPlannerUsableMaterialsContext =
	createContext<ArcPlannerUsableMaterialsType>(null!)

export default function RenderArcsPlanner() {
	const { plannerData, updatePlanner, weapons } = usePlanner()
	const { inventory } = useInventoryStore()

	const [activeDragArc, setActiveDragArc] = useState<string | null>(null)

	const [newArcRecord, setNewArcRecord] = useState<
		Omit<WeaponRecord, "uid" | "requiredMaterials">
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

	return (
		<div className={`${styles.page} ${activeDragArc && styles.dragging}`}>
			{/* =========================================================== */}
			{/*                     Adding New Entries                      */}
			{/* =========================================================== */}
			<button
				onClick={() => {
					setNewArcRecord({
						id: Object.values(getAllArcs())[0].id,
						currentLvl: EnumItemLvls.Lvl1,
						targetLvl: EnumItemLvls.Lvl80,
					})
				}}>
				Add
			</button>

			<AddNewArcContext.Provider
				value={{ newArcRecord, setNewArcRecord }}>
				{newArcRecord &&
					createPortal(
						<ModalContainer
							onClose={closeModal}
							onCancel={cancelModal}>
							<PlannerAddArcBox />
						</ModalContainer>,
						document.body
					)}
			</AddNewArcContext.Provider>
			{/* =========================================================== */}

			<DragDropProvider
				plugins={(defaults) => [
					...defaults,
					Feedback.configure({
						dropAnimation: null,
					}),
				]}
				onDragStart={(e) =>
					setActiveDragArc((e.operation.source?.id as string) || null)
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
					<ArcPlannerUsableMaterialsContext.Provider
						value={{ currentInventory: inventory }}>
						{Object.values(plannerData.arcs).map((arc, index) => (
							<PlannerArcBox
								key={arc.uid}
								arcRecord={arc}
								index={index}
							/>
						))}
					</ArcPlannerUsableMaterialsContext.Provider>

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
	)
}
