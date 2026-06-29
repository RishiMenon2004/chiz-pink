"use client"

import Image from "next/image"
import {
	ChangeEvent,
	CSSProperties,
	MouseEvent,
	ReactNode,
	Ref,
	useState,
} from "react"
import {
	EnumItemLvls,
	getItemRarityStyle,
	findMaterial,
} from "@/database/items"
import PlannerMaterialBox from "@/components/planner/PlannerMaterialBox"
import styles from "@/components/planner/plannerArcBox.module.css"
import { useTooltip } from "@/hooks"
import { useSortable } from "@dnd-kit/react/sortable"
import usePlanner, { WeaponRecord } from "@/hooks/usePlannerStore"
import { findArc } from "@/database/arcs"
import { useDragOperation } from "@dnd-kit/react"

function ItemPhaseStars({ starsActive }: { starsActive: number }) {
	return Array.from({ length: 6 }).map((_, index) => {
		const isActive = index + 1 <= starsActive
		return (
			<div
				className={`${styles.arcPhaseStar} ${isActive ? styles.phaseActive : ""}`}
				key={index}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 61 61"
					fill="none"
					xmlns="http://www.w3.org/2000/svg">
					<path
						className={styles.arcPhaseStarFill}
						d="M27.2858 4.86606C28.3016 2.37802 31.8248 2.37801 32.8407 4.86606L38.864 19.6191C39.1687 20.3654 39.7611 20.9578 40.5075 21.2625L55.2605 27.2859C57.7485 28.3017 57.7485 31.8249 55.2605 32.8407L40.5075 38.8641C39.7611 39.1688 39.1687 39.7611 38.864 40.5075L32.8407 55.2605C31.8248 57.7486 28.3016 57.7486 27.2858 55.2605L21.2625 40.5075C20.9577 39.7611 20.3654 39.1688 19.619 38.8641L4.866 32.8407C2.37796 31.8249 2.37795 28.3017 4.866 27.2859L19.619 21.2625C20.3654 20.9578 20.9577 20.3654 21.2625 19.6191L27.2858 4.86606Z"
					/>
					<path
						className={styles.arcPhaseStarStroke}
						d="M25.8972 4.29865C27.4211 0.567138 32.7054 0.567127 34.2292 4.29865L40.2527 19.0526C40.405 19.4254 40.7011 19.7215 41.074 19.8738L55.8279 25.8973C59.5594 27.4212 59.5594 32.7054 55.8279 34.2293L41.074 40.2527C40.7011 40.4051 40.405 40.7012 40.2527 41.074L34.2292 55.8279C32.7054 59.5594 27.4211 59.5595 25.8972 55.8279L19.8738 41.074C19.7214 40.7012 19.4254 40.4051 19.0525 40.2527L4.29858 34.2293C0.567077 32.7054 0.567066 27.4212 4.29858 25.8973L19.0525 19.8738C19.4254 19.7215 19.7214 19.4254 19.8738 19.0526L25.8972 4.29865Z"
					/>
				</svg>
			</div>
		)
	})
}

const DragPoint = ({ ref }: { ref?: Ref<HTMLDivElement> }) => {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	return (
		<div
			ref={ref}
			className={styles.arcBoxDragPoint}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
			<Tooltip offset={{ x: 48, y: 32 }} subText="Drag to reorder">
				Adjust Priority
			</Tooltip>
		</div>
	)
}

const ArcBtn = ({
	onClick,
	icon,
	ariaLabel,
	children,
}: {
	onClick: (e: MouseEvent<HTMLElement>) => void
	icon: string
	ariaLabel: string
	children: ReactNode
}) => {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	return (
		<button
			tabIndex={1}
			aria-label={ariaLabel}
			className={styles.arcPlannerButton}
			style={
				{
					"--icon-src": `url('/button_icons/${icon}.png')`,
				} as CSSProperties
			}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
			onClick={onClick}>
			<Tooltip offset={{ x: 48, y: 32 }}>{children}</Tooltip>
		</button>
	)
}

