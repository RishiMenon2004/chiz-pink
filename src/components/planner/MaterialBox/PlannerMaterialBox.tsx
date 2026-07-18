"use client"

import { MouseEvent, useMemo } from "react"

import type { Material } from "@/types/item"

import { getItemRarityStyle } from "@/data/items"

import { useTooltip, useMaterialEditorModal, useInventoryStore } from "@/hooks"

import { getLinkedMaterials } from "@/helpers"

import { usePlannerMaterialsContext } from "@/contexts"

import { MaterialIcon } from "@/components/layout"

import styles from "./plannerMaterial.module.css"

export function PlannerMaterialBox({
	material,
	requiredAmount,
	entryIndex,
}: {
	material: Material
	requiredAmount: number
	entryIndex: number
}) {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const linkedMaterials = useMemo(
		() => getLinkedMaterials(material),
		[material]
	)
	const { ModalComponent: MaterialEditor, showModal } = useMaterialEditorModal(
		linkedMaterials,
		styles.modalMaterialBoxContainer
	)

	const handleClick = (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		hideTooltip()
		showModal()
	}

	const isAggregateMaterial = entryIndex === -1

	const cumulativeInventory = usePlannerMaterialsContext()
	const { inventory } = useInventoryStore()
	const usableInventory =
		cumulativeInventory[isAggregateMaterial ? 0 : entryIndex] ?? {}

	const availableAmount = usableInventory[material.id]?.amount ?? 0
	const ownedAmount = inventory[material.id] || 0
	let craftedAmount = usableInventory[material.id]?.craftedAmount ?? 0

	let usingCrafted = craftedAmount > 0

	let remainingAmount = Math.max(
		0,
		requiredAmount - (availableAmount + craftedAmount)
	)

	if (isAggregateMaterial) {
		usingCrafted = false
		craftedAmount = 0
		remainingAmount = Math.max(0, requiredAmount - availableAmount)
	}

	const displayAmount = remainingAmount > 0 ? remainingAmount : requiredAmount

	const formatDisplayAmount = (displayAmount: number) => {
		if (displayAmount >= 1000000) {
			return `~${(displayAmount / 1000000).toFixed(2)}m`
		}

		return displayAmount.toLocaleString("en-us")
	}

	return (
		<div
			className={`${styles.materialBox} ${getItemRarityStyle(material)} ${remainingAmount === 0 && styles.acquired} ${usingCrafted && styles.crafted}`}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
			onClick={handleClick}>
			<div className={styles.iconContainer}>
				{usingCrafted && (
					<div className={styles.craftedTag}>{craftedAmount}</div>
				)}
				<MaterialIcon
					material={material}
					width={64}
					height={64}
					quality={100}
				/>
			</div>
			<span className={styles.amount}>
				{formatDisplayAmount(displayAmount)}
			</span>

			<MaterialEditor />

			<Tooltip offset={{ x: 36, y: 0 }} subText="Click to Edit">
				<div>{material.name}</div>
				<div
					style={{
						fontSize: "0.8rem",
						opacity: 0.75,
						fontWeight: 600,
						marginBlock: "0.25rem",
						marginLeft: "0.5rem",
					}}>
					{"Total Needed: "}
					<span
						style={{
							fontFamily: "var(--font-barlow-condensed)",
						}}>
						{requiredAmount.toLocaleString("en-us")}
					</span>
					<br />
					{"Owned: "}
					<span style={{ fontFamily: "var(--font-barlow-condensed)" }}>
						{ownedAmount.toLocaleString("en-us")}
					</span>
					{" | Available: "}
					<span style={{ fontFamily: "var(--font-barlow-condensed)" }}>
						{(availableAmount + craftedAmount).toLocaleString(
							"en-us"
						)}
					</span>
					{usingCrafted && (
						<span style={{ fontStyle: "italic" }}>
							{" ("}
							<span
								style={{
									fontFamily: "var(--font-barlow-condensed)",
								}}>
								+{craftedAmount}
							</span>
							{" from crafting)"}
						</span>
					)}
				</div>
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
		</div>
	)
}
