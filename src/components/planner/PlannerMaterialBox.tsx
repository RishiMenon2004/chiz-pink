"use client"

import Image from "next/image"
import { Material } from "@/database/materials"
import styles from "./plannerMaterial.module.css"
import { useTooltip } from "@/hooks"

export default function PlannerMaterialBox({
	material,
}: {
	material: Material
}) {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	return (
		<div
			className={styles.materialBox}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
		>
			<Image
				src={`/materials${material.imageSrc}.png`}
				width={48}
				height={48}
				alt={`Material ${material.name} Icon`}
			/>
			<Tooltip offset={{ x: 48, y: 32 }}>{material.name}</Tooltip>
		</div>
	)
}
