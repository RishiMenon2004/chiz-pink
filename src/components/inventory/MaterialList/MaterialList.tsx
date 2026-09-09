"use client"

import dynamic from "next/dynamic"

import type { Material } from "@/types/item"

import styles from "@/app/inventory/page.module.css"

const InventoryMaterialBox = dynamic(
	() => import("../MaterialBox").then((mod) => mod.MaterialItemBox),
	{ ssr: false }
)

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
				<InventoryMaterialBox key={material.id} material={material} />
			))}
		</div>
	)
}
