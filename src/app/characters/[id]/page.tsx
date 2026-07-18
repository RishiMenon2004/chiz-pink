"use client"

import { useParams } from "next/navigation"

import type { Ability } from "@/types/character"

import { findCharacter } from "@/data/characters/characterList"

import { parseDescription } from "@/helpers"

function AbilitySection({ ability }: { ability: Ability }) {
	return (
		<>
			{ability.description.map((section, index) => (
				<div key={index}>
					<div>{section.section}</div>
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
		<div>
			<div>{char.name}</div>
			{parseDescription(char.description, 1)}
			{abilities.map((ability, index) => (
				<AbilitySection key={index} ability={ability} />
			))}
		</div>
	)
}
