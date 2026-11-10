import { Metadata } from "next"
import { notFound } from "next/navigation"

import { buildRouteMetadata } from "@/helpers/metadata"

import { RenderSplitPlanner } from "./RenderSplitPlanner"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { section } = await params
	if (!["arcs", "characters"].includes(section)) return {}

	return buildRouteMetadata(`/planner/${section}`)
}

type Props = {
	params: Promise<{ section: string }>
}

export default async function SplitPlannerPage({ params }: Props) {
	const { section } = await params
	if (!["arcs", "characters"].includes(section)) return notFound()

	return <RenderSplitPlanner />
}
