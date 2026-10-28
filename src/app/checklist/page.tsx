import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import RenderChecklist from "./RenderChecklist"

export const metadata: Metadata = buildRouteMetadata("/checklist")

export default function Checklist() {
	return <RenderChecklist/>
}
