"use client"

import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { useSortable } from "@dnd-kit/react/sortable"

import { ModalEventType } from "@/types"
import { CharacterRecord, SkillLvlRecord } from "@/types/planner"

import { EnumItemLvls, findMaterial, getItemRarityStyle } from "@/data/items"
import { findCharacter } from "@/data/characters"

import { useInventoryStore, usePlannerStore } from "@/hooks"

import { PlannerBoxContext, usePlannerMaterialsContext } from "@/contexts"

import {
	AlertContainer,
	CharacterAvatar,
	ModalContainer,
} from "@/components/layout"
import {
	CharacterSkillGroup,
	ItemPhases,
	PlannerBoxButtonsContainer,
	PlannerMaterialsList,
} from "@/components/planner"

import plannerBoxStyles from "@/components/planner/plannerBox.module.css"
import styles from "./PlannerCharacterBox.module.css"

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
			const currentCumulativeInventory = cumulativeInventory.at(index) || {}
			const { craftedAmount } = currentCumulativeInventory[material.id] || {
				craftedAmount: 0,
			}
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

	const handleToggleSkill = (ability: keyof CharacterRecord["abilitySet"]) => {
		if (CharacterState.abilitySet[ability]) {
			const isDisabled = !CharacterState.abilitySet[ability].isDisabled

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

	const handleEnhancement = (e: MouseEvent) => {
		e.stopPropagation()
		const localInventory = { ...inventory }
		const currentCumulativeInventory = cumulativeInventory[index]

		if (allMaterialsAcquired()) {
			charRecord.requiredMaterials.forEach((material) => {
				const inventoryAmount = localInventory[material.id] || 0

				const currentCumulativeMaterial =
					currentCumulativeInventory[material.id]
				const craftedAmount = currentCumulativeMaterial?.craftedAmount

				if (craftedAmount && craftedAmount > 0) {
					const materialData = findMaterial(material.id)
					const linkedMaterials =
						materialData?.linkedMaterials?.map((linkedMaterialId) =>
							findMaterial(linkedMaterialId)
						) || []
					const lowerMaterial = linkedMaterials.find(
						(linkedMaterial) =>
							linkedMaterial.rarity === materialData.rarity - 1
					)?.id

					if (lowerMaterial) {
						localInventory[lowerMaterial] = Math.max(
							0,
							localInventory[lowerMaterial] - craftedAmount * 3
						)
					}
				}

				localInventory[material.id] = Math.max(
					0,
					inventoryAmount - material.amount
				)
			})

			updateInventory(localInventory)
			setCharacterState((prevState) => {
				const { abilitySet } = prevState
				const newState = {
					...prevState,
					currentLvl: prevState.targetLvl,
					abilitySet: {
						...abilitySet,
						basicAttack: {
							...abilitySet.basicAttack,
							isDisabled: true,
							currentLvl: abilitySet.basicAttack.targetLvl,
						},
						skill: {
							...abilitySet.skill,
							isDisabled: true,
							currentLvl: abilitySet.skill.targetLvl,
						},
						ultimate: {
							...abilitySet.ultimate,
							isDisabled: true,
							currentLvl: abilitySet.ultimate.targetLvl,
						},
						support: {
							...abilitySet.support,
							isDisabled: true,
							currentLvl: abilitySet.support.targetLvl,
						},
						lifeSkill1: {
							...abilitySet.lifeSkill1,
							isDisabled: true,
							currentLvl: abilitySet.lifeSkill1.targetLvl,
						},
						passive1: {
							...abilitySet.passive1,
							isDisabled: true,
						},
					},
				}

				if (abilitySet.lifeSkill2) {
					newState.abilitySet.lifeSkill2 = {
						...abilitySet.lifeSkill2,
						isDisabled: true,
						currentLvl: abilitySet.lifeSkill2.targetLvl,
					}
				}

				if (abilitySet.passive2) {
					newState.abilitySet.passive2 = {
						...abilitySet.passive2,
						isDisabled: true,
					}
				}

				if (abilitySet.passive3) {
					newState.abilitySet.passive3 = {
						...abilitySet.passive3,
						isDisabled: true,
					}
				}

				return newState
			})
		}
	}

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

	const { abilitySet } = charRecord

	const getSkillLvlPreview = (skill: SkillLvlRecord, target?: boolean) =>
		skill.isDisabled
			? "-"
			: String(target ? skill.targetLvl : skill.currentLvl)

	return (
		<div className={plannerBoxStyles.plannerBoxContainer} ref={ref}>
			<PlannerBoxContext.Provider
				value={{
					itemRecord: charRecord,
					entryIndex: index,
					allMaterialsAcquired,
					toggleDisable: handleDisable,
					handleEnhancement,
					handleDelete: handleDelete,
					changeHandlers: [
						handleCurrentLvlChange,
						handleTargetLvlChange,
						handleToggleSkill,
					],
					dragRef: handleRef,
				}}>
				<div
					className={`${plannerBoxStyles.plannerBox} ${getItemRarityStyle(char)} ${CharacterState.isDisabled ? `${plannerBoxStyles.plannerBoxDisabled} ${styles.noInteract}` : ""} ${dropPreviewOrDragOverlay().join(" ")}`}>
					<div className={plannerBoxStyles.infoContainer}>
						<div className={styles.charInfoTop}>
							<div className={styles.charAvatarContainer}>
								<div className={styles.charImageContainer}>
									<CharacterAvatar
										character={char}
										width={256}
										height={256}
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
							<details className={styles.charStatsSubSection}>
								<summary
									className={
										plannerBoxStyles.plannerSectionLabel
									}>
									Esper Abilities <br />
									<div
										className={styles.charStatPreview}
										onClick={(e) => {
											e.preventDefault()
										}}>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.basicAttack)} / ${getSkillLvlPreview(abilitySet.skill)} / ${getSkillLvlPreview(abilitySet.ultimate)} / ${getSkillLvlPreview(abilitySet.support)}`}
										</div>
										<div
											className={
												styles.charStatPreviewArrow
											}
										/>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.basicAttack, true)} / ${getSkillLvlPreview(abilitySet.skill, true)} / ${getSkillLvlPreview(abilitySet.ultimate, true)} / ${getSkillLvlPreview(abilitySet.support, true)}`}
										</div>
									</div>
									<div
										className={styles.charStatPreview}
										onClick={(e) => {
											e.preventDefault()
										}}>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.passive1)}${abilitySet.passive2 ? ` / ${getSkillLvlPreview(abilitySet.passive2)}` : ""}${abilitySet.passive3 ? ` / ${getSkillLvlPreview(abilitySet.passive3)}` : ""}`}
										</div>
										<div
											className={
												styles.charStatPreviewArrow
											}
										/>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.passive1, true)}${abilitySet.passive2 ? ` / ${getSkillLvlPreview(abilitySet.passive2, true)}` : ""}${abilitySet.passive3 ? ` / ${getSkillLvlPreview(abilitySet.passive3, true)}` : ""}`}
										</div>
									</div>
								</summary>
								<div className={styles.charStatsGrid}>
									<CharacterSkillGroup
										skill="basicAttack"
										label="Basic Attack"
									/>
									<CharacterSkillGroup
										skill="skill"
										label="Redirect Skill"
									/>
									<CharacterSkillGroup
										skill="ultimate"
										label="Ultimate"
									/>
									<CharacterSkillGroup
										skill="support"
										label="Support Skill"
									/>
									<CharacterSkillGroup
										skill="passive1"
										label="Passive 1"
									/>
									{abilitySet.passive2 && (
										<CharacterSkillGroup
											skill="passive2"
											label="Passive 2"
										/>
									)}
									{abilitySet.passive3 && (
										<CharacterSkillGroup
											skill="passive3"
											label="Passive 3"
										/>
									)}
								</div>
							</details>
							<details className={styles.charStatsSubSection}>
								<summary
									className={
										plannerBoxStyles.plannerSectionLabel
									}>
									Life Skills
									<br />
									<div
										className={styles.charStatPreview}
										onClick={(e) => {
											e.preventDefault()
										}}>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.lifeSkill1)}${abilitySet.lifeSkill2 ? ` / ${getSkillLvlPreview(abilitySet.lifeSkill2)}` : ""}`}
										</div>
										<div
											className={
												styles.charStatPreviewArrow
											}
										/>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.lifeSkill1, true)}${abilitySet.lifeSkill2 ? ` / ${getSkillLvlPreview(abilitySet.lifeSkill2, true)}` : ""}`}
										</div>
									</div>
								</summary>
								<div className={styles.charStatsGrid}>
									<CharacterSkillGroup
										skill="lifeSkill1"
										label="Life Skill 1"
									/>
									{abilitySet.lifeSkill2 && (
										<CharacterSkillGroup
											skill="lifeSkill2"
											label="Life Skill 2"
										/>
									)}
								</div>
							</details>
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
