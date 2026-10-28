import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import { RenderHome } from "./RenderHome"

export const metadata: Metadata = buildRouteMetadata("/")

export default function Home() {
	return <RenderHome/>
}
