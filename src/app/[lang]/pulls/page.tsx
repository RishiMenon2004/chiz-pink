import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { RenderPulls } from "./RenderPulls"

export const metadata: Metadata = buildRouteMetadata("/pulls")

export default function Pulls() {
	return <RenderPulls />
}
