import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { RenderPulls } from "./RenderPulls"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/pulls", (await params).lang)
}

export default function Pulls() {
	return <RenderPulls />
}
