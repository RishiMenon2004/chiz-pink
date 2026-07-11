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

export function getAllCharactersAsArray() {
	return Object.values(allCharacters)
}

export function findCharacter(charId: string) {
	return allCharacters[charId]
}
