"use client"

import Image from "next/image"

import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { useSortable } from "@dnd-kit/react/sortable"

import { ModalEventType } from "@/types"
import { CharacterRecord } from "@/types/planner"

import { EnumItemLvls, getItemRarityStyle } from "@/data/items"
import { findCharacter } from "@/data/characters/characterList"

import { useInventoryStore, usePlannerStore } from "@/hooks"

import { PlannerBoxContext, usePlannerMaterialsContext } from "@/contexts"

import { AlertContainer, ModalContainer } from "@/components/layout"
import { ItemPhases, PlannerMaterialsList } from "@/components/planner"
import { PlannerBoxButtonsContainer } from "../PlannerBoxButtonsContainer"

import plannerBoxStyles from "@/components/planner/plannerBox.module.css"
import styles from "./PlannerCharacterBox.module.css"
import { CharacterSkillGroup } from "@/components/planner/CharacterSkillGroup/CharacterSkillGroup"

export function PlannerCharacterBox({
	charRecord,
	index,
}: {
	charRecord: CharacterRecord
	index: number
}) {
	const { ref, handleRef, isDragging } = useSortable({
		id: charRecord.id,
		index,
	})

	const { inventory, updateInventory } = useInventoryStore()
	const cumulativeInventory = usePlannerMaterialsContext()

	const { actions } = usePlannerStore()

	const [CharacterState, setCharacterState] = useState<CharacterRecord>({
		...charRecord,
	})

	const LvlOptions = Object.keys(EnumItemLvls)
		.filter((key) => isNaN(Number(key)))
		.map((key) => ({
			label: key.replace("Lvl", "").replace("A", "+"),
			value: EnumItemLvls[key as keyof typeof EnumItemLvls],
		}))

	const char = findCharacter(charRecord.id)

	const dropPreviewOrDragOverlay = () => {
		const classStyles: string[] = []

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
		if (charRecord.targetLvl === charRecord.currentLvl) return false

		return charRecord.requiredMaterials.every((material) => {
			const inventoryAmount = inventory[material.id] || 0
			const currentCumulativeInventor = cumulativeInventory.at(index) || {}
			const { craftedAmount } = currentCumulativeInventor[material.id] || 0
			return inventoryAmount + (craftedAmount || 0) >= material.amount
		})
	}

	const handleCurrentLvlChange = (
		e: ChangeEvent<HTMLSelectElement>,
		ability?: keyof CharacterRecord["abilitySet"]
	) => {
		const value = Number(e.currentTarget.value)
		const newState = () => {
			if (ability && CharacterState.abilitySet[ability]) {
				const { targetLvl } = CharacterState.abilitySet[ability]
				return {
					...CharacterState,
					abilitySet: {
						...CharacterState.abilitySet,
						[ability]: {
							...CharacterState.abilitySet[ability],
							currentLvl: value,
							targetLvl: value > targetLvl ? value : targetLvl,
						},
					},
				}
			} else {
				const { targetLvl } = CharacterState
				return {
					...CharacterState,
					currentLvl: value,
					targetLvl: value > targetLvl ? value : targetLvl,
				}
			}
		}
		setCharacterState(newState())
	}

	const handleTargetLvlChange = (
		e: ChangeEvent<HTMLSelectElement>,
		ability?: keyof CharacterRecord["abilitySet"]
	) => {
		const value = Number(e.currentTarget.value)
		setCharacterState((prevState) => {
			if (ability && prevState.abilitySet[ability]) {
				const { currentLvl } = prevState.abilitySet[ability]
				return {
					...prevState,
					abilitySet: {
						...prevState.abilitySet,
						[ability]: {
							...prevState.abilitySet[ability],
							currentLvl: value < currentLvl ? value : currentLvl,
							targetLvl: value,
						},
					},
				}
			} else {
				const { currentLvl } = prevState
				return {
					...prevState,
					currentLvl: value < currentLvl ? value : currentLvl,
					targetLvl: value,
				}
			}
		})
	}

	const handleToggleSkill = (
		e: ChangeEvent<HTMLInputElement>,
		ability: keyof CharacterRecord["abilitySet"]
	) => {
		const isDisabled = !e.currentTarget.checked

		if (CharacterState.abilitySet[ability]) {
			setCharacterState((prevState) => ({
				...prevState,
				abilitySet: {
					...prevState.abilitySet,
					[ability]: {
						...prevState.abilitySet[ability],
						isDisabled,
					},
				},
			}))
		}
	}

	useEffect(() => {
		actions.updateCharacter(CharacterState)

		// disable warning because other deps trigger this effect unnecessarily
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CharacterState])

	const handleDisable = (e: MouseEvent) => {
		e.stopPropagation()
		setCharacterState((prevState) => {
			return {
				...prevState,
				isDisabled: !prevState.isDisabled,
			}
		})
	}

	const [showDeleteConfirmation, setShowDeleteConfirmation] =
		useState<boolean>(false)

	const handleDelete = (e: MouseEvent) => {
		e.stopPropagation()
		setShowDeleteConfirmation(true)
	}

	const onDeleteCancel = (e: ModalEventType) => {
		e.stopPropagation()
		setShowDeleteConfirmation(false)
	}
	const onDeleteConfim = (e: ModalEventType) => {
		e.stopPropagation()
		actions.deleteCharacter(charRecord)
		setShowDeleteConfirmation(false)
	}

	const { abilitySet } = CharacterState

	return (
		<div className={plannerBoxStyles.plannerBoxContainer} ref={ref}>
			<PlannerBoxContext.Provider
				value={{
					itemRecord: charRecord,
					entryIndex: index,
					allMaterialsAcquired,
					toggleDisable: handleDisable,
					handleEnhancement: (e: MouseEvent) => {},
					handleDelete: handleDelete,
					dragRef: handleRef,
				}}>
				<div
					className={`${plannerBoxStyles.plannerBox} ${getItemRarityStyle(char)} ${CharacterState.isDisabled ? plannerBoxStyles.plannerBoxDisabled : ""} ${dropPreviewOrDragOverlay().join(" ")}`}>
					<div className={plannerBoxStyles.infoContainer}>
						<div className={styles.charInfoTop}>
							<div className={styles.charAvatarContainer}>
								<div className={styles.charImageContainer}>
									<Image
										src={`/characters/avatar/${char.imageSrc}`}
										width={256}
										height={256}
										alt={`Character "${char.name}" Icon`}
										loading="eager"
									/>
								</div>
							</div>
							<div className={styles.charNameBox}>{char.name}</div>
							<div className={styles.charLevels}>
								<div className={styles.charLevelSection}>
									<div className={styles.charLevelSectionLabel}>
										Current Level
									</div>
									<div className={styles.charLvlPhases}>
										<ItemPhases
											lvl={CharacterState.currentLvl}
										/>
									</div>
									<select
										value={CharacterState.currentLvl}
										onChange={handleCurrentLvlChange}
										tabIndex={1}>
										{LvlOptions.map((opt) => (
											<option
												key={opt.value}
												value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</div>
								<div className={styles.charLevelSection}>
									<div className={styles.charLevelSectionLabel}>
										Target Level
									</div>
									<div className={styles.charLvlPhases}>
										<ItemPhases
											lvl={CharacterState.targetLvl}
										/>
									</div>
									<select
										value={CharacterState.targetLvl}
										onChange={handleTargetLvlChange}
										tabIndex={1}>
										{LvlOptions.map((opt) => (
											<option
												key={opt.value}
												value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
						<div className={styles.charStatsSection}>
							<div className={styles.charStatsSubSection}>
								<span
									className={
										plannerBoxStyles.plannerSectionLabel
									}>
									Esper Abilities
								</span>
								<div className={styles.charStatsGrid}>
									<CharacterSkillGroup
										charRecord={charRecord}
										skill="basicAttack"
										label="Basic Attack"
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>
									<CharacterSkillGroup
										charRecord={charRecord}
										skill="skill"
										label="Redirect Skill"
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>
									<CharacterSkillGroup
										charRecord={charRecord}
										skill="ultimate"
										label="Ultimate"
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>
									<CharacterSkillGroup
										charRecord={charRecord}
										skill="support"
										label="Support Skill"
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>
									<CharacterSkillGroup
										charRecord={charRecord}
										skill="passive1"
										label={charRecord.abilitySet.passive2 ? "Passive 1" : "Passive"}
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>
									{charRecord.abilitySet.passive2 && <CharacterSkillGroup
										charRecord={charRecord}
										skill="passive2"
										label="Passive 2"
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>}
									{charRecord.abilitySet.passive3 && <CharacterSkillGroup
										charRecord={charRecord}
										skill="passive3"
										label="Passive 3"
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>}
								</div>
							</div>
							<div className={styles.charStatsSubSection}>
								<span
									className={
										plannerBoxStyles.plannerSectionLabel
									}>
									Life Skills
								</span>
								<div className={styles.charStatsGrid}>
									<CharacterSkillGroup
										charRecord={charRecord}
										skill="lifeSkill1"
										label={charRecord.abilitySet.lifeSkill2 ? "Life Skill 1" : "Life Skill"}
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>
									{charRecord.abilitySet.passive2 && <CharacterSkillGroup
										charRecord={charRecord}
										skill="lifeSkill2"
										label="Life Skill 2"
										handleToggleSkill={handleToggleSkill}
										handleCurrentLvlChange={handleCurrentLvlChange}
										handleTargetLvlChange={handleTargetLvlChange}
									/>}
								</div>
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
					<ModalContainer
						onClose={onDeleteConfim}
						onCancel={onDeleteCancel}>
						<AlertContainer
							type="yes-no"
							onConfirm={onDeleteConfim}
							onCancel={onDeleteCancel}>
							{"A-are you sure you want to delete this Character?"}
						</AlertContainer>
					</ModalContainer>,
					document.body
				)}
		</div>
	)
}
