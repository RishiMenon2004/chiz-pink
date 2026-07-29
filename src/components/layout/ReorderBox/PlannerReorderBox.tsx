"use client"

import { useSortable } from "@dnd-kit/react/sortable"

import { Arc } from "@/types/weapon"
import { Character } from "@/types/character"
import { CharacterRecord, WeaponRecord } from "@/types/planner"

import { findItem, getItemRarityStyle } from "@/data/items"

import { stopPropogation } from "@/helpers"

import { CharacterAvatar } from "../CharacterAvatar"
import { ArcIcon } from "../ArcIcon"

import styles from "./plannerReorderBox.module.css"

function ReorderItem({
	itemRecord,
	index,
}: {
	itemRecord: WeaponRecord | CharacterRecord
	index: number
}) {
	const item = findItem(itemRecord.id)
	const isArc = "uid" in itemRecord

	const { ref } = useSortable({
		id: isArc ? itemRecord.uid : itemRecord.id,
		index,
	})

	return (
		<div ref={ref} className={`${styles.item} ${getItemRarityStyle(item)}`}>
			{isArc ? (
				<ArcIcon
					className={`raised-control ${styles.itemIcon}`}
					arc={item as Arc}
					width={512}
					height={512}
					loading="eager"
				/>
			) : (
				<CharacterAvatar
					className={`raised-control ${styles.itemIcon}`}
					character={item as Character}
					width={256}
					height={256}
					loading="eager"
				/>
			)}
			<span className={styles.itemName}>{item.name}</span>
		</div>
	)
}

export function PlannerReorderBox({
	items,
}: {
	items: Record<string, WeaponRecord | CharacterRecord>
}) {
	return (
		<div
			className={`metallic-panel ${styles.panel}`}
			onClick={stopPropogation}>
			Adjust Priority
			<div
				className={`raised-control ${styles.itemList}`}
				style={{
					display: "flex",
					flexDirection: "column",
				}}>
				{Object.values(items).map((itemRecord, index) => (
					<ReorderItem
						key={"uid" in itemRecord ? itemRecord.uid : itemRecord.id}
						itemRecord={itemRecord}
						index={index}
					/>
				))}
			</div>
		</div>
	)
}
