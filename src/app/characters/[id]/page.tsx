import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findCharacter, getAllCharactersList } from "@/data/characters"
import { Ability } from "@/types/character"
import { parseDescription } from "@/helpers"

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

function AbilitySection({ ability }: { ability: Ability }) {
	return (
		<>
			<h3>{ability.name}</h3>
			{ability.description.map((section, index) => (
				<div key={index}>
					<h4>{section.section}</h4>
					<div>{parseDescription(section.description, 1)}</div>
				</div>
			))}
		</>
	)
}

export default async function CharacterInfoPage({ params }: Props) {
	const { id } = await params
	const char = findCharacter(id)

	if (!char) {
		notFound()
	}

	return (
		<main className="page" role="main">
			<h1>{char.name}</h1>
			{char.description && <div>{char.description}</div>}
			<h2>Basic Attack</h2>
			<AbilitySection ability={char.abilities.basicAttack} />
			<h2>Skill</h2>
			<AbilitySection ability={char.abilities.skill} />
			<h2>Ultimate</h2>
			<AbilitySection ability={char.abilities.ultimate} />
			{char.abilities.support && (
				<>
					<h2>Support</h2>
					<AbilitySection ability={char.abilities.support} />
				</>
			)}
		</main>
	)
}
