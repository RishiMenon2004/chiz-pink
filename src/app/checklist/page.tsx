import { Metadata } from "next"

import { RoutesData } from "@/data/routes"
import RenderChecklist from "./RenderChecklist"

export const metadata: Metadata = {
	title: RoutesData["/checklist"].head,
}

export default function Checklist() {
	return <RenderChecklist/>
}
