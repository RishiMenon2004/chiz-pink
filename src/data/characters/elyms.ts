import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascSilhouetteSet,
	hollowflowerSeed,
	talentBirdSet,
	tearOfTheSea,
} from "../items/materials"
import { placeholderAbilities } from "./placeholder"

export const elyms: Character = {
	isPlaceholder: true,
	id: "elyms",
	imageSrc: "elyms.webp",
	name: "Elyms",
	description: "Details to be announced.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascSilhouetteSet,
	ascensionBossMaterial: tearOfTheSea,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: hollowflowerSeed,
	abilities: {
		...placeholderAbilities,
		basicAttack: {
			name: "Instant Glitch",
			description: [
				{
					section: "Basic Attack: Instant Glitch",
					description:
						"Elyms has three levels of Connection Strength. At Weak Connection, she operates the Dreamworn Terminal to perform up to <dn>5</> consecutive attacks, dealing <el>Cosmos DMG</>.",
				},
				{
					section: "Basic Attack: Interference",
					description:
						"At Weak Connection, hold Basic Attack during Basic Attack: Instant Glitch to trigger Basic Attack: Interference, dealing <el>Cosmos DMG</>.",
				},
				{
					section: "Basic Attack: Crosstalk",
					description:
						"At Medium Connection or Strong Connection, Elyms operates the Dreamworn Terminal to perform up to <dn>3</> consecutive attacks, dealing <el>Cosmos DMG</>.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Intermittent Existence",
			description: [
				{
					section: "Redirect Skill: Intermittent Existence",
					description:
						"Elyms deals <el>Cosmos DMG</> to targets in an area and raises her Connection Strength to Medium Connection. She also automatically scans for targets within a set range and switches her Ultimate to single-target or AoE form based on how many targets she finds. When her Connection Strength rises from Weak Connection to Medium Connection, she gains the Optical Illusion buff for a set duration.",
				},
				{
					section: "Redirect Skill: Goodbye to You",
					description:
						"Elyms deals <el>Cosmos DMG</> to targets in an area. On cast, she spends all her current Optical Illusion stacks, increasing this skill's DMG Ratio based on the number of stacks spent.\nAfter casting, if Elyms is at Medium Connection, her Connection Strength rises to Strong Connection. She also automatically scans for targets within a set range and switches her Ultimate to single-target or AoE form based on how many targets she finds.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Do You Get Deja Vu",
			description: [
				{
					section: "Ultimate: Do You Get Deja Vu",
					description:
						"Elyms's Ultimate, Do You Get Deja Vu, has two forms: single-target and AoE.\nAt Weak Connection, her Ultimate defaults to AoE form.\nAt Medium Connection or Strong Connection, her Ultimate automatically switches to single-target or AoE form based on the target scans from her Redirect Skill and Support Skill.\nHer Ultimate's DMG Ratio is set by her Connection Strength at the time of casting. After casting, her Connection Strength resets to Weak Connection.\nAfter she casts her Ultimate in either form, all team members except Elyms gain an ATK boost based on her own Base ATK for a set duration. Triggering her Ultimate again refreshes the duration.\nElyms also enters the On the Line state. While it lasts, if Elyms is off-field, she automatically follows up with the coordinated attack Remembrance.",
				},
				{
					section: "Coordinated Attack: Remembrance",
					description:
						"The single-target or AoE form of Coordinated Attack: Remembrance matches that of the previously cast Ultimate, and its DMG Ratio is based on the Connection Strength at the time that Ultimate was cast.\nDMG dealt by Remembrance counts as follow-up attack DMG.\nOnce Remembrance has been triggered the maximum number of times, the On the Line state ends.\nIf the Ultimate is cast again before On the Line ends, the On the Line state resets.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "I'm Here",
			description: [
				{
					description:
						"Elyms operates the Dreamworn Terminal to deal <el>Cosmos DMG</>.\nAfter casting her Support Skill, if Elyms is at Weak Connection, her Connection Strength rises to Medium Connection. She also automatically scans for targets within a set range and switches her Ultimate to single-target or AoE form based on how many targets she finds.\nWhen Elyms's Connection Strength rises from Weak Connection to Medium Connection, she gains the Optical Illusion buff for a set duration.",
				},
			],
			maxLvl: 10,
		},
	},
}
