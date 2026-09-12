"use client"

import { CSSProperties, ReactNode } from "react"
import { useSelectedLayoutSegment } from "next/navigation"
import styles from "./plannerSwitch.module.css"
import { PlannerSection, usePlannerSectionContext } from "@/contexts"

function SwitchButton({
	id,
	children,
}: {
	id: PlannerSection
	children: ReactNode
}) {
	const { section, setSection } = usePlannerSectionContext()
	return (
		<button
			onClick={() => setSection(id)}
			className={`${styles.switchButton} ${section == id ? styles.active : ""}`}
			style={
				{
					"--icon": `url("/icons/${id.slice(0, -1)}.png")`,
				} as CSSProperties
			}>
			<span className={styles.label}>{children}</span>
		</button>
	)
}

export function PlannerSwitch() {
	const segment = useSelectedLayoutSegment()
	const { section } = usePlannerSectionContext()

	return (
		<div
			className={`${styles.switchContainer} ${section === "arcs" ? styles.right : styles.left}`}
			style={{
				display: segment ? "grid" : "none",
			}}>
			<SwitchButton id="characters">Characters</SwitchButton>
			<SwitchButton id="arcs">Arcs</SwitchButton>
		</div>
	)
}
