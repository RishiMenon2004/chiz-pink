"use client"

import {
	AddNewArcContext,
	AddNewCharContext,
	usePlannerSectionContext,
} from "@/contexts"

import { ModalContainer, PullOutToolbar } from "@/components/layout"

import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import styles from "@/components/planner/RenderPlanner/renderPlanner.module.css"
import { ConfigCheckbox } from "@/components/settings"
import { useState } from "react"
import { createPortal } from "react-dom"
import { usePlannerStore, useSettingsStore } from "@/hooks"
import { KeyMouseEventType } from "@/types"
import { generateNewCharacter } from "@/helpers"
import { PlannerAddArcBox, PlannerAddCharacterBox } from "@/components/planner"
import { EnumItemLvls } from "@/data/items"
import { getAllArcsList } from "@/data/arcs"
import { WeaponRecord } from "@/types/planner"
import { useSelectedLayoutSegment } from "next/navigation"

export function PlannerToolbar() {
	const { actions } = usePlannerStore()
	const { settings, actions: settingsActions } = useSettingsStore()

	const combinedEnabled = settings.appearance?.["use-hybrid-planner"] ?? false

	const segment = useSelectedLayoutSegment()
	const { section } = usePlannerSectionContext()
	const plannerType = segment ? section : "both"

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

	const [newArcRecord, setNewArcRecord] = useState<Omit<
		WeaponRecord,
		"uid" | "requiredMaterials" | "isDisabled"
	> | null>(null)
	const handleStartAddingArc = () =>
		setNewArcRecord({
			id: getAllArcsList().find((arc) => arc.isFeatured)?.id || "us",
			currentLvl: EnumItemLvls.Lvl1,
			targetLvl: EnumItemLvls.Lvl80,
		})
	const addArc = (e: KeyMouseEventType) => {
		e.stopPropagation()
		if (newArcRecord) actions.addWeapon(newArcRecord)
		setNewArcRecord(null)
	}
	const cancelAddArc = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setNewArcRecord(null)
	}

	return (
		<PullOutToolbar>
			{(plannerType === "characters" || plannerType === "both") && (
				<button
					className={`pill-button ${toolbarStyles.toolbarButton} ${toolbarStyles.add}`}
					onClick={handleStartAddingChar}>
					ADD CHARACTER
				</button>
			)}
			<AddNewCharContext.Provider value={{ addCharacter }}>
				{showAddChar &&
					createPortal(
						<ModalContainer onClickOut={cancelAddChar}>
							<PlannerAddCharacterBox onCancel={cancelAddChar} />
						</ModalContainer>,
						document.body
					)}
			</AddNewCharContext.Provider>

			{(plannerType === "arcs" || plannerType === "both") && (
				<button
					className={`pill-button ${toolbarStyles.toolbarButton} ${toolbarStyles.add}`}
					onClick={handleStartAddingArc}>
					ADD ARC
				</button>
			)}
			<AddNewArcContext.Provider value={{ newArcRecord, setNewArcRecord }}>
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

			<div
				id="adjust-priority"
				className={toolbarStyles.toolbarButton}></div>
			<label className={`pill-button ${styles.pageConfig}`}>
				<ConfigCheckbox
					name={"Hybrid Planner"}
					checked={combinedEnabled}
					onChange={() => {
						settingsActions.setConfig("appearance", {
							"use-hybrid-planner": !combinedEnabled,
						})
					}}
				/>
			</label>
		</PullOutToolbar>
	)
}
