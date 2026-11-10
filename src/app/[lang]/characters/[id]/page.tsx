import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findCharacter, getAllCharactersList } from "@/data/characters"

import { buildMetadata, rankWithArticle } from "@/helpers/metadata"

import { CharacterProfile } from "@/components/profile"

type Props = {
	params: Promise<{ id: string }>
}

export async function generateStaticParams() {
	const characters = getAllCharactersList()
	return characters.map((char) => ({
		id: char.id,
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params
	const char = findCharacter(id)

	if (!char) {
		return {
			title: "Character Not Found",
		}
	}

	const element = char.element[0].toUpperCase() + char.element.slice(1)
	const intro = `${char.name} is ${rankWithArticle(char.rarity)} ${element} Esper in Neverness to Everness.`

	return buildMetadata({
		title: `${char.name}: NTE Character Profile`,
		description: char.isPlaceholder
			? `${intro} Details will be announced soon.`
			: `${intro} View their Abilities, materials and banners.`,
		path: `/characters/${id}`,
		image: {
			url: `/characters/${id}/opengraph-image`,
			alt: `${char.name} character card`,
		},
	})
}

export default async function CharacterInfoPage({ params }: Props) {
	const { id } = await params
	const char = findCharacter(id)

	if (!char) {
		notFound()
	}

	return <CharacterProfile character={char} />
}
