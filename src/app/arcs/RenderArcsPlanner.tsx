"use client"

import dynamic from "next/dynamic"
import styles from "./page.module.css"
import { whatsDesired } from "@/database/arcs/whats_desired"
import { theLastRose } from "@/database/arcs/the_last_rose"

const PlannerArcBox = dynamic(
	() => import("@/components/planner/PlannerArcBox"),
	{ ssr: false }
)

export default function RenderArcsPlanner() {
	return (
		<div className={styles.page}>
			<PlannerArcBox arc={whatsDesired} numberOfItems={3} />
			<PlannerArcBox arc={theLastRose} numberOfItems={6} />
			<PlannerArcBox arc={theLastRose} numberOfItems={10} />
		</div>
	)
}
