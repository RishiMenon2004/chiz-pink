import { Character } from "@/types/character"
import { Arc } from "@/types/weapon"
import { getAllArcs } from "../arcs"
import { getAllCharacters } from "../characters"

export function findItem(itemId: string): Arc | Character {
	return getAllArcs()[itemId] ?? getAllCharacters()[itemId]
}
