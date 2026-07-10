"use client"

import Image from "next/image"
import {
	ChangeEvent,
	FocusEvent,
	MouseEvent,
	useRef,
	KeyboardEvent,
	useMemo,
} from "react"

import type { Material } from "@/types/item"

import { getItemRarityStyle } from "@/data/items"
import { findArc } from "@/data/arcs"

import {
	useInventoryStore,
	usePlannerStore,
	useMaterialEditorModal,
	useTooltip,
} from "@/hooks"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { getLinkedMaterials } from "@/helpers"

import styles from "./inventoryMaterial.module.css"
import pageStyles from "@/app/inventory/page.module.css"

export function MaterialItemBox({
	material,
	canHaveMultiMat = true,
}: {
	material: Material
	canHaveMultiMat?: boolean
}) {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const linkedMaterials = useMemo(
		() => getLinkedMaterials(material),
		[material]
	)
	const { ModalComponent: MaterialEditor, showModal } = useMaterialEditorModal(
		linkedMaterials,
		pageStyles.multiMatContainer
	)

	const countRef = useRef<HTMLInputElement>(null)
	const { inventory, updateInventory } = useInventoryStore()
	const itemQuantity = inventory[material.id] || 0

	const { plannerData } = usePlannerStore()
	const { amount: requiredQuantity, sources: requiredSources } =
		getAggregatedMaterials(plannerData)[material.id] || {
			amount: 0,
			sources: [],
		}

	const hasRequired = requiredQuantity > 0
	const hasAcquired = itemQuantity >= requiredQuantity

	const isMultiMat = material.linkedMaterials && canHaveMultiMat

	const setAmount = (value: number) => {
		updateInventory({ [material.id]: value })
	}

	const handleCount = (e: MouseEvent<HTMLSpanElement>, increment: boolean) => {
		e.stopPropagation()
		hideTooltip()
		if (countRef.current) {
			const prevAmount = itemQuantity
			const newAmount = Math.max(
				increment ? prevAmount + 1 : prevAmount - 1,
				0
			)
			setAmount(newAmount)
		}
	}

	const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			const newValue = parseInt(e.currentTarget.value.replaceAll(/\D/g, ""))
			setAmount(newValue)
		}
	}

	const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			e.currentTarget.focus()
			e.currentTarget.setSelectionRange(0, 999)
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		e.stopPropagation()
		if (e.key === "Enter" || e.key === "Escape") {
			e.currentTarget.blur()
		}
	}

	const handleBoxClick = (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		if (isMultiMat) {
			showModal()
			hideTooltip()
		}
	}

	const ownedOrNeededStyle = hasRequired
		? hasAcquired
			? styles.acquired
			: styles.needed
		: ""

	return (
		<div
			className={`${styles.materialBox} ${getItemRarityStyle(material, styles)} ${isMultiMat ? styles.multi : ""} ${ownedOrNeededStyle}`}
			onClick={(e) => {
				e.stopPropagation()
				hideTooltip()
			}}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
			<div className={`${styles.iconContainer}`} onClick={handleBoxClick}>
				{hasRequired && (
					<div className={styles.requirementIndicator}>
						{hasAcquired
							? requiredQuantity
							: requiredQuantity - itemQuantity}
					</div>
				)}
				<Image
					src={`/materials${material.imageSrc}.png`}
					width={128}
					height={128}
					alt={`${material.name} icon`}
					loading="eager"
				/>
			</div>

			<span className={styles.label}>{material.name}</span>

			<MaterialEditor />

			<Tooltip
				subText={material.materialType}
				offset={isMultiMat ? { x: 36, y: -9 } : { x: 32, y: 0 }}>
				<div>{material.name}</div>

				{hasRequired && (
					<>
						<div
							style={{
								fontSize: "0.8rem",
								opacity: 0.75,
								fontWeight: 600,
								marginBlock: "0.25rem",
								marginLeft: "0.5rem",
							}}>
							{itemQuantity < requiredQuantity && (
								<span>
									<span
										style={{
											fontFamily:
												"var(--font-barlow-condensed)",
											fontSize: "1rem",
											color: "#ff486d",
										}}>
										{"▼ "}
										{requiredQuantity - itemQuantity}
									</span>
									{" | "}
								</span>
							)}
							{"Need: "}
							<span
								style={{
									fontFamily: "var(--font-barlow-condensed)",
									fontSize: "1rem",
								}}>
								{requiredQuantity}
							</span>
						</div>
						<div className={styles.tooltipSourceList}>
							Needed For:
							{requiredSources.map((source) => (
								<div
									className={styles.tooltipSource}
									key={source}>
									<Image
										src={
											findArc(
												source
													.toLowerCase()
													.split("x")[0]
													.trimEnd()
													.replaceAll(" ", "_")
													.replace("'", "")
											)
												? "/icons/arc.png"
												: "/icons/character.png"
										}
										width={16}
										height={16}
										alt={`${material.name} Source: Arc ${source}`}
									/>
									{source}
								</div>
							))}
						</div>
					</>
				)}
				<hr style={{ marginBlock: "0.5rem" }} />
				<div className={styles.tooltipSourceList}>
					Sources:
					{material.sources.map((source) => (
						<div className={styles.tooltipSource} key={source}>
							{source}
						</div>
					))}
				</div>
				<hr style={{ marginBlock: "0.5rem" }} />
			</Tooltip>

			<span className={`${styles.amount}`}>
				<span
					tabIndex={-1}
					aria-label={`${material.name} minus one button`}
					className={`${styles.countBtn} ${styles.minus}`}
					onClick={(e) => handleCount(e, false)}
				/>
				<span className={`${styles.countContainer}`}>
					<input
						ref={countRef}
						type={"text"}
						min="0"
						pattern="[0-9]*"
						inputMode="numeric"
						name={`${material.name} quantity input box`}
						value={itemQuantity}
						onChange={handleEdit}
						onFocus={handleFocus}
						onKeyDown={handleKeyDown}
						onClick={(e) => {
							e.stopPropagation()
							hideTooltip()
						}}
					/>
				</span>
				<span
					tabIndex={-1}
					aria-label={`${material.name} plus one button`}
					className={`${styles.countBtn} ${styles.plus}`}
					onClick={(e) => handleCount(e, true)}
				/>
			</span>
		</div>
	)
}
