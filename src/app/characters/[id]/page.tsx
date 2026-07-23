"use client"

import { useParams } from "next/navigation"

import type { Ability } from "@/types/character"

import { findCharacter } from "@/data/characters/characterList"

import { parseDescription } from "@/helpers"

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

export default function CharacterInfoPage() {
	const params = useParams()
	const char = findCharacter(params?.id as string)

	if (!char) {
		return <div>Character not found.</div>
	}

	const abilities = [
		char.abilities.basicAttack,
		char.abilities.skill,
		char.abilities.ultimate,
		char.abilities.support,
		char.abilities.passive1,
		char.abilities.passive2,
		char.abilities.passive3,
		char.abilities.lifeSkill1,
		char.abilities.lifeSkill2,
	].filter((ability): ability is Ability => Boolean(ability))

	return (
		<main className="page" role="main">
			<h1>{char.name}</h1>
			{parseDescription(char.description, 1)}
			{abilities.map((ability, index) => (
				<AbilitySection key={index} ability={ability} />
			))}
		</main>
	)
}
