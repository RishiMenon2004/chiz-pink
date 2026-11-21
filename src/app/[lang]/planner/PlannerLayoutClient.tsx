"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

import { localizePath } from "@/helpers/locale"

import {
	PlannerSection,
	PlannerSectionContext,
	useLocale,
	useT,
} from "@/contexts"

import { ToolIntro } from "@/components/layout/ToolIntro"
import { PlannerSwitch } from "@/components/planner/PlannerSwitch"
import { PlannerToolbar } from "@/components/planner/PlannerToolbar"

export function PlannerLayoutClient({ children }: { children: ReactNode }) {
	const segment = useSelectedLayoutSegment()
	const locale = useLocale()
	const t = useT()
	const [section, setSectionState] = useState<PlannerSection>(
		segment === "arcs" ? "arcs" : "characters"
	)
	const [prevSegment, setPrevSegment] = useState(segment)

	if (prevSegment !== segment) {
		setPrevSegment(segment)
		if (segment === "arcs" || segment === "characters") {
			setSectionState(segment)
		}
	}

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
