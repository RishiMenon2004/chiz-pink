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

export const iroi: Character = {
	isFeatured: true,
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
						"Summons lambs to perform up to 5 consecutive attacks, dealing Anima DMG. Builds up Imagination when attacks hit.",
				},
				{
					section: "Basic Attack: Daydream",
					description:
						"Hold Basic Attack again after Iroi uses Daydream to consume Imagination and summon Morpheus, unleashing sustained fire that deals Anima DMG.",
				},
				{
					section: "Basic Attack: Lucid Dream",
					description:
						"Press Basic Attack while airborne to plunge, dealing 1 instance of Anima DMG to an area upon impact. Increases DMG based on fall height, up to 100%. Builds up Imagination when attacks hit.",
				},
				{
					section: "Basic Attack: Wakey-Wakey",
					description:
						"Triggers when casting Deliverance after a Critical Dodge. Dodges an attack with a quick dash, seizes the enemy's opening and swiftly swings his weapon, dealing 1 instance of Incantation DMG to an area, reducing their Break.",
				},
				{
					section: "Critical Riposte: Reflexive Response",
					description:
						"Triggers when using Collaboration after performing a Critical Dodge. Swings Phantasos at the target, dealing 1 instance of Anima DMG and reducing Break. Builds up Imagination when attacks hit.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Future Self Continuity",
			description: [
				{
					section: "Redirect Skill: Self-Identity Extension",
					description:
						"Press to activate. Summons lambs to heal the team once and grant Bonus ATK based on her ATK.\nSummons lambs to attack independently and pull in targets within range. Each ally in the Regression state deals additional DMG based on her Base ATK.\nUsing this skill builds up Imagination.",
				},
				{
					section: "Redirect Skill: Future Self Continuity",
					description:
						"Hold to activate. Creates dreamlike illusions while in combat, causing 3 allies to enter the Regression state and assist in battle. Regression is automatically removed after leaving combat.",
				},
				{
					description:
						"<sh>Passive:</> Fallen allies enter the Regression state while Iroi is active and in combat.\nBuilds up Imagination when any fallen allies enter the Regression state.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "3.8-Billion-Year Mirage",
			description: [
				{
					description:
						"Return to the first dream. Opens the gate to a dream and triggers different effects based on the amount of Imagination built up.\nIf Imagination has not reached the required threshold: Iroi opens the Dream of the Horned Gate, continuously healing all allies.\nIf Imagination has reached the required threshold: Iroi opens the Dream of the Ivory Gate, continuously dealing DMG to enemies inside the dream. During this time, press and hold the avatar icon of a character in the Regression state to revive them and restore some HP. This effect can revive up to 1 character during each dream.\nThe dream continuously consumes Imagination. When Imagination is depleted, the dream ends, and revived characters return to the Regression state.\nWhile the Ultimate's effect is active, Imagination cannot be built up, but Daydream and Lucid Dream do not consume Imagination.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Bang!",
			description: [
				{
					description:
						"Just in time! Picks up Morpheus and attacks forward, dealing 1 instance of Anima DMG, healing all allies, and building up Imagination.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Mirror Image",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Generates a Vita Bud copy when the current Vita Bud has existed for <dn>3</>s. This copy cannot generate another copy.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Sympathetic Nerves",
			description: [
				{
					description:
						"Grants the team an additional DEF Ignore for a short duration when healing an ally.",
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
						"<sh>Level 1:</> Grants an additional 1000 Fons in Base Fare for each order in Swift Travel.",
				},
				{
					description:
						"<sh>Level 2:</> Increases each customer's satisfaction limit in Swift Travel by 25 points.",
				},
			],
			maxLvl: 2,
		},
	},
}
