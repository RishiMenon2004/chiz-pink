import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	aPageFromDelusionsShore,
	ascSilhouetteSet,
	goodBoyStamp,
	talentRoseSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "./character"

export const nanally: Character = {
	id: "nanally",
	imageSrc: "nanally.webp",
	name: "Nanally",
	description:
		"The Ichi-daime of the Coluccis—currently seeking new recruits!",
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
						"Bares her fangs and brandishes her claws, performing up to <dn>5</> consecutive attacks, dealing <el>Anima DMG</>. Dodging does not interrupt the combo.",
				},
				{
					section: "Basic Attack: Heavy Hitter!",
					description:
						"Triggers by holding Basic Attack. Performs up to <dn>3</> powerful attacks, dealing <el>Anima DMG</>. Chains after Critical Riposte and the <dn>1st</>, <dn>2nd</>, <dn>3rd</>, and <dn>5th</> attacks of Colucci Secret Skill. Dodging does not interrupt the combo.",
				},
				{
					section: "Basic Attack: Colucci Secret Gundo",
					description:
						"Enters aim mode, dealing <dn>1</> instance of single-target <el>Anima DMG</> to the enemy in the crosshair.",
				},
				{
					section: "Basic Attack: Grand Entrance!",
					description:
						"Swings her claws in the air and plunges, dealing <dn>1</> instance of <el>Anima DMG</> to an area upon impact. Increases DMG based on fall height, up to <dn>100%</>.",
				},
				{
					section: "Critical Riposte: Can't Touch This!",
					description:
						"Triggers when using Colucci Secret Skill after a Critical Dodge. Charges toward the target at full speed, planting one hand on the ground, delivering a roundhouse kick that deals <dn>1</> instance of <el>Anima DMG</> to an area, and reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Colucci Howling Technique",
			description: [
				{
					description:
						"Hehe, surprise time! Deals <dn>5</> instances of <el>Anima DMG</> to surrounding enemies and wraps herself in Anima Esper Ability, gaining the Ichi-daime's Authority effect.\nLasts <dn>12</>s or until Nanally is switched out.\nEnds Ichi-daime's Authority early when recast.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Colucci Ultimate Technique",
			description: [
				{
					description:
						"I'm way stronger than them! Deals <dn>7</> instances of <el>Anima DMG</> immediately to surrounding enemies and summons Underboss to fight alongside her.\nCreates a small pull effect on surrounding enemies with Nanally's attacks while Underboss is active, and coordinates with all of Nanally's attacks to launch strikes, dealing <el>Anima DMG</> that also counts as <sh>follow-up attack</> damage.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Justice from Above",
			description: [
				{
					description:
						"Time to get serious! Charges with a spinning motion, delivering a kick and dealing <dn>1</> instance of <el>Anima DMG</> to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "More Than Passionate",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Fires <dn>10</> Vita Pistils with Vita Bud, reducing the interval between each shot to <dn>1</>s.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Fair Duel",
			description: [
				{
					description:
						"Applies <dn>1</> <sh>follow-up attack</> to a single enemy, dealing <el>Anima DMG</> of <dn>60%</> ATK whenever any ally deals <dn>1</> instance of Esper Cycle DMG while Nanally is in Ichi-daime's Authority state. DMG Ratio scales with Basic Attack skill level, reaching <dn>129.5%</> at Lvl <dn>11</>.\nTriggers <dn>once</> every <dn>2</>s.",
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
						"<sh>Level 5:</> Nanally increases dish prices by <dn>0.3</> Fons for every <dn>2</> Main Dish tags on dishes.",
				},
			],
			maxLvl: 5,
		},
	},
}
