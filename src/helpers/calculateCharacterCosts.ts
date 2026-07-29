import { CharacterMaterialCosts, CharacterRecord } from "@/types/planner"

import { EnumItemLvls } from "@/data/items"
import {
	characterLevelMaterials,
	characterSkillLevelMaterials,
	SkillTypes,
} from "@/data/characters/character"

export const characterExpAmount = {
	common: 1000,
	uncommon: 5000,
	rare: 10000,
}

export function calculateSkillCosts(
	type: keyof typeof characterSkillLevelMaterials,
	currentLvl: number,
	targetLvl: number
): Omit<CharacterMaterialCosts, "exp"> {
	const totals = {
		fons: 0,
		dreamlessSeed: 0,

		beetleCoin: 0,
		bossMaterial: 0,
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		talentMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		talentBossMaterial: 0,
	}

	if (currentLvl < targetLvl) {
		for (const [key, required] of Object.entries(
			characterSkillLevelMaterials[type]
		)) {
			const lvl = Number(key)
			if (lvl <= currentLvl || lvl > targetLvl || !required) continue

			totals.fons += required.fons
			totals.dreamlessSeed += required.dreamlessSeed

			totals.beetleCoin += required.beetleCoin
			totals.bossMaterial += required.bossMaterial
			totals.talentBossMaterial += required.talentBossMaterial

			const tiers = ["common", "uncommon", "rare"] as const
			for (const tier of tiers) {
				totals.ascMaterial[tier] += required.ascMaterial[tier]
				totals.talentMaterial[tier] += required.talentMaterial[tier]
			}
		}
	}

	return totals
}

export function calculateLevelCosts(
	currentLvl: EnumItemLvls,
	targetLvl: EnumItemLvls
): Pick<
	CharacterMaterialCosts,
	"beetleCoin" | "bossMaterial" | "exp" | "ascMaterial"
> {
	const totals = {
		beetleCoin: 0,
		bossMaterial: 0,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	}

	let totalExp = 0

	const tiers = ["common", "uncommon", "rare"] as const

	if (currentLvl < targetLvl) {
		for (const [key, phase] of Object.entries(characterLevelMaterials)) {
			const lvl = Number(key)
			if (lvl <= currentLvl || lvl > targetLvl || !phase) continue

			totals.beetleCoin += phase.beetleCoin
			totals.bossMaterial += phase.bossMaterial
			totalExp += phase.exp

			for (const tier of tiers) {
				totals.ascMaterial[tier] += phase.ascMaterial[tier]
			}
		}

		const expAmount = characterExpAmount

		const beetleCoinForExp = {
			common: 250,
			uncommon: 1250,
			rare: 5000,
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

export function calculateCharacterCosts({
	currentLvl,
	targetLvl,
	abilitySet,
}: Pick<
	CharacterRecord,
	"currentLvl" | "targetLvl" | "abilitySet"
>): CharacterMaterialCosts {
	const totals = {
		fons: 0,
		dreamlessSeed: 0,

		beetleCoin: 0,
		bossMaterial: 0,
		exp: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		talentMaterial: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		talentBossMaterial: 0
	}

	const tiers = ["common", "uncommon", "rare"] as const
	const levelMaterials = calculateLevelCosts(currentLvl, targetLvl)

	totals.beetleCoin += levelMaterials.beetleCoin
	totals.bossMaterial += levelMaterials.bossMaterial

	for (const tier of tiers) {
		totals.exp[tier] += levelMaterials.exp[tier]
	}

	for (const [skill, skillLvl] of Object.entries(abilitySet)) {
		if (skillLvl.isDisabled) continue

		let type: SkillTypes = "esper"

		switch (skill) {
			case "basicAttack":
			case "skill":
			case "ultimate":
			case "support":
			default:
				type = "esper"
				break
			case "passive1":
				type = "passive1"
				break
			case "passive2":
				type = "passive2"
				break
			case "passive3":
				type = "passive3"
				break
			case "lifeSkill1":
				type = "life1"
				break
			case "lifeSkill2":
				type = "life2"
				break
		}

		const materials = calculateSkillCosts(
			type,
			skillLvl.currentLvl,
			skillLvl.targetLvl
		)
		totals.fons += materials.fons
		totals.dreamlessSeed += materials.dreamlessSeed

		totals.beetleCoin += materials.beetleCoin
		totals.bossMaterial += materials.bossMaterial
		totals.talentBossMaterial += materials.talentBossMaterial

		for (const tier of tiers) {
			totals.ascMaterial[tier] += materials.ascMaterial[tier]
			totals.talentMaterial[tier] += materials.talentMaterial[tier]
		}
	}

	return totals
}
