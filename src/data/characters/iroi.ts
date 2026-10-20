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

export const iroi: Character = {
	id: "iroi",
	imageSrc: "iroi.webp",
	name: "Iroi",
	description: "Oneiroi is a well-behaved kid who ticks all the boxes.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.ANIMA,
	arcType: EnumArcType.Liquid,
	ascensionMaterialSet: ascSilhouetteSet,
	ascensionBossMaterial: aPageFromDelusionsShore,
	talentMaterialSet: talentRoseSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Collaboration",
			description: [
				{
					section: "Basic Attack: Collaboration",
					description:
						"Summons lambs to perform up to <dn>5</> consecutive attacks, dealing <el>Anima DMG</>. Builds up Imagination when attacks hit.",
				},
				{
					section: "Basic Attack: Daydream",
					description:
						"Hold Basic Attack to charge up, consuming Imagination based on the charge duration to unleash up to <dn>3</> instances of Daydream, dealing <el>Anima DMG</>.\nHold Basic Attack during Reflexive Response, Bang!, Future Self Continuity, and 3.8-Billion-Year Mirage, consuming Imagination to unleash the <dn>3rd</> instance of Daydream, dealing <el>Anima DMG</>.",
				},
				{
					section: "Basic Attack: Lucid Dream",
					description:
						"Hold Basic Attack again after Iroi uses Basic Attack: Daydream to consume Imagination, summoning Morpheus to unleash sustained fire that deals <el>Anima DMG</>.",
				},
				{
					section: "Basic Attack: Wakey-Wakey",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of <el>Anima DMG</> to an area upon impact. Increases DMG based on fall height by up to <dn>100%</>. Builds up Imagination on hit.",
				},
				{
					section: "Reflexive Response",
					description:
						"Triggers when using Basic Attack: Collaboration after a Critical Dodge. Throws Morpheus at the target, dealing <dn>1</> instance of <el>Anima DMG</> and reducing Break. Builds up Imagination on hit.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Future Self Continuity",
			description: [
				{
					section: "Self-Identity Extension",
					description:
						"Press to activate. Summons lambs to heal all team members once and grant them an ATK bonus based on Iroi's Base ATK.\nSummons three lambs to attack respectively, dealing <el>Anima DMG</> and pulling in nearby enemies.\nUsing this skill builds up Imagination.",
				},
				{
					section: "Future Self Continuity",
					description:
						"Hold to activate. Creates dreamlike illusions during battle, causing <dn>3</> allies to enter the Regression state and assist in battle. Regression is automatically removed after leaving combat.",
				},
				{
					section: "Passive",
					description:
						"While Iroi is on the team and in combat, any ally who falls enters the Regression state.\nBuilds up Imagination when any fallen ally enters the Regression state.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "3.8-Billion-Year Mirage",
			description: [
				{
					description:
						"Return to the first dream. Opens the gate to a dream and triggers different effects based on the amount of Imagination built up.\nIf Imagination has not reached the required threshold: Iroi opens the Dream of the Horned Gate, continuously healing all allies.\nIf Imagination has reached the required threshold: Iroi opens the Dream of the Ivory Gate, continuously healing all allies and dealing <el>Anima DMG</> to enemies inside the dream. During this time, press and hold the avatar of a team member in the Regression state to temporarily revive them and restore a portion of their HP. This effect can revive up to <dn>1</> character during each dream.\nThe dream continuously consumes Imagination. When Imagination is depleted, the dream ends, and the revived character returns to the Regression state.\nWhile the dream is active, Imagination cannot be built up, but casting Daydream and Lucid Dream do not consume Imagination.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Bang!",
			description: [
				{
					description:
						"Just in time! Picks up Morpheus and strikes forward, dealing <dn>1</> instance of <el>Anima DMG</>, healing all team members, and building up Imagination.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Mirror Image",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Generates a Vita Bud Copy when the current Vita Bud has existed for <dn>3</>s. This copy cannot duplicate and does not count toward the Vita Bud limit. The copy produces <dn>20</> Copied Vita Pistils. Every <dn>0.5</>s, one Copied Vita Pistil flies toward a target within range and explodes, dealing <dn>37.5%</> of the original Vita Pistil's DMG.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Sympathetic Nerves",
			description: [
				{
					description:
						"Grants all team members an additional <dn>5%</> DEF Ignore for <dn>20</>s when performing healing.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Come On In!",
			description: [
				{
					description:
						"<sh>Level 1:</> Iroi increases Traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Iroi reduces Ingredient Consumption Rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> Iroi increases Traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 4:</> Iroi reduces Ingredient Consumption Rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Iroi increases Traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Ride-Along Chat",
			description: [
				{
					description:
						"<sh>Level 1:</> Grants an additional <dn>1000</> Fons in Base Fare for each order in Swift Cab.",
				},
				{
					description:
						"<sh>Level 2:</> Increases each customer's satisfaction limit in Swift Cab by <dn>25</> points.",
				},
			],
			maxLvl: 2,
		},
	},
}
