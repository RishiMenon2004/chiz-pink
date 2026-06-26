"use client"

import Image from "next/image"
import { Material } from "@/database/materials"
import styles from "./plannerMaterial.module.css"
import { useTooltip } from "@/hooks"
import { getRarityStyle } from "@/components/inventory/InventoryMaterialBox"

export default function PlannerMaterialBox({
	material,
}: {
	material: Material
}) {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	return (
		<div
			className={`${styles.materialBox} ${getRarityStyle(material, styles)}`}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
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
			<Tooltip offset={{ x: 48, y: 32 }}>{material.name}</Tooltip>
		</div>
	)
}
