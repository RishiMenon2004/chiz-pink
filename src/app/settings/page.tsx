import { Metadata } from "next"

import { RoutesData } from "@/data/routes"
import { RenderSettings } from "./RenderSettings"

export const metadata: Metadata = {
	title: RoutesData["/settings"].head,
}

export default function Settings() {
	return <RenderSettings />
}
