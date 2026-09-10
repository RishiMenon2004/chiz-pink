import { notFound } from "next/navigation"

import { findCharacter, getAllCharactersList } from "@/data/characters"
import { generateCharacterOgImage } from "@/helpers/ogImageGenerator"

export const alt = "Character Profile"
export const size = {
	width: 1200,
	height: 630,
}
export const contentType = "image/png"

type Props = {
	params: Promise<{ id: string }>
}

export async function generateStaticParams() {
	const characters = getAllCharactersList()
	return characters.map((char) => ({
		id: char.id,
	}))
}

export default async function Image({ params }: Props) {
	const { id } = await params
	const char = findCharacter(id)

	if (!char) {
		notFound()
	}

	return generateCharacterOgImage(char)
}
