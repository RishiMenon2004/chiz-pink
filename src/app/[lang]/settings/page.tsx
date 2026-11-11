import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { RenderSettings } from "./RenderSettings"

// Personal settings: nothing here for search.
type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return {
		...(await buildRouteMetadata("/settings", (await params).lang)),
		robots: { index: false },
	}
}

export default function Settings() {
	return <RenderSettings />
}
