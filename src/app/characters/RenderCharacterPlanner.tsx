"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { DragEndEvent, DragStartEvent, Feedback } from "@dnd-kit/dom"

import type { KeyMouseEventType } from "@/types"
import type { CharacterRecord } from "@/types/planner"

import { usePlannerStore } from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"
import { getAllMaterialsList } from "@/data/items"

import { PlannerInventoryProvider, generateNewCharacter } from "@/helpers"

import { AddNewCharContext } from "@/contexts"

import { InfoBox, ModalContainer, PullOutToolbar } from "@/components/layout"
import { MaterialGroup } from "@/components/inventory/"
import {
	PlannerAddCharacterBox,
	PlannerMaterialsList,
} from "@/components/planner"
import { PlannerReorderBox } from "@/components/layout/ReorderBox/PlannerReorderBox"

import styles from "./page.module.css"
import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import plannerBoxStyles from "@/components/planner/plannerBox.module.css"

const PlannerCharacterBox = dynamic(
	() => import("@/components/planner").then((mod) => mod.PlannerCharacterBox),
	{ ssr: false }
)

export default function RenderCharacterPlanner() {
	const { plannerData, actions } = usePlannerStore()

	const [activeDragItem, setActiveDragItem] = useState<string | null>(null)

	const [showAddChar, setShowAddChar] = useState<boolean>(false)

	const materialOrder = useMemo(() => {
		const order = new Map<string, number>()
		getAllMaterialsList().forEach((material, index) =>
			order.set(material.id, index)
		)
		return order
	}, [])

	const allRequiredMaterials = useMemo(
		() =>
			Object.entries(getAggregatedMaterials(plannerData, "char")).sort(
				([idA], [idB]) =>
					(materialOrder.get(idA) ?? 0) - (materialOrder.get(idB) ?? 0)
			),
		[plannerData, materialOrder]
	)

	const handleStartAdding = () => {
		setShowAddChar(true)
	}

	const addCharacter = (e: KeyMouseEventType, charID: string) => {
		e.stopPropagation()
		const emptyChar = generateNewCharacter(charID)
		actions.addCharacter(emptyChar)
		setShowAddChar(false)
	}

	const cancelAdd = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setShowAddChar(false)
	}

	const [showReorder, setShowReorder] = useState<boolean>(false)

	const handleStartReorder = () => {
		setShowReorder(true)
	}

	const closeReorder = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setShowReorder(false)
	}

	const onDragStart = (e: DragStartEvent) =>
		setActiveDragItem((e.operation.source?.id as string) || null)

	const onDragEnd = (e: DragEndEvent) => {
		if (e.canceled) return
		setActiveDragItem(null)

		const { source } = e.operation

		if (isSortable(source)) {
			const { initialIndex, index } = source

			if (initialIndex !== index) {
				const newCharsList = [
					...(Object.values(
						plannerData.characters || {}
					) as CharacterRecord[]),
				]
				const [removed] = newCharsList.splice(initialIndex, 1)
				newCharsList.splice(index, 0, removed)

				const newCharsRecord: typeof plannerData.characters = {}
				newCharsList.forEach((charRecord) => {
					newCharsRecord[charRecord.id] = charRecord
				})

				actions.updatePlanner({
					...plannerData,
					characters: newCharsRecord,
				})
			}
		}
	}

	return (
		<PlannerInventoryProvider
			itemRecords={Object.values(plannerData.characters)}>
			<PullOutToolbar>
				{/* =========================================================== */}
				{/*                     Adding New Entries                      */}
				{/* =========================================================== */}
				<button
					className={`pill-button ${toolbarStyles.toolbarButton} ${toolbarStyles.add}`}
					onClick={handleStartAdding}>
					ADD CHARACTER
					<AddNewCharContext.Provider
						value={{
							addCharacter,
						}}>
						{showAddChar &&
							createPortal(
								<ModalContainer onClickOut={cancelAdd}>
									<PlannerAddCharacterBox
										onCancel={cancelAdd}
									/>
								</ModalContainer>,
								document.body
							)}
					</AddNewCharContext.Provider>
				</button>
				{/* =========================================================== */}

				{/* =========================================================== */}
				{/*                       Adjusting Order                       */}
				{/* =========================================================== */}
				<button
					disabled={Object.values(plannerData.characters).length <= 1}
					className={`pill-button ${toolbarStyles.toolbarButton} ${plannerBoxStyles.hideOnDesktop}`}
					onClick={handleStartReorder}>
					ADJUST PRIORITY
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
									<PlannerReorderBox
										items={plannerData.characters}
									/>
								</DragDropProvider>
							</ModalContainer>,
							document.body
						)}
				</button>
				{/* =========================================================== */}
			</PullOutToolbar>

			{/* ============================================================= */}
			{/*                     Empty Planner Message                     */}
			{/* ============================================================= */}
			{Object.entries(plannerData.characters || {}).length <= 0 && (
				<InfoBox>
					{
						"You don't have any characters in the planner... Maybe you'd like to "
					}
					<a className="btn-anchor" onClick={handleStartAdding}>
						Add Something?
					</a>
				</InfoBox>
			)}
			{/* ============================================================= */}

			<main className={`page ${styles.page}`} role="main">
				{/* =========================================================== */}
				{/*                   Total Materials Required                  */}
				{/* =========================================================== */}
				{Object.values(allRequiredMaterials).length > 0 && (
					<MaterialGroup title="Required Materials">
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
						{Object.values(plannerData.characters).map(
							(char, index) => (
								<PlannerCharacterBox
									key={char.id}
									charRecord={char}
									index={index}
								/>
							)
						)}
						<DragOverlay>
							{activeDragItem && (
								<PlannerCharacterBox
									charRecord={
										plannerData.characters[activeDragItem]
									}
									index={-200}
								/>
							)}
						</DragOverlay>
					</div>
					{/* ========================================================= */}
				</DragDropProvider>
			</main>
		</PlannerInventoryProvider>
	)
}
