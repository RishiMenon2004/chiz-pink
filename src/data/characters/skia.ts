import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascDelusionsSet,
	confessionalFLowerSeed,
	dressSleevesOfVanity,
	talentHeartSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const skia: Character = {
	id: "skia",
	imageSrc: "skia.webp",
	name: "Skia",
	description:
		"Often mistaken for Squad 4's captain, despite being the lieutenant.",
	rarity: EnumRarity.Rare,
	element: EnumCharacterElement.LAKSHANA,
	arcType: EnumArcType.Gas,
	ascensionMaterialSet: ascDelusionsSet,
	ascensionBossMaterial: confessionalFLowerSeed,
	talentMaterialSet: talentHeartSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "Arresting Art",
			description: [
				{
					section: "Basic Attack: Arresting Art",
					description:
						"Performs up to <dn>5</> consecutive attacks using steady martial arts techniques, dealing Lakshana DMG.\nSplits <dn>1</> Fang Thrust from his shadow to pursue each target hit. Locks each target with up to <dn>3</> Fang Thrusts simultaneously.",
				},
				{
					section: "Basic Attack: Territory Control",
					description:
						"Strikes in the air and plunges, dealing <dn>1</> instance of Lakshana DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Fang Thrust",
					description:
						"Splitting from Skia's shadow, these shattered shadows resemble the fangs of a giant beast. They automatically track and attach to targets, disappearing after dealing <dn>1</> instance of Lakshana DMG.",
				},
				{
					section: "Critical Riposte: Pen to Paper",
					description:
						"Triggers when using Arresting Art after a Critical Dodge. Strikes enemies with ink-splash shadows, dealing <dn>1</> instance of Lakshana DMG to an area and reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Shadow Hound Chase",
			description: [
				{
					description:
						"A workflow designed for pursuit. Enters the Tailed state, leaps into own shadow, and deals <dn>6</> instances of Lakshana DMG to an area. Splits 3 Fang Thrusts from shadow for each target hit, then enters Shadow Hound Gnaw mode.",
				},
				{
					section: "Tailed",
					description:
						"Prevents Fang Thrusts from disappearing after dealing damage to targets during the state.",
				},
				{
					section: "Shadow Hound Gnaw",
					description:
						"Allows movement on ground or wall surfaces, similar to Shadow Hound mode.\nRemains undetected when approaching enemy targets.\nGrants immunity to certain attacks, but cancels the mode when hit by ground damage.\nTriggers additional attacks from Fang Thrusts whenever touching an enemy already marked by them.\nPress Basic Attack or switch characters to exit this mode during its duration.\nMoves forward at the edge of a high place to end this mode.\nDeals <dn>1</> instance of Lakshana DMG to an area upon exiting the mode.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "The Pack",
			description: [
				{
					description:
						"A workflow designed for suppression. Throws a spinning lighter, causing his shadow to spread across the ground in all directions, dealing <dn>1</> instance of Lakshana DMG to an area.\nConverges multiple shadows on a single location like well-trained canines, dealing <dn>3</> instances of Lakshana DMG to an area.\nIncreases Fang Thrust's damage after casting The Pack (including collision damage in Shadow Hound Gnaw mode) and inflicts a control effect on targets with each attack.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Arrest Warrant",
			description: [
				{
					description:
						"The relentless shadows cannot be shaken off. Commands the shadow like a police canine to bite the target, dealing <dn>1</> instance of Lakshana DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Suppression",
			description: [
				{
					description:
						"<sh>Remora Enhancement:</> Inflicts an additional Remora on a target when Fang Thrust locks onto them in Remora state.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Apprehension",
			description: [
				{
					description:
						"Increases Fang Thrust damage by <dn>10%</> for <dn>15</>s after casting The Pack, including collision damage in Shadow Hound Gnaw mode.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Middle Manager",
			description: [
				{
					description:
						"<sh>Level 1:</> Skia increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Skia reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, customer patience is boosted by <dn>50%</>.",
				},
				{
					description:
						"<sh>Level 4:</> Skia reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Skia increases traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
	},
}
