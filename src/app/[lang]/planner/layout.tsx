"use client"

import { ToolIntro } from "@/components/layout"
import { PlannerSwitch } from "@/components/planner/PlannerSwitch"
import { PlannerToolbar } from "@/components/planner/PlannerToolbar"
import { localizePath } from "@/helpers/locale"
import { PlannerSection, PlannerSectionContext, useLocale, useT } from "@/contexts"
import { useSelectedLayoutSegment } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

export default function PlannerLayout({ children }: { children: ReactNode }) {
	const segment = useSelectedLayoutSegment()
	const locale = useLocale()
	const t = useT()
	const [section, setSectionState] = useState<PlannerSection>(
		segment === "arcs" ? "arcs" : "characters"
	)

	useEffect(() => {
		if (segment === "arcs" || segment === "characters") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSectionState(segment)
		}
	}, [segment])

	useEffect(() => {
		const handlePopState = () => {
			const path = window.location.pathname
			if (path.endsWith("/arcs")) {
				setSectionState("arcs")
			} else if (path.endsWith("/characters")) {
				setSectionState("characters")
			}
		}
		window.addEventListener("popstate", handlePopState)
		return () => window.removeEventListener("popstate", handlePopState)
	}, [])

	const setSection = (nextSection: PlannerSection) => {
		setSectionState(nextSection)
		window.history.replaceState(
			null,
			"",
			localizePath(`/planner/${nextSection}`, locale)
		)
	}

	return (
		<PlannerSectionContext.Provider value={{ section, setSection }}>
			<PlannerToolbar />
			<PlannerSwitch />
			<ToolIntro id="planner">
				<div>{t("planner.intro")}</div>
			</ToolIntro>
			{children}
		</PlannerSectionContext.Provider>
	)
}
