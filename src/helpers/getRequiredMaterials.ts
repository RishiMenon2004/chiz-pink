import type { CharacterRecord, WeaponRecord } from "@/types/planner"

import {
	beetleCoin,
	dreamlessSeed,
	expDyeSet,
	expHunterGuideSet,
	fons,
} from "@/data/items/materials"
import { findCharacter } from "@/data/characters"
import { findArc } from "@/data/arcs"

import { calculateWeaponCosts } from "./calculateWeaponCosts"
import { calculateCharacterCosts } from "./calculateCharacterCosts"

// Material lists ({ id, amount }) for a planner character or arc, shared by
// the planner store and the profile pages' level slider.

export function getWeaponRequiredMaterials(
	weapon: WeaponRecord | Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
) {
	const arc = findArc(weapon.id)
	const materialValues = calculateWeaponCosts(weapon)

	const tiers = ["common", "uncommon", "rare"] as const

	return [
		{ id: beetleCoin.id, amount: materialValues.beetleCoin },

		...tiers.map((tier, index) => ({
			id: expDyeSet[index].id,
			amount: materialValues.exp[tier],
		})),

		...tiers.map((tier, index) => ({
			id: arc.ascensionMaterialSet1[index].id,
			amount: materialValues.ascMaterial1[tier],
		})),

		...tiers.map((tier, index) => ({
			id: arc.ascensionMaterialSet2[index].id,
			amount: materialValues.ascMaterial2[tier],
		})),
	]
}

export function getCharRequiredMaterials(
	character: CharacterRecord | Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
) {
	const char = findCharacter(character.id)
	const materialValues = calculateCharacterCosts(character)
	const tiers = ["common", "uncommon", "rare"] as const

	return [
		{ id: beetleCoin.id, amount: materialValues.beetleCoin },

		{ id: fons.id, amount: materialValues.fons },
		{ id: dreamlessSeed.id, amount: materialValues.dreamlessSeed },

		{
			id: char.ascensionBossMaterial.id,
			amount: materialValues.bossMaterial,
		},

		{
			id: char.talentBossMaterial.id,
			amount: materialValues.talentBossMaterial,
		},

		...tiers.map((tier, index) => ({
			id: expHunterGuideSet[index].id,
			amount: materialValues.exp[tier],
		})),

		...tiers.map((tier, index) => ({
			id: char.ascensionMaterialSet[index].id,
			amount: materialValues.ascMaterial[tier],
		})),

		...tiers.map((tier, index) => ({
			id: char.talentMaterialSet[index].id,
			amount: materialValues.talentMaterial[tier],
		})),
	]
}
