"use client"

import { MouseEvent, useMemo } from "react"

import type { Material } from "@/types/item"

import { EnumMaterialType, findMaterial, getItemRarityStyle } from "@/data/items"

import { useTooltip, useMaterialEditorModal, useInventoryStore } from "@/hooks"

import { getLinkedMaterials } from "@/helpers"

import { usePlannerBoxContext, usePlannerMaterialsContext } from "@/contexts"

import { MaterialIcon } from "@/components/layout"

import styles from "./plannerMaterial.module.css"

export function PlannerMaterialBox({
	material,
	requiredAmount,
}: {
	material: Material
	requiredAmount: number
}) {
	const { Tooltip, showTooltip, hideTooltip, longPressHandlers, consumeLongPress } =
		useTooltip()

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
		if (consumeLongPress()) return
		hideTooltip()
		showModal()
	}

	const { itemRecord, entryIndex } = usePlannerBoxContext() || {
		itemRecord: {},
		entryIndex: -1,
	}

	const { inventory } = useInventoryStore()
	const ownedAmount = inventory[material.id] || 0

	const cumulativeInventory = usePlannerMaterialsContext()
	const lookupIndex =
		entryIndex === -1 ? cumulativeInventory.length - 1 : entryIndex
	const usableInventory = cumulativeInventory[lookupIndex] ?? {}
	const usableMaterial = usableInventory[material.id] ?? {}

	const availableAmount = usableMaterial.amount ?? 0
	const craftedAmount = usableMaterial.craftedAmount ?? 0
	const craftedFrom = usableMaterial.craftedFrom ?? []

	const usingCrafted = craftedAmount! > 0
	const usableAmount = availableAmount + craftedAmount!

	const remainingAmount = Math.max(requiredAmount - usableAmount, 0)

	const displayAmount = remainingAmount > 0 ? remainingAmount : requiredAmount

	const isExpMaterial =
		material.materialType === EnumMaterialType.CharacterExp ||
		material.materialType === EnumMaterialType.WeaponExp

	const formatDisplayAmount = (displayAmount: number) => {
		if (displayAmount >= 1000000) {
			return `~${(displayAmount / 1000000).toFixed(2)}m`
		}

		return `${isExpMaterial ? "~" : ""}${displayAmount.toLocaleString("en-us")}`
	}

	const disabled = () => {}

	return (
		<div
			className={`${styles.materialBox} ${getItemRarityStyle(material)} ${remainingAmount === 0 && styles.acquired} ${usingCrafted && styles.crafted} ${itemRecord.isDisabled && styles.noInteract}`}
			onPointerEnter={itemRecord.isDisabled ? disabled : showTooltip}
			onPointerLeave={itemRecord.isDisabled ? disabled : hideTooltip}
			onClick={itemRecord.isDisabled ? disabled : handleClick}
			{...(itemRecord.isDisabled ? {} : longPressHandlers)}>
			<div className={styles.iconContainer}>
				{usingCrafted && (
					<div className={styles.craftedTag}>{craftedAmount}</div>
				)}
				<MaterialIcon
					material={material}
					width={128}
					height={128}
					quality={100}
					loading="eager"
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
						{`${isExpMaterial ? "~" : ""}${requiredAmount.toLocaleString("en-us")}`}
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
							{material.materialType ===
								EnumMaterialType.WeaponExp ||
							material.materialType ===
								EnumMaterialType.CharacterExp
								? " from lower EXP substitutes)"
								: " from crafting)"}
						</span>
					)}
					{craftedFrom.length > 0 && (
						<div style={{ marginTop: "0.25rem" }}>
							<div>{"Using:"}</div>
							<div
								style={{
									fontStyle: "italic",
									paddingLeft: "2ch",
								}}>
								{craftedFrom.map(({ id, amount }) => {
									const craftingMaterial = findMaterial(id)
									const divisor = isExpMaterial ? (15 * material.rarity - 16 * craftingMaterial.rarity - 8) : 3 ** (material.rarity - craftingMaterial.rarity)
									return (
										<div key={id}>
											{`${craftingMaterial.name}: `}
											<span
												style={{
													fontFamily:
														"var(--font-barlow-condensed)",
												}}>
												{`${amount.toLocaleString("en-us")} → + ${amount / divisor}`}
											</span>
										</div>
									)
								})}
							</div>
						</div>
					)}
				</div>
				<hr style={{ marginBlock: "0.5rem" }} />
				<div className="tooltip-source-list">
					Sources:
					{material.sources.map((source) => (
						<div className="tooltip-source" key={source}>
							{source}
						</div>
					))}
				</div>
				<hr style={{ marginBlock: "0.5rem" }} />
			</Tooltip>
		</div>
	)
}
