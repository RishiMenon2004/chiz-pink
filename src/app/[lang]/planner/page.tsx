import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import { RenderPlanner } from "@/components/planner"

export const metadata: Metadata = buildRouteMetadata("/planner")

export default function Planner() {
	return <RenderPlanner plannerType="both" />
}
