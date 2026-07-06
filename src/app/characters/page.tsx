import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import RenderCharacterPlanner from "./RenderCharacterPlanner"

export const metadata: Metadata = {
	title: RoutesData["/characters"].head,
}

export default function CharacterPlanner() {
	return <RenderCharacterPlanner />
}
