"use client"

import type { Material } from "@/types/item"

import { MaterialItemBox } from "../MaterialBox"

import styles from "@/app/[lang]/inventory/page.module.css"

export function MaterialList({
	materials,
	inset = false,
}: {
	materials: Material[]
	inset?: boolean
}) {
	return (
		<div className={`${inset ? "inset-control " : ""}${styles.materialList}`}>
			{materials.map((material) => (
				<MaterialItemBox key={material.id} material={material} />
			))}
		</div>
	)
}
