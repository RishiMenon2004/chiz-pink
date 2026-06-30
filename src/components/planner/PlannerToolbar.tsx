"use client"

import { ReactNode, useState } from "react"
import styles from "@/components/planner/plannerToolbar.module.css"

export default function PlannerToolbar({children}: {children: ReactNode}) {
	const [isToolbarOpen, setIsToolbarOpen] = useState<boolean>(false)

	return (
		<div
			className={`${styles.plannerToolbar} ${isToolbarOpen ? styles.toolbarOpen : ""}`}>
				{children}
			<div
				className={styles.pullOutTab}
				onClick={() => setIsToolbarOpen((prev) => !prev)}
			/>
		</div>
	)
}
