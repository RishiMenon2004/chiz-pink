import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import { ArcCatalog } from "@/components/catalog"

export const metadata: Metadata = buildRouteMetadata("/arcs")

export default function Arcs() {
	return <ArcCatalog />
}
