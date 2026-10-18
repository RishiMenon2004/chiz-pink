import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findCharacter, getAllCharactersList } from "@/data/characters"

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

	const title = `${char.name} | Character Profile`
	const description =
		char.description ||
		`${char.name} character profile, skills, and ascension details on Chiz.Pink`

	return {
		title,
		description,
		openGraph: {
			title: `${char.name} - Character Profile`,
			description,
		},
		twitter: {
			card: "summary_large_image",
			title: `${char.name} - Character Profile`,
			description,
		},
	}
}

export default async function CharacterInfoPage({ params }: Props) {
	const { id } = await params
	const char = findCharacter(id)

	if (!char) {
		notFound()
	}

	return <CharacterProfile character={char} />
}
