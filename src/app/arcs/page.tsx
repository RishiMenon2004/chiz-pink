import routes from "@/database/routes"
import { Metadata } from "next"
import RenderArcsPlanner from "./RenderArcsPlanner"

export const metadata: Metadata = {
	title: routes["/arcs"].head,
}

export default function ArcPlanner() {
	return <RenderArcsPlanner />
}
