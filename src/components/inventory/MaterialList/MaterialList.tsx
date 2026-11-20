"use client"

import type { Material } from "@/types/item"
import type { AggregateMaterialsType } from "@/types/planner"

import { MaterialItemBox } from "../MaterialBox"

import styles from "@/app/[lang]/inventory/page.module.css"

export function MaterialList({
	materials,
	aggregatedMaterials,
	inset = false,
}: {
	materials: Material[]
	aggregatedMaterials: AggregateMaterialsType
	inset?: boolean
}) {
	return (
		<div className={`${inset ? "inset-control " : ""}${styles.materialList}`}>
			{materials.map((material) => (
				<MaterialItemBox
					key={material.id}
					material={material}
					required={aggregatedMaterials[material.id]}
				/>
			))}
		</div>
	)
}
