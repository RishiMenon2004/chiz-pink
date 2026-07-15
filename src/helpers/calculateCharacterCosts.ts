import {
	characterLevelMaterials,
	characterSkillLevelMaterials,
	SkillTypes,
} from "@/data/characters/character"
import { EnumItemLvls } from "@/data/items"
import { CharacterRecord } from "@/types/planner"

export function calculateSkillCosts(
	type: keyof typeof characterSkillLevelMaterials,
	currentLvl: number,
	targetLvl: number
) {
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

			totals.ascMaterial.common += required.ascMaterial.common
			totals.ascMaterial.uncommon += required.ascMaterial.uncommon
			totals.ascMaterial.rare += required.ascMaterial.rare

			totals.talentMaterial.common += required.talentMaterial.common
			totals.talentMaterial.uncommon += required.talentMaterial.uncommon
			totals.talentMaterial.rare += required.talentMaterial.rare
		}
	}

	return totals
}

export function calculateLevelCosts(
	currentLvl: EnumItemLvls,
	targetLvl: EnumItemLvls
) {
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

	if (currentLvl < targetLvl) {
		for (const [key, phase] of Object.entries(characterLevelMaterials)) {
			const lvl = Number(key)
			if (lvl <= currentLvl || lvl > targetLvl || !phase) continue

			totals.beetleCoin += phase.beetleCoin
			totals.bossMaterial += phase.bossMaterial

			totals.exp.common += phase.exp.common
			totals.exp.uncommon += phase.exp.uncommon
			totals.exp.rare += phase.exp.rare

			totals.ascMaterial.common += phase.ascMaterial.common
			totals.ascMaterial.uncommon += phase.ascMaterial.uncommon
			totals.ascMaterial.rare += phase.ascMaterial.rare
		}
	}

	return totals
}

export function calculateCharacterCosts({currentLvl, targetLvl, abilitySet}: Pick<CharacterRecord, 'currentLvl' | 'targetLvl' | 'abilitySet'>) {
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
	}

	const levelMaterials = calculateLevelCosts(currentLvl, targetLvl)

	totals.beetleCoin += levelMaterials.beetleCoin
	totals.bossMaterial += levelMaterials.bossMaterial

	totals.exp.common += levelMaterials.exp.common
	totals.exp.uncommon += levelMaterials.exp.uncommon
	totals.exp.rare += levelMaterials.exp.rare

	const skillMaterials: Omit<typeof totals, "exp">[] = []

	for (const [skill, skillLvl] of Object.entries(abilitySet)) {
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

		skillMaterials.push(
			calculateSkillCosts(type, skillLvl.currentLvl, skillLvl.targetLvl)
		)
	}

	skillMaterials.forEach(materials => {
		totals.fons += materials.fons
		totals.dreamlessSeed += materials.dreamlessSeed

		totals.beetleCoin += materials.beetleCoin
		totals.bossMaterial += materials.bossMaterial
		
		totals.ascMaterial.common += materials.ascMaterial.common
		totals.ascMaterial.uncommon += materials.ascMaterial.uncommon
		totals.ascMaterial.rare += materials.ascMaterial.rare
		
		totals.talentMaterial.common += materials.talentMaterial.common
		totals.talentMaterial.uncommon += materials.talentMaterial.uncommon
		totals.talentMaterial.rare += materials.talentMaterial.rare
	})

	return totals
}
