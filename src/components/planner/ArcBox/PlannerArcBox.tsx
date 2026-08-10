"use client"

import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { useSortable } from "@dnd-kit/react/sortable"

import type { KeyMouseEventType } from "@/types"
import type { WeaponRecord } from "@/types/planner"

import { EnumItemLvls, getItemRarityStyle } from "@/data/items"
import { findArc } from "@/data/arcs"

import { useInventoryStore, usePlannerStore } from "@/hooks"

import { getRarityName } from "@/helpers"

import { PlannerBoxContext, usePlannerMaterialsContext } from "@/contexts"

import { AlertContainer, ArcIcon, ModalContainer } from "@/components/layout"
import { ItemPhases, PlannerMaterialsList } from "@/components/planner"
import { PlannerBoxButtonsContainer } from "@/components/planner/PlannerBoxButtonsContainer"

import plannerBoxStyles from "@/components/planner/RenderPlanner/plannerBox.module.css"
import styles from "./plannerArcBox.module.css"

export function PlannerArcBox({
	arcRecord,
	index,
}: {
	arcRecord: WeaponRecord
	index: number
}) {
	const { ref, handleRef, isDragging } = useSortable({
		id: arcRecord.uid,
		index,
	})

	const { inventory, updateInventory } = useInventoryStore()
	const cumulativeInventory = usePlannerMaterialsContext()

	const { actions } = usePlannerStore()

	const [currentLvl, setCurrentLvl] = useState<EnumItemLvls>(
		arcRecord.currentLvl
	)
	const [targetLvl, setTargetLvl] = useState<EnumItemLvls>(arcRecord.targetLvl)
	const [isDisabled, setIsDisabled] = useState<boolean>(arcRecord.isDisabled)

	const LvlOptions = Object.keys(EnumItemLvls)
		.filter((key) => isNaN(Number(key)))
		.map((key) => ({
			label: key.replace("Lvl", "").replace("A", "+"),
			value: EnumItemLvls[key as keyof typeof EnumItemLvls],
		}))

	const arc = findArc(arcRecord.id)

	const dropPreviewOrDragOverlay = () => {
		const classStyles = []

		if (isDragging) {
			if (index === -200) {
				classStyles.push(plannerBoxStyles.plannerBoxDragging)
			} else {
				classStyles.push(plannerBoxStyles.plannerBoxDropPreview)
			}
		}

		return classStyles
	}

	const allMaterialsAcquired = () => {
		if (targetLvl === currentLvl) return false

		return arcRecord.requiredMaterials.every((material) => {
			const inventoryAmount = inventory[material.id] || 0
			const currentCumulativeInventor = cumulativeInventory.at(index) || {}
			const { craftedAmount } = currentCumulativeInventor[material.id] || {
				craftedAmount: 0,
			}
			return inventoryAmount + (craftedAmount || 0) >= material.amount
		})
	}

	function handleCurrentChange(e: ChangeEvent<HTMLSelectElement>) {
		const value = Number(e.currentTarget.value)
		setCurrentLvl(value)
		if (value > targetLvl) {
			setTargetLvl(value)
		}
	}
	function handleTargetChange(e: ChangeEvent<HTMLSelectElement>) {
		const value = Number(e.currentTarget.value)
		setTargetLvl(value)
		if (value < currentLvl) {
			setCurrentLvl(value)
		}
	}

	useEffect(() => {
		if (
			currentLvl === arcRecord.currentLvl &&
			targetLvl === arcRecord.targetLvl &&
			isDisabled === arcRecord.isDisabled
		) {
			return
		}

		actions.updateWeapon({
			...arcRecord,
			currentLvl,
			targetLvl,
			isDisabled,
		} as WeaponRecord)
		// disable warning because other deps trigger this effect unnecessarily
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentLvl, targetLvl, isDisabled])

	const handleEnhancement = (e: MouseEvent) => {
		e.stopPropagation()
		const localInventory = { ...inventory }
		const currentCumulativeInventory = cumulativeInventory[index]

		if (allMaterialsAcquired()) {
			arcRecord.requiredMaterials.forEach((material) => {
				const inventoryAmount = localInventory[material.id] || 0

				const currentCumulativeMaterial =
					currentCumulativeInventory[material.id]
				const craftedFrom = currentCumulativeMaterial?.craftedFrom ?? []

				craftedFrom.forEach(({ id, amount }) => {
					localInventory[id] = Math.max(
						0,
						(localInventory[id] || 0) - amount
					)
				})

				localInventory[material.id] = Math.max(
					0,
					inventoryAmount - material.amount
				)
			})

			updateInventory(localInventory)
			setCurrentLvl(targetLvl)
		}
	}

	const handleDisable = (e: MouseEvent) => {
		e.stopPropagation()
		setIsDisabled((prev) => {
			return !prev
		})
	}

	const [showDeleteConfirmation, setShowDeleteConfirmation] =
		useState<boolean>(false)

	const handleDelete = (e: MouseEvent) => {
		e.stopPropagation()
		setShowDeleteConfirmation(true)
	}

	const onDeleteCancel = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setShowDeleteConfirmation(false)
	}
	const onDeleteConfim = (e: KeyMouseEventType) => {
		e.stopPropagation()
		actions.deleteWeapon(arcRecord)
		setShowDeleteConfirmation(false)
	}

	return (
		<div className={plannerBoxStyles.plannerBoxContainer} ref={ref}>
			<PlannerBoxContext.Provider
				value={{
					itemRecord: arcRecord,
					entryIndex: index,
					allMaterialsAcquired,
					toggleDisable: handleDisable,
					handleEnhancement,
					handleDelete,
					changeHandlers: [],
					dragRef: handleRef,
				}}>
				<div
					className={`${plannerBoxStyles.plannerBox} ${getItemRarityStyle(arc)} ${isDisabled ? `${plannerBoxStyles.plannerBoxDisabled} ${styles.noInteract}` : ""} ${dropPreviewOrDragOverlay().join(" ")}`}>
					<div
						className={`metallic-panel ${plannerBoxStyles.infoContainer} ${styles.infoContainer}`}>
						<div className={styles.arcInfoTop}>
							<div className={styles.arcImageContainer}>
								<ArcIcon
									arc={arc}
									width={256}
									height={256}
									loading="eager"
								/>
								<div className={styles.arcLabelContainer}>
									{arc.isFeatured
										? "FEATURED"
										: arc.isPreview
											? "PREVIEW"
											: getRarityName(
													arc.rarity
												).toLocaleUpperCase()}
								</div>
							</div>
							<div className={styles.arcStatsSection}>
								<div className={styles.arcStatsName}>
									{arc.name}
								</div>

								<span className={styles.arcStatsLvlContainer}>
									<div className={styles.arcPhases}>
										<ItemPhases lvl={currentLvl} />
									</div>
									<div className={styles.arcStatsLvl}>
										<span>Current Lvl.</span>
										<select
											className="inset-control"
											value={currentLvl}
											onChange={handleCurrentChange}
											tabIndex={0}>
											{LvlOptions.map((opt) => (
												<option
													key={opt.value}
													value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
									</div>
								</span>

								<span className={styles.arcStatsLvlContainer}>
									<div className={styles.arcPhases}>
										<ItemPhases lvl={targetLvl} />
									</div>
									<div className={styles.arcStatsLvl}>
										<span>Target Lvl.</span>
										<select
											className="inset-control"
											value={targetLvl}
											onChange={handleTargetChange}
											tabIndex={0}>
											{LvlOptions.map((opt) => (
												<option
													key={opt.value}
													value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
									</div>
								</span>
							</div>
						</div>
						<span className={plannerBoxStyles.plannerSectionLabel}>
							Required Materials
						</span>
						<div
							className={
								plannerBoxStyles.plannerRequiredMaterialsBox
							}>
							<PlannerMaterialsList />
						</div>
					</div>

					<PlannerBoxButtonsContainer />
				</div>
			</PlannerBoxContext.Provider>
			{showDeleteConfirmation &&
				createPortal(
					<ModalContainer onClickOut={onDeleteCancel}>
						<AlertContainer
							type="confirm"
							onConfirm={onDeleteConfim}
							cancelLabel="CANCEL"
							onCancel={onDeleteCancel}>
							{"A-are you sure you want to delete this Arc?"}
						</AlertContainer>
					</ModalContainer>,
					document.body
				)}
		</div>
	)
}
