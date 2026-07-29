import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { RenderPlanner } from "@/components/planner"

export const metadata: Metadata = {
	title: RoutesData["/characters"].head,
}

export default function CharacterPlanner() {
	return <RenderPlanner plannerType="characters" />
}
