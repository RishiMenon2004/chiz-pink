import { Metadata } from "next"

import { RoutesData } from "@/data/routes"
import { RenderPulls } from "./RenderPulls"

export const metadata: Metadata = {
	title: RoutesData["/pulls"].head,
}

export default function Planner() {
	return <RenderPulls />
}
