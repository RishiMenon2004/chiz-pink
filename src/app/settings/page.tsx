import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { RenderSettings } from "./RenderSettings"

// Personal settings: nothing here for search.
export const metadata: Metadata = {
	...buildRouteMetadata("/settings"),
	robots: { index: false },
}

export default function Settings() {
	return <RenderSettings />
}
