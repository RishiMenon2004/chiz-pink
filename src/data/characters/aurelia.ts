import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascDelusionsSet,
	goodBoyStamp,
	nestGuardFragment,
	talentRoseSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const aurelia: Character = {
	id: "aurelia",
	imageSrc: "aurelia.png",
	name: "Aurelia",
	description:
		"A fun fact about Hethereau, thanks to meeting Aurelia: cruising the streets on a jellyfish isn't a traffic violation.",
	rarity: EnumRarity.Rare,
	element: EnumCharacterElement.PSYCHE,
	arcType: EnumArcType.Plasma,
	ascensionMaterialSet: ascDelusionsSet,
	ascensionBossMaterial: nestGuardFragment,
	talentMaterialSet: talentRoseSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Cappella",
			description: [
				{
					section: "Basic Attack: Legato",
					description:
						"Sing smoothly and naturally! Wields her weapon and performs up to 4 consecutive attacks, dealing Psyche DMG.",
				},
				{
					section: "Basic Attack: Staccato",
					description:
						'Sing loudly and fully! Hold Dodge while moving to ride a jellyfish, sprinting at high speed for the duration. Generates a jellyfish blast at intervals when targets are nearby, dealing Psyche DMG.\nPerforms a special Dodge in this state, and "Critical Dodge Riposte: Syncopation" automatically fires four jellyfish blasts.\nEnds automatically when stamina drops below a certain amount.',
				},
				{
					section: "Basic Attack: Portamento",
					description:
						"Sing clearly and beautifully! Wields the weapon mid-air and plunges, dealing <dn>1</> instance of Psyche DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Syncopation",
					description:
						"Triggers when casting Legato after a Critical Dodge.\nThink you can handle my rhythm? Wields her weapon to deal <dn>1</> instance of Psyche DMG to an area and reduces Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Cadenza Aria",
			description: [
				{
					description:
						"Transform the everyday into a rainbow melody and let it roar across the skyline. Deals <dn>1</> instance of AoE Psyche DMG and enters the Cadenza state for <dn>12</>s.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Canon Chorus",
			description: [
				{
					description:
						"Let's play the next verse together. Gathers nearby jellyfish, dealing 6 instances of AoE Psyche DMG and slightly pulling targets together.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Dissonance",
			description: [
				{
					description:
						"True command means never mistaking the timing. Commands the jellyfish to strike, dealing 1 instance of AoE Psyche DMG on hit.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Harmonics",
			description: [
				{
					description:
						"<sh>Nova Enhancement:</> Deals 3 instances of Psyche DMG to the target after their Nova status ends, each equal to 50% of ATK.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Crescendo",
			description: [
				{
					description:
						"Increases Aurelia's ATK by <dn>1%</> for <dn>5</>s when a jellyfish blast hits a target, up to <dn>10</> stacks.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Perfect Fit",
			description: [
				{
					description:
						"<sh>Level 1:</> Aurelia increases dish prices by an additional <dn>0.12</> Fons.",
				},
				{
					description:
						"<sh>Level 2:</> Aurelia increases traffic by <dn>1%</> for every 2 Beverage tag on dishes.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, customers leave additional tips upon departure..",
				},
				{
					description:
						"<sh>Level 4:</> Aurelia reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Aurelia increases traffic by <dn>1.5%</> for every 2 Beverage tags on dishes.",
				},
			],
			maxLvl: 5,
		},
	},
}
