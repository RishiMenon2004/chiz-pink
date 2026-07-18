import { Character } from "@/types/character"
import { adler } from "./adler"
import { iroi } from "./iroi"

const allCharacters: Record<string, Character> = {
	iroi,
	adler,
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
