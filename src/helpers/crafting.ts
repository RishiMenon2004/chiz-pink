import type { CumulativeInventory } from "@/types/inventory"
import type { Material } from "@/types/item"

import {
	EnumMaterialType,
	EnumRarity,
	findMaterial,
	getAllMaterialsList,
} from "@/data/items"

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

// How many of `material` one `box` grants, or 0 if it isn't an option.
function getSelectionAmount(box: Material, material: Material): number {
	return (
		box.selectionOptions?.find((option) => option.id === material.id)
			?.amount ?? 0
	)
}

let selectionBoxes: Material[] | undefined

// The selection boxes offering a material, those with the fewest options
// first so the more flexible boxes are kept for materials only they cover.
function getSelectionBoxes(material: Material): Material[] {
	selectionBoxes ??= getAllMaterialsList()
		.filter((box) => box.selectionOptions)
		.sort((a, b) => a.selectionOptions!.length - b.selectionOptions!.length)

	return selectionBoxes.filter((box) => getSelectionAmount(box, material) > 0)
}

export function isSelectionBox(material: Material): boolean {
	return Boolean(material.selectionOptions)
}

// What a material can be made from, in the order to spend it: its own lower
// tiers first, highest tier first, then the substitute, and selection boxes
// only once those run out.
export function getCraftSources(material: Material): Material[] {
	const lowerMaterials = (material.linkedMaterials ?? [])
		.map((linkedMaterialId) => findMaterial(linkedMaterialId))
		.filter((linkedMaterial) => linkedMaterial.rarity < material.rarity)
		.sort((a, b) => b.rarity - a.rarity)

	const substitute = getSubstituteMaterial(material)

	return [
		...lowerMaterials,
		...(substitute ? [substitute] : []),
		...getSelectionBoxes(material),
	]
}

// How many of `source` it takes to make one `material`. A selection box
// grants several at once, so its ratio is a fraction.
export function getCraftRatio(material: Material, source: Material): number {
	if (isSelectionBox(source)) {
		return 1 / (getSelectionAmount(source, material) || 1)
	}

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

// How many of `material` were made from `craftedFrom`. Selection boxes open
// whole, so this can be more than was needed; the rest is kept.
export function getCraftedYield(
	material: Material,
	craftedFrom: { id: string; amount: number }[] = []
): number {
	return craftedFrom.reduce(
		(total, { id, amount }) =>
			total + Math.round(amount / getCraftRatio(material, findMaterial(id))),
		0
	)
}

// What crafting touched, for the final adjustment after an ascension: each
// crafted material's tiers, then any substitute or selection box that was
// actually spent.
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

		craftedFrom?.forEach((from) => {
			const source = findMaterial(from.id)
			if (isSelectionBox(source)) substitutes.push(source)
		})
	})

	return [...tiers, ...substitutes]
}
