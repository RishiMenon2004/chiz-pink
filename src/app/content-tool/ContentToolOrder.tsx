"use client"

import { CSSProperties } from "react"

import { Feedback } from "@dnd-kit/dom"
import type { DragEndEvent } from "@dnd-kit/dom"
import { DragDropProvider } from "@dnd-kit/react"
import { isSortable, useSortable } from "@dnd-kit/react/sortable"

import pageStyles from "@/app/page.module.css"
import reorderStyles from "@/components/layout/ReorderBox/plannerReorderBox.module.css"
import styles from "./page.module.css"

// icon: a round thumbnail on a pink row. banner: the whole row is the
// image instead, cropped and coloured like the calendar item.
export type OrderItem = {
	key: string
	label: string
	icon?: string
	banner?: { src: string; themeColor?: string; yOffset?: string }
}

function OrderRow({ item, index }: { item: OrderItem; index: number }) {
	const { ref } = useSortable({ id: item.key, index })

	if (item.banner) {
		const style = {
			"--banner": `url("${item.banner.src}")`,
			"--theme-color": item.banner.themeColor || undefined,
			"--y-offset": item.banner.yOffset || "50%",
		} as CSSProperties

		return (
			<div ref={ref} className={`${reorderStyles.item} ${styles.orderBanner}`} style={style}>
				<span className={reorderStyles.itemName}>{item.label}</span>
			</div>
		)
	}

	return (
		<div ref={ref} className={reorderStyles.item}>
			{item.icon ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img className={`inset-control ${reorderStyles.itemIcon}`} src={item.icon} alt="" />
			) : (
				<span className={`inset-control ${reorderStyles.itemIcon} ${styles.orderNoIcon}`} />
			)}
			<span className={reorderStyles.itemName}>{item.label}</span>
		</div>
	)
}

// The current tab's entries as a drag list, the same rows as the planner's
// Adjust Priority box. Dropping a row moves the entry from → to.
export function OrderPanel({ items, onMove }: { items: OrderItem[]; onMove: (from: number, to: number) => void }) {
	const onDragEnd = (e: DragEndEvent) => {
		if (e.canceled) return
		const { source } = e.operation
		if (!isSortable(source)) return
		if (source.initialIndex !== source.index) onMove(source.initialIndex, source.index)
	}

	return (
		<section className={`metallic-panel ${styles.panel}`}>
			<h2 className={pageStyles.sectionTitle}>Order</h2>
			{items.length < 2 ? (
				<p className={styles.note}>Add another entry to reorder.</p>
			) : (
				<DragDropProvider
					plugins={(defaults) => [...defaults, Feedback.configure({ dropAnimation: null })]}
					onDragEnd={onDragEnd}
				>
					<div className={`inset-control ${reorderStyles.itemList} ${styles.orderList}`}>
						{items.map((item, index) => (
							<OrderRow key={item.key} item={item} index={index} />
						))}
					</div>
				</DragDropProvider>
			)}
		</section>
	)
}
