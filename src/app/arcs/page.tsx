import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { RenderPlanner } from "@/components/planner"

export const metadata: Metadata = {
	title: RoutesData["/arcs"].head,
}

export default function ArcPlanner() {
	return <RenderPlanner plannerType="arcs" />
}
