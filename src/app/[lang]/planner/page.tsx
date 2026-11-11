import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import { RenderPlanner } from "@/components/planner"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/planner", (await params).lang)
}

export default function Planner() {
	return <RenderPlanner plannerType="both" />
}
