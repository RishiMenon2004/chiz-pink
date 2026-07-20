import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascWhispersSet,
	colorfulTicketStub,
	goodBoyStamp,
	talentBirdSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const edgar: Character = {
	id: "edgar",
	imageSrc: "edgar.png",
	name: "Edgar",
	description:
		"Thinks quick, looks like a kid. Is a kid, actually.",
	rarity: EnumRarity.Rare,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Liquid,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: colorfulTicketStub,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Combat Practice",
			description: [
				{
					section: "Basic Attack: Combat Practice",
					description:
						"Applies what he learned in Lamplight Academy's physical education class to perform up to 5 consecutive attacks that deal Cosmos DMG.",
				},
				{
					section: "Basic Attack: Calculated Landing",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of Cosmos DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Crisis is Opportunity",
					description:
						"Triggers when using Combat Practice after a Critical Dodge.\nCharges toward the target and uses his backpack to unleash a Flow attack, dealing <dn>1</> instance of Cosmos DMG to an area and reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Wild Current",
			description: [
				{
					description:
						"Hold to enter a channeling state, continuously casting Current at the target, dealing Cosmos DMG and continuously healing the teammate with the lowest HP.\nThe CD of Redirect Skill: Wild Current increases based on the duration of use.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Finnegan's Wake",
			description: [
				{
					description:
						"Immerses in his own thoughts, unleashing a labyrinthine domain for 10s. Deals 1 instance of AoE Cosmos DMG. Heals the current character over the domain's duration.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Weight of Knowledge",
			description: [
				{
					description:
						"This bag is really heavy. Edgar charges toward the target and swings his bag with all his might, dealing 1 instance of Cosmos DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Gentle Edge",
			description: [
				{
					description:
						"<sh>Charge Enhancement:</> Grants 120 Ultimate Energy instantly when a character triggers Charge using a Support Skill. Disables Ultimate Energy gain from Vita Pistils when hitting Slowed targets afterward. Cooldown: 30s.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Unchanging Warmth",
			description: [
				{
					description:
						"Cast Redirect Skill Wild Current or Support Skill Weight of Knowledge to gain a Key of Truth, up to 3 keys.\nEach Key of Truth extends the duration of Ultimate: Finnegan's Vigil by 1s.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Knowledge in Action",
			description: [
				{
					description:
						"<sh>Level 1:</> Edgar increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Edgar reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> Edgar increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 4:</> Edgar reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Edgar increases traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
	},
}
