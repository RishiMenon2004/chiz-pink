import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { CharacterCatalog } from "@/components/catalog"

export const metadata: Metadata = {
	title: RoutesData["/characters"].head,
}

export default function Characters() {
	return <CharacterCatalog />
}
