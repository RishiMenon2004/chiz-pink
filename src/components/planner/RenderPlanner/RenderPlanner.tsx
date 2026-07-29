"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { DragEndEvent, DragStartEvent, Feedback } from "@dnd-kit/dom"

import type { KeyMouseEventType } from "@/types"
import type {
	CharacterRecord,
	PlannerRecord,
	WeaponRecord,
} from "@/types/planner"

import { EnumItemLvls, getAllMaterialsList } from "@/data/items"
import { getAllArcsList } from "@/data/arcs"

import { usePlannerStore } from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { PlannerInventoryProvider, generateNewCharacter } from "@/helpers"

import { AddNewArcContext, AddNewCharContext } from "@/contexts"

import { InfoBox, ModalContainer, PullOutToolbar } from "@/components/layout"
import { MaterialGroup } from "@/components/inventory/"
import { PlannerAddArcBox } from "../AddArcBox"
import { PlannerAddCharacterBox } from "../AddCharacterBox"
import { PlannerMaterialsList } from "../MaterialsList"
import { PlannerReorderBox } from "@/components/layout/ReorderBox/PlannerReorderBox"

import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import plannerBoxStyles from "./plannerBox.module.css"
import styles from "./renderPlanner.module.css"

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
	plannerType: keyof PlannerRecord
}) {
	const { plannerData, actions } = usePlannerStore()
	const items = plannerData[plannerType]
	const itemsList: WeaponRecord[] | CharacterRecord[] =
		Object.values(items) ?? []

	const [activeDragId, setActiveDragId] = useState<string | null>(null)

	const allRequiredMaterials = useMemo(
		() =>
			Object.entries(
				getAggregatedMaterials(
					plannerData,
					plannerType === "characters" ? "char" : "arc"
				)
			).sort(
				([idA], [idB]) =>
					(materialOrder.get(idA) ?? 0) - (materialOrder.get(idB) ?? 0)
			),
		[plannerData, plannerType]
	)

	const [showAddChar, setShowAddChar] = useState(false)
	const handleStartAddingChar = () => setShowAddChar(true)
	const addCharacter = (e: KeyMouseEventType, charID: string) => {
		e.stopPropagation()
		actions.addCharacter(generateNewCharacter(charID))
		setShowAddChar(false)
	}
	const cancelAddChar = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setShowAddChar(false)
	}

	const [newArcRecord, setNewArcRecord] = useState<
		Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	>(null!)
	const handleStartAddingArc = () =>
		setNewArcRecord({
			id: getAllArcsList()[0].id,
			currentLvl: EnumItemLvls.Lvl1,
			targetLvl: EnumItemLvls.Lvl80,
		})
	const addArc = (e: KeyMouseEventType) => {
		e.stopPropagation()
		actions.addWeapon(newArcRecord)
		setNewArcRecord(null!)
	}
	const cancelAddArc = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setNewArcRecord(null!)
	}

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

		const newRecord: typeof items = {}
		list.forEach((item) => {
			newRecord["uid" in item ? item.uid : item.id] = item
		})
		actions.updatePlanner({ [plannerType]: newRecord })
	}

	return (
		<PlannerInventoryProvider itemRecords={Object.values(items)}>
			<PullOutToolbar>
				{plannerType === "characters" ? (
					<button
						className={`pill-button ${toolbarStyles.toolbarButton} ${toolbarStyles.add}`}
						onClick={handleStartAddingChar}>
						ADD CHARACTER
						<AddNewCharContext.Provider value={{ addCharacter }}>
							{showAddChar &&
								createPortal(
									<ModalContainer onClickOut={cancelAddChar}>
										<PlannerAddCharacterBox
											onCancel={cancelAddChar}
										/>
									</ModalContainer>,
									document.body
								)}
						</AddNewCharContext.Provider>
					</button>
				) : (
					<button
						className={`pill-button ${toolbarStyles.toolbarButton} ${toolbarStyles.add}`}
						onClick={handleStartAddingArc}>
						ADD ARC
						<AddNewArcContext.Provider
							value={{ newArcRecord, setNewArcRecord }}>
							{newArcRecord &&
								createPortal(
									<ModalContainer onClickOut={cancelAddArc}>
										<PlannerAddArcBox
											onConfirm={addArc}
											onCancel={cancelAddArc}
										/>
									</ModalContainer>,
									document.body
								)}
						</AddNewArcContext.Provider>
					</button>
				)}

				<button
					disabled={itemsList.length <= 1}
					className={`pill-button ${toolbarStyles.toolbarButton} ${styles.hideOnDesktop}`}
					onClick={() => setShowReorder(true)}>
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
									<PlannerReorderBox items={items} />
								</DragDropProvider>
							</ModalContainer>,
							document.body
						)}
				</button>
			</PullOutToolbar>

			{itemsList.length <= 0 && (
				<InfoBox>
					{`You don't have any ${plannerType} in the planner... Maybe you'd like to `}
					<a
						className="btn-anchor"
						onClick={
							plannerType === "characters"
								? handleStartAddingChar
								: handleStartAddingArc
						}>
						Add Something?
					</a>
				</InfoBox>
			)}

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
