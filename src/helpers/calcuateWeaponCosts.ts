import { WeaponMaterialsCost, WeaponRecord } from "@/types/planner"

import { findArc } from "@/data/arcs"
import { weaponPhasesMaterials } from "@/data/arcs/arc"

import { getCostAmount } from "@/helpers"

export const weaponExpAmount = {
	common: 500,
	uncommon: 2500,
	rare: 10000,
}

const tiers = ["common", "uncommon", "rare"] as const

function calculateExpItemCost(exp: number): {
	beetleCoin: number
	expCost: Record<(typeof tiers)[number], number>
} {
	const expAmount = weaponExpAmount

	const beetleCoinForExp = {
		common: 150,
		uncommon: 750,
		rare: 3000,
	}

	const expCost = {
		common: 0,
		uncommon: 0,
		rare: 0,
	}

	let beetleCoin = 0
	let remainingExp = exp

	for (const tier of [...tiers].reverse()) {
		expCost[tier] = Math.floor(remainingExp / expAmount[tier])
		beetleCoin += expCost[tier] * beetleCoinForExp[tier]
		remainingExp %= expAmount[tier]
	}

	if (remainingExp > 0) {
		expCost.common += 1
		beetleCoin += beetleCoinForExp.common
	}

	return { beetleCoin, expCost }
}

export function calcuateWeaponCosts({
	id,
	currentLvl,
	targetLvl,
}: Pick<WeaponRecord, "id" | "currentLvl" | "targetLvl">): WeaponMaterialsCost {
	const totals = {
		beetleCoin: 0,
		exp: { common: 0, uncommon: 0, rare: 0 },
		ascMaterial1: { common: 0, uncommon: 0, rare: 0 },
		ascMaterial2: { common: 0, uncommon: 0, rare: 0 },
	}

	const weaponRarity = findArc(id).rarity

	if (currentLvl < targetLvl) {
		for (const [key, phase] of Object.entries(weaponPhasesMaterials)) {
			const lvl = Number(key)
			if (lvl <= currentLvl || lvl > targetLvl || !phase) continue

			totals.beetleCoin += phase.beetleCoin

			for (const tier of tiers) {
				totals.ascMaterial1[tier] += getCostAmount(
					phase.ascMaterial1[tier],
					weaponRarity
				)
				totals.ascMaterial2[tier] += getCostAmount(
					phase.ascMaterial2[tier],
					weaponRarity
				)
			}

			const { beetleCoin, expCost } = calculateExpItemCost(phase.exp)
			totals.beetleCoin += beetleCoin

			for (const tier of tiers) {
				totals.exp[tier] += expCost[tier]
			}
		}
	}

	return totals
}
