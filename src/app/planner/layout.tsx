"use client"

import { PlannerSwitch } from "@/components/planner/PlannerSwitch"
import { PlannerToolbar } from "@/components/planner/PlannerToolbar"
import { PlannerSection, PlannerSectionContext } from "@/contexts"
import { useSelectedLayoutSegment } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

export default function PlannerLayout({ children }: { children: ReactNode }) {
	const segment = useSelectedLayoutSegment()
	const [section, setSectionState] = useState<PlannerSection>(
		segment === "arcs" ? "arcs" : "characters"
	)

	useEffect(() => {
		if (segment === "arcs" || segment === "characters") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSectionState(segment)
		}
	}, [segment])

	const setSection = (nextSection: PlannerSection) => {
		setSectionState(nextSection)
		window.history.replaceState(null, "", `/planner/${nextSection}`)
	}

	return (
		<PlannerSectionContext.Provider value={{ section, setSection }}>
			<PlannerToolbar />
			<PlannerSwitch />
			{children}
		</PlannerSectionContext.Provider>
	)
}
