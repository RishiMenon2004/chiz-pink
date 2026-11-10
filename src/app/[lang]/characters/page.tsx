import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import { CharacterCatalog } from "@/components/catalog"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/characters", (await params).lang)
}

export default function Characters() {
	return <CharacterCatalog />
}
