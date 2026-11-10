import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findCharacter, getAllCharactersList } from "@/data/characters"

import { toLocale } from "@/helpers/locale"
import {
	buildMetadata,
	getMetadataTranslator,
	rankForIntro,
} from "@/helpers/metadata"

import { CharacterProfile } from "@/components/profile"

type Props = {
	params: Promise<{ lang: string; id: string }>
}

export async function generateStaticParams() {
	const characters = getAllCharactersList()
	return characters.map((char) => ({
		id: char.id,
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { lang, id } = await params
	const t = await getMetadataTranslator(lang)
	const char = findCharacter(id)

	if (!char) {
		return {
			title: t("meta.character.notFound"),
		}
	}

	const element = char.element[0].toUpperCase() + char.element.slice(1)
	const { rank, takesAn } = rankForIntro(char.rarity)
	const intro = t(takesAn ? "meta.character.introAn" : "meta.character.introA", {
		name: char.name,
		rank,
		element,
	})

	return buildMetadata({
		title: t("meta.character.title", { name: char.name }),
		description: t(
			char.isPlaceholder ? "meta.character.comingSoon" : "meta.character.released",
			{ intro },
		),
		path: `/characters/${id}`,
		image: {
			url: `/characters/${id}/opengraph-image`,
			alt: t("meta.character.imageAlt", { name: char.name }),
		},
	}, t)
}

export default async function CharacterInfoPage({ params }: Props) {
	const { lang, id } = await params
	const char = findCharacter(id)

	if (!char) {
		notFound()
	}

	return <CharacterProfile character={char} locale={toLocale(lang)} />
}
