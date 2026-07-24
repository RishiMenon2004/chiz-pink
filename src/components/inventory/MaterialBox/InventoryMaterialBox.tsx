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
import { Character } from "@/types/character"
import { Arc } from "@/types/weapon"

import { getItemRarityStyle } from "@/data/items"
import { findCharacter } from "@/data/characters/characterList"
import { findArc } from "@/data/arcs"

import {
	useInventoryStore,
	usePlannerStore,
	useMaterialEditorModal,
	useTooltip,
} from "@/hooks"
import { getAggregatedMaterial } from "@/hooks/usePlannerStore"

import { getLinkedMaterials } from "@/helpers"

import { MaterialIcon, QuantityInput } from "@/components/layout"

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
		getAggregatedMaterial(plannerData, material) || {
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
				<MaterialIcon
					material={material}
					width={128}
					height={128}
					quality={100}
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
							<span>
								{"Need: "}
								<span
									style={{
										fontFamily:
											"var(--font-barlow-condensed)",
										fontSize: "1rem",
										letterSpacing: "7%",
									}}>
									{requiredQuantity}
								</span>
							</span>
							{itemQuantity < requiredQuantity && (
								<span
									style={{
										fontFamily:
											"var(--font-barlow-condensed)",
										fontSize: "1rem",
										color: "#ff486d",
										fontStyle: "italic",
										letterSpacing: "7%",
										paintOrder: "stroke fill",
										WebkitTextStroke: "2px black",
									}}>
									{" ▼ "}
									{requiredQuantity - itemQuantity}
								</span>
							)}
						</div>
						<div className={styles.tooltipSourceList}>
							Needed For:
							{Object.entries(requiredSources).map(
								([id, amount]) => {
									const item: Arc | Character | undefined =
										findArc(id) ??
										findCharacter(id) ??
										undefined
									return (
										<div
											className={styles.tooltipSource}
											key={id}>
											<Image
												src={
													"effect" in item
														? "/icons/arc.png"
														: "/icons/character.png"
												}
												width={16}
												height={16}
												alt={`${material.name} Source`}
											/>
											{`${item.name} ${amount > 1 ? `×${amount}` : ""}`}
										</div>
									)
								}
							)}
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

			<QuantityInput
				name={material.name}
				styles={styles}
				inputRef={countRef}
				value={itemQuantity}
				onChange={handleEdit}
				onFocus={handleFocus}
				onKeyDown={handleKeyDown}
				onInputClick={(e) => {
					e.stopPropagation()
					hideTooltip()
				}}
				onIncrement={(e) => handleCount(e, true)}
				onDecrement={(e) => handleCount(e, false)}
			/>
		</div>
	)
}
