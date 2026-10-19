"use client"

import {
	ChangeEvent,
	CSSProperties,
	MouseEvent,
	useEffect,
	useState,
} from "react"
import { createPortal } from "react-dom"
import Link from "next/link"

import { useSortable } from "@dnd-kit/react/sortable"

import { KeyMouseEventType } from "@/types"
import { CharacterRecord, SkillLvlRecord } from "@/types/planner"

import { EnumItemLvls, findMaterial, getItemRarityStyle } from "@/data/items"
import { findCharacter } from "@/data/characters"

import {
	useInventoryStore,
	useMaterialEditorModal,
	usePlannerStore,
	useTooltip,
} from "@/hooks"

import { getCharacterBannerThemeColor } from "@/helpers/bannerStatus"

import { PlannerBoxContext, usePlannerMaterialsContext } from "@/contexts"

import {
	AlertContainer,
	CharacterAvatar,
	ModalContainer,
} from "@/components/layout"
import { CharacterSkillGroup } from "../CharacterSkillGroup"
import { ItemPhases } from "../ItemPhases"
import { PlannerBoxButtonsContainer } from "../PlannerBoxButtonsContainer"
import { PlannerMaterialsList } from "../MaterialsList"

import plannerBoxStyles from "@/components/planner/RenderPlanner/plannerBox.module.css"
import topStyles from "../ArcBox/plannerArcBox.module.css"
import styles from "./PlannerCharacterBox.module.css"
import { beetleCoin, expHunterGuideSet } from "@/data/items/materials"
import { Material } from "@/types/item"

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

	const buildAdjustmentMaterials = (): Material[] => {
		const matList: Material[] = [beetleCoin]

		if (charRecord.targetLvl > charRecord.currentLvl) {
			matList.push(...expHunterGuideSet)
		}

		charRecord.requiredMaterials.forEach((material) => {
			const { craftedAmount } =
				cumulativeInventory[index]?.[material.id] ?? {}
			if ((craftedAmount ?? 0) > 0) {
				const craftingMaterial = findMaterial(material.id)
				craftingMaterial.linkedMaterials?.forEach((mat) => {
					matList.push(findMaterial(mat))
				})
				matList.push(craftingMaterial)
			}
		})

		return matList
	}

	const [adjustmentMaterials, setAdjustmentMaterials] = useState<Material[]>(
		buildAdjustmentMaterials
	)

	const {
		ModalComponent: FinalAdjustmentModal,
		showModal: showFinalAdjustmenModal,
	} = useMaterialEditorModal(plannerBoxStyles.modalMaterialBoxContainer)

	const LvlOptions = Object.keys(EnumItemLvls)
		.filter((key) => isNaN(Number(key)))
		.map((key) => ({
			label: key.replace("Lvl", "").replace("A", "+"),
			value: EnumItemLvls[key as keyof typeof EnumItemLvls],
		}))

	const char = findCharacter(charRecord.id)
	const themeColor = getCharacterBannerThemeColor(char.id)

	// One tooltip shared by the name and image links to the profile page.
	const {
		Tooltip: ProfileTooltip,
		showTooltip: showProfileTooltip,
		hideTooltip: hideProfileTooltip,
	} = useTooltip()

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
		const currentCmltInv = cumulativeInventory[index] || {}
		const materials = charRecord.requiredMaterials

		let needsMats = false

		const hasAvailableMats = materials.every((mat) => {
			if (mat.amount > 0) needsMats = true
			const owned = inventory[mat.id] || 0
			const crafted = currentCmltInv[mat.id]?.craftedAmount || 0

			return owned + crafted >= mat.amount
		})

		return needsMats && hasAvailableMats
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
		if (JSON.stringify(CharacterState) === JSON.stringify(charRecord)) {
			return
		}

		actions.updateCharacter(CharacterState)

		// disable warning because other deps trigger this effect unnecessarily
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CharacterState])

	const handleEnhancement = (e: MouseEvent) => {
		e.stopPropagation()
		const localInventory = { ...inventory }
		const currentCumulativeInventory = cumulativeInventory[index] || {}

		if (allMaterialsAcquired()) {
			setAdjustmentMaterials(buildAdjustmentMaterials())

			charRecord.requiredMaterials.forEach((material) => {
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
						passive2: {
							...abilitySet.passive2,
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

				if (abilitySet.passive3) {
					newState.abilitySet.passive3 = {
						...abilitySet.passive3,
						isDisabled: true,
					}
				}

				return newState
			})

			showFinalAdjustmenModal()
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

	const cancelDelete = (e: KeyMouseEventType) => {
		e.stopPropagation()
		setShowDeleteConfirmation(false)
	}
	const confirmDelete = (e: KeyMouseEventType) => {
		e.stopPropagation()
		actions.deleteCharacter(charRecord)
		setShowDeleteConfirmation(false)
	}

	const { abilitySet } = charRecord

	const getSkillLvlPreview = (skill: SkillLvlRecord, target?: boolean) =>
		skill.isDisabled ? "-" : target ? skill.targetLvl : skill.currentLvl

	const getLifeSkill2Preview = (target?: boolean) => {
		const lvl = getSkillLvlPreview(abilitySet.lifeSkill2!, target)
		return typeof lvl === "number"
			? Math.min(lvl, Number(char.abilities.lifeSkill2?.maxLvl))
			: lvl
	}

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
					className={`${plannerBoxStyles.plannerBox} ${getItemRarityStyle(char)} ${CharacterState.isDisabled ? `${plannerBoxStyles.plannerBoxDisabled} ${topStyles.noInteract}` : ""} ${dropPreviewOrDragOverlay().join(" ")}`}>
					<div
						className={`metallic-panel ${plannerBoxStyles.infoContainer} ${topStyles.infoContainer}`}>
						<div className={topStyles.arcInfoTop}>
							<Link
								href={`/characters/${char.id}`}
								className={`${topStyles.arcImageContainer} ${styles.avatarTile}`}
								style={
									themeColor
										? ({
												"--rarity-color": themeColor,
												"--rarity-color-highlight": `color-mix(in srgb, ${themeColor}, white 45%)`,
											} as CSSProperties)
										: undefined
								}
								aria-label={`View ${char.name}'s profile`}
								onPointerEnter={showProfileTooltip}
								onPointerLeave={hideProfileTooltip}>
								<CharacterAvatar
									character={char}
									width={256}
									height={256}
									loading="eager"
								/>
							</Link>
							<div className={topStyles.arcStatsSection}>
								<Link
									href={`/characters/${char.id}`}
									className={topStyles.arcStatsName}
									onPointerEnter={showProfileTooltip}
									onPointerLeave={hideProfileTooltip}>
									{char.name}
								</Link>
								<ProfileTooltip offset={{ x: 6, y: 0 }}>View Profile</ProfileTooltip>
								<span
									className={`${topStyles.arcStatsLvlContainer} ${topStyles.currentLvl}`}>
									<div className={topStyles.arcPhases}>
										<ItemPhases lvl={CharacterState.currentLvl} />
									</div>
									<span className={topStyles.arcLevelSectionLabel}>
										Current Level
									</span>
									<select
										className="inset-control"
										value={CharacterState.currentLvl}
										onChange={handleCurrentLvlChange}
										tabIndex={0}>
										{LvlOptions.map((opt) => (
											<option
												key={opt.value}
												value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</span>

								<span
									className={`${topStyles.arcStatsLvlContainer}`}>
									<div className={topStyles.arcPhases}>
										<ItemPhases lvl={CharacterState.targetLvl} />
									</div>
									<span className={topStyles.arcLevelSectionLabel}>
										Target Level
									</span>
									<select
										className="inset-control"
										value={CharacterState.targetLvl}
										onChange={handleTargetLvlChange}
										tabIndex={0}>
										{LvlOptions.map((opt) => (
											<option
												key={opt.value}
												value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</span>
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
											{`${getSkillLvlPreview(abilitySet.passive1)} / ${getSkillLvlPreview(abilitySet.passive2)}${abilitySet.passive3 ? ` / ${getSkillLvlPreview(abilitySet.passive3)}` : ""}`}
										</div>
										<div
											className={
												styles.charStatPreviewArrow
											}
										/>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.passive1, true)} / ${getSkillLvlPreview(abilitySet.passive2, true)}${abilitySet.passive3 ? ` / ${getSkillLvlPreview(abilitySet.passive3, true)}` : ""}`}
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
									<CharacterSkillGroup
										skill="passive2"
										label="Passive 2"
									/>
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
											{`${getSkillLvlPreview(abilitySet.lifeSkill1)}${abilitySet.lifeSkill2 ? ` / ${getLifeSkill2Preview()}` : ""}`}
										</div>
										<div
											className={
												styles.charStatPreviewArrow
											}
										/>
										<div
											className={styles.charStatPreviewLvl}>
											{`${getSkillLvlPreview(abilitySet.lifeSkill1, true)}${abilitySet.lifeSkill2 ? ` / ${getLifeSkill2Preview(true)}` : ""}`}
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
					<ModalContainer onClickOut={cancelDelete}>
						<AlertContainer
							type="confirm"
							onConfirm={confirmDelete}
							cancelLabel="CANCEL"
							onCancel={cancelDelete}>
							{"A-are you sure you want to delete this Character?"}
						</AlertContainer>
					</ModalContainer>,
					document.body
				)}
			<FinalAdjustmentModal materials={adjustmentMaterials} />
		</div>
	)
}
