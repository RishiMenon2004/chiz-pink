import { WeaponMaterialsCost, WeaponRecord } from "@/types/planner"

import { findArc } from "@/data/arcs"
import { weaponPhasesMaterials } from "@/data/arcs/arc"

import { getCostAmount } from "@/helpers"

export function calcuateWeaponCosts(
	{
		id,
		currentLvl,
		targetLvl,
	}: Pick<WeaponRecord, "id" | "currentLvl" | "targetLvl">
): WeaponMaterialsCost {
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

			const tiers = ["common", "uncommon", "rare"] as const
			for (const tier of tiers) {
				totals.exp[tier] += getCostAmount(phase.exp[tier], weaponRarity)
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
	}

	return totals
}
