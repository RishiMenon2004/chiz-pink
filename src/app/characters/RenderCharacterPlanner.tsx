"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { DragEndEvent, DragStartEvent, Feedback } from "@dnd-kit/dom"

import type { ModalEventType } from "@/types"
import type { CharacterRecord } from "@/types/planner"

import { usePlannerStore } from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { PlannerInventoryProvider, generateNewCharacter } from "@/helpers"

import { AddNewCharContext } from "@/contexts"

import { InfoBox, ModalContainer, PullOutToolbar } from "@/components/layout"
import { MaterialGroup } from "@/components/inventory/"
import {
	PlannerAddCharacterBox,
	PlannerMaterialsList,
} from "@/components/planner"

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

	const allRequiredMaterials = useMemo(
		() => Object.entries(getAggregatedMaterials(plannerData, "char")),
		[plannerData]
	)

	const handleStartAdding = () => {
		setShowAddChar(true)
	}

	const addCharacter = (e: ModalEventType, charID: string) => {
		e.stopPropagation()
		const emptyChar = generateNewCharacter(charID)
		actions.addCharacter(emptyChar)
		setShowAddChar(false)
	}

	const cancelModal = (e: ModalEventType) => {
		e.stopPropagation()
		setShowAddChar(false)
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
					className={toolbarStyles.toolbarButton}
					onClick={handleStartAdding}>
					ADD CHARACTER
				</button>

				<AddNewCharContext.Provider
					value={{
						addCharacter,
					}}>
					{showAddChar &&
						createPortal(
							<ModalContainer onClose={cancelModal}>
								<PlannerAddCharacterBox onCancel={cancelModal} />
							</ModalContainer>,
							document.body
						)}
				</AddNewCharContext.Provider>
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
						{Object.values(plannerData.characters || {}).map(
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
