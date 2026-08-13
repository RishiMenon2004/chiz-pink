import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascNumeralSet,
	eternalMemory,
	nestGuardFragment,
	talentMagicSet,
} from "../items/materials"

export const zankou: Character = {
	isPreview: true,
	id: "zankou",
	imageSrc: "zankou.webp",
	name: "Zankou",
	description: "",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.INCANTATION,
	arcType: EnumArcType.Gas,
	ascensionMaterialSet: ascNumeralSet,
	ascensionBossMaterial: nestGuardFragment,
	talentMaterialSet: talentMagicSet,
	talentBossMaterial: eternalMemory,
	abilities: {
		basicAttack: {
			name: "Wildfire",
			description: [
				{
					section: "Basic Attack: Wildfire",
					description:
						"While in Reality state, Zankou swings her Cursed Blade for up to five consecutive attacks, dealing incantation DMG.",
				},
				{
					section: "Basic Attack: Flickering Shadow",
					description: "While in Reality state, Deals Incantation DMG.",
				},
				{
					section: "Basic Attack: Nightmare Waltz",
					description:
						"While in Illusion state, performs up to four consecutive attacks, applying 1 stack of Heartwrench to the target on hit. Every hit of Nightmare Waltz spreads the DoT effect on the target to other targets withing range.",
				},
				{
					section: "Basic Attack: Moonfall",
					description:
						"While in Illusion state, deals Incantation DMG. Applies 1 stack of Heartwrench to the target on hit. DMG dealt by Basic Attack: Moonfall counts as follow-up attack DMG.",
				},
				{
					section: "Critical Riposte: Voidstep",
					description: "Deals Incantation DMG.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Sanguine Dash / Soulcross",
			description: [
				{
					section: "Sanguine Dash",
					description:
						"Deals Incantation DMG, and switches into <kw>Illusion</>. If cast while the skill icon is lit up, applies a Heartwrench DoT effect to the target on hit, and deals heavy Break DMG to targets over a wide area.",
				},
				{
					section: "Soulcross",
					description:
						"Deals Incantation DMG, and switches into <kw>Reality</>. If cast while the skill icon is lit up, deals massive DMG to targets across a wide area, plus activates Zankou's Ultimate: Bloodfeast Reverie",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Bloodfeast Reverie",
			description: [
				{
					description:
						"Press to unleash Ultimate: Inferno Flamenco.\nIf Bloodfeast Reverie is active, Zankou leads with Bloodfeast Reverie instead, applying multiple stacks of Vile Ash. After successfully casting Ultimate: Bloodfeast Reverie, press again within a set window to unlead an empowered Ultimate: Inferno Flamenco at no Ultimate Energy Cost.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "TBD",
			description: [
				{
					description:
						"W-we're waiting on more official information. We're sorry for the inconvenience",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "TBD",
			description: [
				{
					description:
						"W-we're waiting on more official information. We're sorry for the inconvenience",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "TBD",
			description: [
				{
					description:
						"W-we're waiting on more official information. We're sorry for the inconvenience",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "TBD",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases the Server attribute of all characters by <dn>10</>.",
				},
				{
					description:
						"<sh>Level 2:</> Gains an additional <dn>10%</> from Volleyball towards Tycoon Incentive Fund.",
				},
				{
					description:
						"<sh>Level 3:</> Increases the Spiking attribute of all characters by <dn>10</>.",
				},
				{
					description:
						"<sh>Level 4:</> Gains an additional <dn>10%</> from Volleyball towards Tycoon Incentive Fund.",
				},
				{
					description:
						"<sh>Level 5:</> Increases the Recieving attribute of all characters by <dn>10</>.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "TBD",
			description: [
				{
					description:
						"<sh>Level 1:</> In Fight Club, consumes an additional <dn>1</> City Stamina and grants corresponding rewards.",
				},
				{
					description:
						"<sh>Level 2:</> In Fight Club, consumes an additional <dn>1</> City Stamina and grants corresponding rewards.",
				},
			],
			maxLvl: 2,
		},
	},
}
