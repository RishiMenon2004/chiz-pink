import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { RenderPlanner } from "@/components/planner"

export const metadata: Metadata = {
	title: RoutesData["/planner"].head,
}

export default function Planner() {
	return <RenderPlanner plannerType="both" />
}
