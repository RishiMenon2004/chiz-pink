"use client"

import { RenderPlanner } from "@/components/planner"
import { usePlannerSectionContext } from "@/contexts"

export function RenderSplitPlanner() {
	const { section } = usePlannerSectionContext()
	return <RenderPlanner plannerType={section} />
}