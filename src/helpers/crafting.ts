import type { CumulativeInventory } from "@/types/inventory"
import type { Material } from "@/types/item"

import { EnumMaterialType, EnumRarity, findMaterial } from "@/data/items"

import { weaponExpAmount } from "./calculateWeaponCosts"
import { characterExpAmount } from "./calculateCharacterCosts"
import { getLinkedMaterials } from "./getLinkedMaterials"

// Boss drops have their own material types, so they never get a substitute.
const substituteIdByType: Partial<Record<EnumMaterialType, string>> = {
	[EnumMaterialType.CharacterAscension]: "heterogeneous_unit",
	[EnumMaterialType.Talent]: "expansion_core",
	[EnumMaterialType.WeaponAscension]: "expansion_core",
}

const substituteIds = new Set(Object.values(substituteIdByType))

const weaponExpAmountByRarity: Partial<Record<EnumRarity, number>> = {
	[EnumRarity.Common]: weaponExpAmount.common,
	[EnumRarity.Uncommon]: weaponExpAmount.uncommon,
	[EnumRarity.Rare]: weaponExpAmount.rare,
}

const characterExpAmountByRarity: Partial<Record<EnumRarity, number>> = {
	[EnumRarity.Common]: characterExpAmount.common,
	[EnumRarity.Uncommon]: characterExpAmount.uncommon,
	[EnumRarity.Rare]: characterExpAmount.rare,
}

// Only tiered materials can be substituted, which also rules out standalone
// items of the same type (Dreamless Seed) and the substitutes themselves.
function getSubstituteMaterial(material: Material): Material | undefined {
	const substituteId = substituteIdByType[material.materialType]

	return substituteId && material.linkedMaterials
		? findMaterial(substituteId)
		: undefined
}

// What a material can be made from, in the order to spend it: its own lower
// tiers first, highest tier first, and the substitute only once those run out.
export function getCraftSources(material: Material): Material[] {
	const lowerMaterials = (material.linkedMaterials ?? [])
		.map((linkedMaterialId) => findMaterial(linkedMaterialId))
		.filter((linkedMaterial) => linkedMaterial.rarity < material.rarity)
		.sort((a, b) => b.rarity - a.rarity)

	const substitute = getSubstituteMaterial(material)

	return substitute ? [...lowerMaterials, substitute] : lowerMaterials
}

// How many of `source` it takes to make one `material`.
export function getCraftRatio(material: Material, source: Material): number {
	const isWeaponExp = material.materialType === EnumMaterialType.WeaponExp
	const isCharacterExp = material.materialType === EnumMaterialType.CharacterExp

	if (isWeaponExp || isCharacterExp) {
		const expAmountByRarity = isWeaponExp
			? weaponExpAmountByRarity
			: characterExpAmountByRarity

		return (
			(expAmountByRarity[material.rarity] ?? 0) /
			(expAmountByRarity[source.rarity] || 1)
		)
	}

	// A substitute is worth one common material, whatever its own rarity.
	const sourceRarity = substituteIds.has(source.id)
		? EnumRarity.Common
		: source.rarity

	return 3 ** (material.rarity - sourceRarity)
}

// What crafting touched, for the final adjustment after an ascension: each
// crafted material's tiers, then any substitute that was actually spent.
export function getCraftAdjustmentMaterials(
	requiredMaterials: { id: string }[],
	inventory: CumulativeInventory = {}
): Material[] {
	const tiers: Material[] = []
	const substitutes: Material[] = []

	requiredMaterials.forEach(({ id }) => {
		const { craftedAmount, craftedFrom } = inventory[id] ?? {}
		if (!craftedAmount) return

		const material = findMaterial(id)
		tiers.push(...getLinkedMaterials(material))

		const substitute = getSubstituteMaterial(material)
		if (substitute && craftedFrom?.some((from) => from.id === substitute.id)) {
			substitutes.push(substitute)
		}
	})

	return [...tiers, ...substitutes]
}
