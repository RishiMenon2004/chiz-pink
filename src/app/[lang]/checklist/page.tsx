import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import RenderChecklist from "./RenderChecklist"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/checklist", (await params).lang)
}

export default function Checklist() {
	return <RenderChecklist/>
}
