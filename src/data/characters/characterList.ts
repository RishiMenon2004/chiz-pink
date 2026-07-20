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
	mint,
	nanally,
	sakiri,
	shinku,
	skia,
	zero,
} from "@/data/characters"

const allCharacters: Record<string, Character> = {
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
