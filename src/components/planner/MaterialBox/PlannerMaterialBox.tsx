"use client"

import { MouseEvent, useMemo } from "react"

import type { Material } from "@/types/item"

import { EnumMaterialType, findMaterial, getItemRarityStyle } from "@/data/items"

import { useTooltip, useMaterialEditorModal, useInventoryStore } from "@/hooks"

import { getCraftRatio, getLinkedMaterials } from "@/helpers"
import { formatLocale } from "@/helpers/locale"

import {
	useLocale,
	usePlannerBoxContext,
	usePlannerMaterialsContext,
	useT,
} from "@/contexts"

import { MaterialIcon } from "@/components/layout"

import styles from "./plannerMaterial.module.css"

export function PlannerMaterialBox({
	material,
	requiredAmount,
}: {
	material: Material
	requiredAmount: number
}) {
	const t = useT()
	const numberLocale = formatLocale(useLocale(), "en-US")
	const {
		Tooltip,
		showTooltip,
		hideTooltip,
		longPressHandlers,
		consumeLongPress,
	} = useTooltip()

	const linkedMaterials = useMemo(
		() => getLinkedMaterials(material),
		[material]
	)
	const { ModalComponent: MaterialEditor, showModal } = useMaterialEditorModal(
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

		return `${isExpMaterial ? "~" : ""}${displayAmount.toLocaleString(numberLocale)}`
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

			<MaterialEditor materials={linkedMaterials} />

			<Tooltip offset={{ x: 36, y: 0 }} subText={t("planner.material.clickToEdit")}>
				<div>{material.name}</div>
				<div className="tooltip-details">
					{t.rich("planner.material.totalNeeded", {
						n: (text) => <span className="font-barlow">{text}</span>,
						amount: `${isExpMaterial ? "~" : ""}${requiredAmount.toLocaleString(numberLocale)}`,
					})}
					<br />
					{t.rich("planner.material.ownedAvailable", {
						n: (text) => <span className="font-barlow">{text}</span>,
						owned: ownedAmount.toLocaleString(numberLocale),
						available: (availableAmount + craftedAmount).toLocaleString(numberLocale),
					})}
					{usingCrafted && (
						<em>
							{" "}
							{t.rich(
								isExpMaterial
									? "planner.material.fromSubstitutes"
									: "planner.material.fromCrafting",
								{
									n: (text) => <span className="font-barlow">{text}</span>,
									amount: craftedAmount,
								}
							)}
						</em>
					)}
					{craftedFrom.length > 0 && (
						<div className="tooltip-using-header">
							<div>{t("planner.material.using")}</div>
							<div className="tooltip-using-list">
								{craftedFrom.map(({ id, amount }) => {
									const craftingMaterial = findMaterial(id)
									const divisor = getCraftRatio(
										material,
										craftingMaterial
									)
									return (
										<div key={id}>
											{`${craftingMaterial.name}: `}
											<span className="font-barlow">
												{`${amount.toLocaleString(numberLocale)} \u2192 + ${amount / divisor}`}
											</span>
										</div>
									)
								})}
							</div>
						</div>
					)}
				</div>
				<hr className="tooltip-hr" />
				<div className="tooltip-source-list">
					{t("planner.material.sources")}
					{material.sources.map((source) => (
						<div className="tooltip-source" key={source}>
							{source}
						</div>
					))}
				</div>
				<hr className="tooltip-hr" />
			</Tooltip>
		</div>
	)
}
