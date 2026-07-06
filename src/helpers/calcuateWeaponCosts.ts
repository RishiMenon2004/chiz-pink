import { EnumItemLvls, EnumRarity } from "@/data/items"
import { weaponPhasesMaterials } from "@/data/arcs/arc"

export function calcuateWeaponCosts(
	weaponRarity: EnumRarity,
	currentLvl: EnumItemLvls,
	targetLvl: EnumItemLvls
) {
	const totals = {
		beetleCoin: 0,
		exp: { lightDye: 0, colorlessDye: 0, chaoticDye: 0 },
		ascMaterial1: { common: 0, uncommon: 0, rare: 0 },
		ascMaterial2: { common: 0, uncommon: 0, rare: 0 },
	}

	if (currentLvl >= targetLvl) {
		return totals
	}

	Object.keys(weaponPhasesMaterials)
		.map((lvl) => Number(lvl))
		.filter((lvl) => lvl > currentLvl && lvl <= targetLvl)
		.forEach((lvl) => {
			const phase =
				weaponPhasesMaterials[lvl as keyof typeof weaponPhasesMaterials]
			const rarity = Number(weaponRarity) - 3

			if (!phase) return

			totals.beetleCoin += phase.beetleCoin[rarity]

			totals.exp.lightDye += phase.exp.lightDye[rarity]
			totals.exp.colorlessDye += phase.exp.colorlessDye[rarity]
			totals.exp.chaoticDye += phase.exp.chaoticDye[rarity]

			totals.ascMaterial1.common += phase.ascMaterial1.common[rarity]
			totals.ascMaterial1.uncommon += phase.ascMaterial1.uncommon[rarity]
			totals.ascMaterial1.rare += phase.ascMaterial1.rare[rarity]

			totals.ascMaterial2.common += phase.ascMaterial2.common[rarity]
			totals.ascMaterial2.uncommon += phase.ascMaterial2.uncommon[rarity]
			totals.ascMaterial2.rare += phase.ascMaterial2.rare[rarity]
		})

	return totals
}
