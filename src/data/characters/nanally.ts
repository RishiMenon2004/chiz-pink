import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	aPageFromDelusionsShore,
	ascSilhouetteSet,
	goodBoyStamp,
	talentRoseSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const nanally: Character = {
	id: "nanally",
	imageSrc: "nanally.png",
	name: "Nanally",
	description:
		"The Ichi-daime of the Coluccis—currently seeking new recruits!z",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.ANIMA,
	arcType: EnumArcType.Plasma,
	ascensionMaterialSet: ascSilhouetteSet,
	ascensionBossMaterial: aPageFromDelusionsShore,
	talentMaterialSet: talentRoseSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Colucci Secret Skill",
			description: [
				{
					section: "Basic Attack: Colucci Secret Skill",
					description:
						"Bares her fangs and brandishes her claws, performing up to <dn>5</> consecutive attacks, dealing Anima DMG. Dodging does not interrupt the combo.",
				},
				{
					section: "Basic Attack: Heavy Hitter!",
					description:
						"Triggers by holding Basic Attack. Performs up to 3 powerful attacks, dealing Anima DMG. Chains after Critical Riposte and the 1st, 2nd, 3rd, and 5th attacks of Colucci Secret Skill. Dodging does not interrupt the combo.",
				},
				{
					section: "Basic Attack: Colucci Secret Gundo",
					description:
						"Enters aim mode, dealing <dn>1</> instance of single-target Anima DMG to the enemy in the crosshair.",
				},
				{
					section: "Basic Attack: Grand Entrance!",
					description:
						"Swings her claws in the air and plunges, dealing <dn>1</> instance of Anima DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Can't Touch This!",
					description:
						"Triggers when using Colucci Secret Skill after a Critical Dodge. Charges toward the target at full speed, planting one hand on the ground, delivering a roundhouse kick that deals <dn>1</> instance of Anima DMG to an area, and reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Colucci Howling Technique",
			description: [
				{
					description:
						"Hehe, surprise time! Deals <dn>5</> instances of Anima DMG to surrounding enemies and wraps herself in Anima Esper Ability, gaining the Ichi-daime's Authority effect.\nLasts <dn>12</>s or until Nanally is switched out.\nEnds Ichi-daime's Authority early when recast.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Colucci Ultimate Technique",
			description: [
				{
					description:
						"I'm way stronger than them! Deals <dn>7</> instances of Anima DMG immediately to surrounding enemies and summons Underboss to fight alongside her.\nCreates a small pull effect on surrounding enemies with Nanally's attacks while Underboss is active, and coordinates with all of Nanally's attacks to launch strikes, dealing Anima DMG that also counts as follow-up attack damage.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Justice from Above",
			description: [
				{
					description:
						"Time to get serious! Charges with a spinning motion, delivering a kick and dealing <dn>1</> instance of Anima DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "More Than Passionate",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Fires 10 Vita Pistils with Vita Bud, reducing the interval between each shot to 1s.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Fair Duel",
			description: [
				{
					description:
						"Applies <dn>1</> follow-up attack to a single enemy, dealing Anima DMG of <dn>60%</> ATK whenever any ally deals <dn>1</> instance of Esper Cycle DMG while Nanally is in Ichi-daime's Authority state. DMG Ratio scales with Basic Attack skill level, reaching <dn>129.5%</> at Lvl 11.\nTriggers once every <dn>2</>s.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Family Business",
			description: [
				{
					description:
						"<sh>Level 1:</> Nanally increases dish prices by <dn>0.2</> Fons for each Main Dish tag on dishes.",
				},
				{
					description:
						"<sh>Level 2:</> Nanally reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, hitting customers with the hammer grants <dn>115%</> of the current dish price.",
				},
				{
					description:
						"<sh>Level 4:</> Nanally reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Nanally increases dish prices by <dn>0.3</> Fons for every 2 Main Dish tags on dishes.",
				},
			],
			maxLvl: 5,
		},
	},
}
