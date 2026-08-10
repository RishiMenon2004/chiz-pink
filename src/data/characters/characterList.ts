import { Character } from "@/types/character"

import {
	adler,
	aurelia,
	baicang,
	chaos,
	chiz,
	daffodill,
	edgar,
	fadia,
	haniel,
	hathor,
	hotori,
	iroi,
	jiuyuan,
	lacrimosa,
	linko,
	mint,
	nanally,
	sakiri,
	shinku,
	skia,
	zankou,
	zero,
} from "@/data/characters"

const allCharacters: Record<string, Character> = {
	linko,
	zankou,
	iroi,
	shinku,
	chaos,
	lacrimosa,
	hotori,
	nanally,
	zero,
	baicang,
	chiz,
	daffodill,
	fadia,
	hathor,
	jiuyuan,
	sakiri,
	adler,
	aurelia,
	edgar,
	haniel,
	mint,
	skia,
}

export function getAllCharacters() {
	return allCharacters
}

const allCharactersArray = Object.values(allCharacters)

export function getAllCharactersList() {
	return allCharactersArray
}

export function findCharacter(charId: string) {
	return allCharacters[charId]
}
