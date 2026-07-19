import { WeaponMaterialsCost, WeaponRecord } from "@/types/planner"

import { findArc } from "@/data/arcs"
import { weaponPhasesMaterials } from "@/data/arcs/arc"

import { getCostAmount } from "@/helpers"

export const weaponExpAmount = {
	common: 500,
	uncommon: 2500,
	rare: 10000,
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

	let totalExp = 0
	const weaponRarity = findArc(id).rarity
	const tiers = ["common", "uncommon", "rare"] as const

	if (currentLvl < targetLvl) {
		for (const [key, phase] of Object.entries(weaponPhasesMaterials)) {
			const lvl = Number(key)
			if (lvl <= currentLvl || lvl > targetLvl || !phase) continue

			totals.beetleCoin += phase.beetleCoin
			totalExp += phase.exp

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
		}

		const expAmount = weaponExpAmount

		const beetleCoinForExp = {
			common: 150, 
			uncommon: 750,
			rare: 3000 
		}

		const expCost = {
			common: 0,
			uncommon: 0,
			rare: 0,
		}

		for (const tier of [...tiers].reverse()) {
			expCost[tier] = Math.floor(totalExp / expAmount[tier])
			totals.beetleCoin += expCost[tier] * beetleCoinForExp[tier]
			totalExp %= expAmount[tier]
		}

		if (totalExp > 0) {
			expCost.common += 1
		}

		totals.exp = expCost
	}

	return totals
}
