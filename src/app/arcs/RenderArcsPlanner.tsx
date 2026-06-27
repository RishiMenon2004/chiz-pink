"use client"

import dynamic from "next/dynamic"
import styles from "./page.module.css"
import { whatsDesired } from "@/database/arcs/whats_desired"
import { theLastRose } from "@/database/arcs/the_last_rose"
import { Arc } from "@/database/arcs"
import { useState } from "react"
import { DragDropProvider } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"

const PlannerArcBox = dynamic(
	() => import("@/components/planner/PlannerArcBox"),
	{ ssr: false }
)

export default function RenderArcsPlanner() {
	const [plannedArcs, setPlannedArcs] = useState<
		{ arc: Arc; items: number; uid: number }[]
	>([
		{ arc: whatsDesired, items: 3, uid: 200 },
		{ arc: theLastRose, items: 6, uid: 4000 },
		{ arc: theLastRose, items: 10, uid: 6 },
	])

	return (
		<div className={styles.page}>
			<DragDropProvider
				onDragEnd={(e) => {
					if (e.canceled) return

					const { source } = e.operation

					if (isSortable(source)) {
						const { initialIndex, index } = source

						if (initialIndex !== index) {
							setPlannedArcs((arcs) => {
								const newArcs = [...arcs]
								const [removed] = newArcs.splice(
									initialIndex,
									1
								)
								newArcs.splice(index, 0, removed)
								return newArcs
							})
						}
					}
				}}>
				{plannedArcs.map(({ arc, items, uid }, index) => (
					<PlannerArcBox
						key={uid}
						arc={arc}
						numberOfItems={items}
						index={index}
						uid={uid}
					/>
				))}
			</DragDropProvider>
		</div>
	)
}
