import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import { CharacterCatalog } from "@/components/catalog"

export const metadata: Metadata = buildRouteMetadata("/characters")

export default function Characters() {
	return <CharacterCatalog />
}
