import { Character } from "@/types/character"

import { adler } from "./adler"
import { akane } from "./akane"
import { aurelia } from "./aurelia"
import { baicang } from "./baicang"
import { blackbird } from "./blackbird"
import { chaos } from "./chaos"
import { chiz } from "./chiz"
import { daffodill } from "./daffodill"
import { edgar } from "./edgar"
import { elyms } from "./elyms"
import { exe } from "./exe"
import { fadia } from "./fadia"
import { haniel } from "./haniel"
import { hathor } from "./hathor"
import { hotori } from "./hotori"
import { iroi } from "./iroi"
import { jiuyuan } from "./jiuyuan"
import { lacrimosa } from "./lacrimosa"
import { linko } from "./linko"
import { mint } from "./mint"
import { nanally } from "./nanally"
import { sakiri } from "./sakiri"
import { shinku } from "./shinku"
import { skia } from "./skia"
import { zankou } from "./zankou"
import { zero } from "./zero"

// Display order for lists that have no sort of their own. The content script
// (scripts/content-add.ts) files new characters under these headings.
const allCharacters: Record<string, Character> = {
	// Limited S rank: newest first
	exe,
	elyms,
	akane,
	blackbird,
	linko,
	zankou,
	iroi,
	shinku,
	chaos,
	lacrimosa,
	hotori,
	nanally,
	// Standard S rank: A-Z, after Esper Zero
	zero,
	baicang,
	chiz,
	daffodill,
	fadia,
	hathor,
	jiuyuan,
	sakiri,
	// A rank: A-Z
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

const allCharactersList = Object.values(allCharacters)

export function getAllCharactersList() {
	return allCharactersList
}

export function findCharacter(charId: string) {
	return allCharacters[charId]
}

export function findCharacterByName(characterName: string) {
	const name = characterName.toLowerCase()
	return allCharactersList.find(
		(character) => character.name.toLowerCase() === name
	)
}
