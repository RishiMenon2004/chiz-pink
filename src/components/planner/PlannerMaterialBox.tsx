"use client"

import Image from "next/image"
import { Material } from "@/database/materials"
import styles from "./plannerMaterial.module.css"
import { useTooltip } from "@/hooks"
import MaterialItemBox from "@/components/inventory/InventoryMaterialBox"
import ModalContainer from "../layout/ModalContainer"
import { createPortal } from "react-dom"
import { KeyboardEvent, MouseEvent, useState } from "react"
import { allInventoryMaterials } from "@/database/materialLists"
import { getItemRarityStyle } from "@/database/item"

export default function PlannerMaterialBox({
	material,
}: {
	material: Material
}) {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	const [showMaterialEditorModal, setShowMaterialEditorModal] =
		useState<boolean>(false)
	const [linkedMaterials] = useState<Material[]>(() => {
		const rarityOrder: Material[] = []
		if (material.linkedMaterials) {
			rarityOrder.push(material)
			material.linkedMaterials.forEach((materialId) => {
				rarityOrder.push(allInventoryMaterials[materialId])
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

	const handleCloseModal = (
		e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
	) => {
		e.stopPropagation()
		setShowMaterialEditorModal(false)
	}

	return (
		<div
			className={`${styles.materialBox} ${getItemRarityStyle(material, styles)}`}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
			onClick={handleClick}>
			<div className={styles.iconContainer}>
				<Image
					src={`/materials${material.imageSrc}.png`}
					width={64}
					height={64}
					quality={100}
					alt={`Material ${material.name} Icon`}
				/>
			</div>
			<span className={styles.amount}>28</span>

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

			<Tooltip offset={{ x: 48, y: 32 }} subText="Click to Edit">
				<div>{material.name}</div>
				<hr style={{ marginBlock: "0.5rem" }} />
				<div
					style={{
						fontSize: "0.9rem",
						opacity: 0.75,
						display: "flex",
						flexDirection: "column",
						gap: "0.125rem",
					}}>
					Sources:
					{material.sources.map((source) => (
						<div
							key={source}
							style={{
								fontFamily: "--font-barlow-condensed",
								fontWeight: "500",
								fontStyle: "italic",
								marginInlineStart: "0.5rem",
							}}>
							{source}
						</div>
					))}
				</div>
			</Tooltip>
		</div>
	)
}
