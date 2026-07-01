"use client"

import Image from "next/image"
import { MouseEvent, useContext } from "react"

import { useTooltip } from "@/hooks"

import { Material, getItemRarityStyle } from "@/database/items"

import { ArcPlannerUsableMaterialsContext } from "@/app/arcs/ArcDeductedInventoryProvider"

import styles from "./plannerMaterial.module.css"

export default function PlannerMaterialBox({
	material,
	requiredAmount,
	entryIndex,
}: {
	material: Material
	requiredAmount: number
	entryIndex: number
}) {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	const [showMaterialEditorModal, setShowMaterialEditorModal] =
		useState<boolean>(false)
	const [linkedMaterials] = useState<Material[]>(() => {
		const rarityOrder: Material[] = []
		if (material.linkedMaterials) {
			rarityOrder.push(material)
			material.linkedMaterials.forEach((materialId) => {
				rarityOrder.push(findMaterial(materialId))
			})

			rarityOrder.sort((a, b) => b.rarity - a.rarity)
		} else {
			rarityOrder.push(material)
		}

		return rarityOrder
	})

	const handleClick = (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		hideTooltip()
		setShowMaterialEditorModal(true)
	}

	const handleCloseModal = (e: ModalEventType) => {
		e.stopPropagation()
		setShowMaterialEditorModal(false)
	}

	const { cumulativeInventory } = useContext(ArcPlannerUsableMaterialsContext)
	const usableInventory = cumulativeInventory[entryIndex] || {}
	const availableAmount = usableInventory[material.id]?.amount || 0
	const craftedAmount = usableInventory[material.id]?.craftedAmount || 0
	const usingCrafted = craftedAmount > 0

	const remainingAmount = Math.max(
		0,
		requiredAmount - (availableAmount + craftedAmount)
	)
	const displayAmount = remainingAmount > 0 ? remainingAmount : requiredAmount

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
				<Image
					src={`/materials${material.imageSrc}.png`}
					width={64}
					height={64}
					quality={100}
					alt={`Material ${material.name} Icon`}
				/>
			</div>
			<span className={styles.amount}>
				{displayAmount.toLocaleString("en-us")}
			</span>

			{showMaterialEditorModal &&
				createPortal(
					<ModalContainer onClose={handleCloseModal}>
						<div className={styles.modalMaterialBoxContainer}>
							{linkedMaterials.map((linkedMaterial, index) => {
								return (
									<MaterialItemBox
										key={index}
										material={linkedMaterial}
										canHaveMultiMat={false}
										hadAddSub
									/>
								)
							})}
						</div>
					</ModalContainer>,
					document.body
				)}

			<Tooltip offset={{ x: 24, y: 0 }} subText="Click to Edit">
				<div>{material.name}</div>
				<div
					style={{
						fontSize: "0.8rem",
						opacity: 0.75,
						fontWeight: 600,
						marginBlock: "0.25rem",
						marginLeft: "0.5rem",
					}}>
					{"Owned: "}
					<span style={{ fontFamily: "var(--font-barlow-condensed)" }}>
						{availableAmount}
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
							{" crafted)"}
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
