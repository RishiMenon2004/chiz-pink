import { CharacterRecord } from "@/types/planner"

import { EnumItemLvls } from "@/data/items"
import { findCharacter, getAllCharactersAsArray } from "@/data/characters/characterList"

export function generateNewCharacter(charID?: string) {
	const featuredChar = charID ? findCharacter(charID) : getAllCharactersAsArray()[0]
	const newChar: Omit<CharacterRecord, "requiredMaterials" | "isDisabled"> = {
		id: featuredChar.id,
		currentLvl: EnumItemLvls.Lvl1,
		targetLvl: EnumItemLvls.Lvl80,
		abilitySet: {
			basicAttack: {
				isDisabled: false,
				currentLvl: 1,
				targetLvl: featuredChar.abilities.basicAttack.maxLvl,
			},
			skill: {
				isDisabled: false,
				currentLvl: 1,
				targetLvl: featuredChar.abilities.skill.maxLvl,
			},
			ultimate: {
				isDisabled: false,
				currentLvl: 1,
				targetLvl: featuredChar.abilities.ultimate.maxLvl,
			},
			support: {
				isDisabled: false,
				currentLvl: 1,
				targetLvl: featuredChar.abilities.support.maxLvl,
			},
			passive1: {
				isDisabled: false,
				currentLvl: 0,
				targetLvl: 1,
			},
			lifeSkill1: {
				isDisabled: false,
				currentLvl: 0,
				targetLvl: featuredChar.abilities.lifeSkill1.maxLvl,
			},
		},
		awakening: 0,
	}

	if (featuredChar.abilities.passive2) {
		newChar.abilitySet.passive2 = {
			isDisabled: false,
			currentLvl: 0,
			targetLvl: 1,
		}
	}

	if (featuredChar.abilities.passive3) {
		newChar.abilitySet.passive3 = {
			isDisabled: false,
			currentLvl: 0,
			targetLvl: 1,
		}
	}

	if (featuredChar.abilities.lifeSkill2) {
		newChar.abilitySet.lifeSkill2 = {
			isDisabled: false,
			currentLvl: 0,
			targetLvl: featuredChar.abilities.lifeSkill2.maxLvl,
		}
	}

	return newChar
}