export default function PlannerArcBox({
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

	const { source } = useDragOperation()

	const { weapons } = usePlanner()

	const [currentLvl, setCurrentLvl] = useState<EnumItemLvls>(
		arcRecord.currentLvl
	)
	const [targetLvl, setTargetLvl] = useState<EnumItemLvls>(
		arcRecord.targetLvl
	)

	function handleCurrentChange(e: ChangeEvent<HTMLSelectElement>) {
		setCurrentLvl(Number(e.currentTarget.value))
		weapons.updateWeapon({
			...arcRecord,
			currentLvl: Number(e.currentTarget.value),
			targetLvl,
		} as WeaponRecord)
	}
	function handleTargetChange(e: ChangeEvent<HTMLSelectElement>) {
		setTargetLvl(Number(e.currentTarget.value))
		weapons.updateWeapon({
			...arcRecord,
			targetLvl: Number(e.currentTarget.value),
			currentLvl,
		} as WeaponRecord)
	}

	const LvlOptions = Object.keys(EnumItemLvls)
		.filter((key) => isNaN(Number(key)))
		.map((key) => ({
			label: key.replace("Lvl", "").replace("A", "+"),
			value: EnumItemLvls[key as keyof typeof EnumItemLvls],
		}))

	const getPhases = (lvl: number) => {
		if (lvl > 70) return 6
		if (lvl > 60) return 5
		if (lvl > 50) return 4
		if (lvl > 40) return 3
		if (lvl > 30) return 2
		if (lvl > 20) return 1
		return 0
	}

	const arc = findArc(arcRecord.id)

	const dropPreviewOrDragOverlay = () => {
		const classStyles = []

		if (source) {
			classStyles.push(styles.arcBoxCollapsed)
		}

		if (isDragging) {
			if (index === -200) {
				classStyles.push(styles.arcBoxDragging)
			} else {
				classStyles.push(styles.arcBoxDropPreview)
			}
		}

		return classStyles
	}

	return (
		<div className={styles.arcPlannerBoxContainer} ref={ref}>
			<div
				className={`${styles.arcPlannerBox} ${getItemRarityStyle(arc)} ${dropPreviewOrDragOverlay().join(" ")}`}>
				<div className={styles.arcInfoContainer}>
					<div className={styles.arcInfoTop}>
						<div className={styles.arcImageContainer}>
							<Image
								src={`/arcs/${arc.imageSrc}`}
								width={128}
								height={128}
								alt={`Arc "${arc.name}" Icon`}
								loading="eager"
							/>
							<div className={styles.arcTypeContainer}>
								{arc.type}
							</div>
						</div>
						<div className={styles.arcStatsSection}>
							<div className={styles.arcStatsName}>
								{arc.name}
							</div>

							<span className={styles.arcStatsLvlContainer}>
								<div className={styles.arcPhases}>
									<ItemPhaseStars
										starsActive={getPhases(currentLvl)}
									/>
								</div>
								<div className={styles.arcStatsLvl}>
									<span>Current Lvl.</span>
									<select
										value={currentLvl}
										onChange={handleCurrentChange}
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
							</span>

							<span className={styles.arcStatsLvlContainer}>
								<div className={styles.arcPhases}>
									<ItemPhaseStars
										starsActive={getPhases(targetLvl)}
									/>
								</div>
								<div className={styles.arcStatsLvl}>
									<span>Target Lvl.</span>
									<select
										value={targetLvl}
										onChange={handleTargetChange}
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
							</span>
						</div>
					</div>
					<span
						className={styles.arcRequiredMaterialsLabel}
						style={{
							marginLeft: "2rem",
							marginBlock: "1rem 0.5rem",
							fontWeight: "600",
						}}>
						Required Materials
					</span>
					<div className={styles.arcRequiredMaterialsList}>
						{arcRecord.requiredMaterials.map((material) => {
							if (material.amount > 0) {
								return (
									<PlannerMaterialBox
										key={material.id}
										material={findMaterial(material.id)}
										requiredAmount={material.amount}
									/>
								)
							}
						})}
					</div>
				</div>
				<div className={styles.arcButtonsContainer}>
					<ArcBtn
						icon="confirm_plan"
						ariaLabel="Confirm Levelling Button"
						onClick={(e: MouseEvent) => {
							e.stopPropagation()
							console.log("ARC ASCENDED")
						}}>
						Confirm & Develop
					</ArcBtn>
					<DragPoint ref={handleRef} />
					<ArcBtn
						icon="delete"
						ariaLabel="Delete Arc Plan Button"
						onClick={(e: MouseEvent) => {
							e.stopPropagation()
							weapons.deleteWeapon(arcRecord)
						}}>
						Delete
					</ArcBtn>
				</div>
			</div>
		</div>
	)
}
