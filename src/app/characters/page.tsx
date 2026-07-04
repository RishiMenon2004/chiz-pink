import { RoutesData } from "@/data/routes"
import { Metadata } from "next"

export const metadata: Metadata = {
	title: RoutesData["/characters"].head,
}

export default function CharacterPlanner() {}
