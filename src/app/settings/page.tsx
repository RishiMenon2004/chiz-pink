import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { RenderSettings } from "./RenderSettings"

export const metadata: Metadata = buildRouteMetadata("/settings")

export default function Settings() {
	return <RenderSettings />
}
