import { Metadata } from "next"

import { RoutesData } from "@/database/routes"

import RenderArcsPlanner from "./RenderArcsPlanner"

export const metadata: Metadata = {
	title: RoutesData["/arcs"].head,
}

export default function ArcPlanner() {
	return <RenderArcsPlanner />
}
