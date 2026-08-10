import { Character } from "@/types/character"
import { EnumRarity } from "../items"
import { EnumCharacterElement } from "./character"
import { EnumArcType } from "../arcs"
import {
	ascWhispersSet,
	dressSleevesOfVanity,
	talentRoseSet,
	waterMoonPick,
} from "../items/materials"

export const linko: Character = {
	isPreview: true,
	id: "linko",
	imageSrc: "linko.webp",
	name: "Linko",
	description: "",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.ANIMA,
	arcType: EnumArcType.Plasma,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: dressSleevesOfVanity,
	talentMaterialSet: talentRoseSet,
	talentBossMaterial: waterMoonPick,
	abilities: {
		basicAttack: {
			name: "Poltergeist CQC",
			description: [
				{
					section: "Basic Attack: Poltergeist CQC",
					description:
						"Linko chains up to five consecutive attacks, dealing Anima DMG. Each hits builds Modulation",
				},
				{
					section: "Basic Attack: Poltergeist Rocket Punch",
					description:
						"Linko slingshots herself forwards with Xiaozhen's ghost arms, dealing DMG to enemies on impact",
				},
				{
					section: "Critical Riposte: Ghosthand Counter",
					description:
						"deals 1 instance of Anima DMG and builds Modulation",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Full-Frequency Pulse",
			description: [
				{
					description:
						"Deals Anima DMG, then syncs on the spot, calling in Xiaozhen or a teammate for a Synced Strike.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Oversync",
			description: [
				{
					description:
						"Opens a Resonance Field that lasts a set duration and sync with up to 3 teammates at once. Press the Redirect Skill button to call in Synced Strikes with teammates one after another.",
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
			name: "Weakness Radar",
			description: [
				{
					description:
						"<sh>Hexed Enhancement:</> Bonus follow-up DMG from Hexed is increased and Hexed targets take increased follow-up DMG",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Precision Tuning",
			description: [
				{
					description:
						"Each Synced Strike lowers the target's resistance to the matching attribute of the teammate that launched it for a set duration. Targets can carry multiple attribute reductions. Same-attribute reductions from Synced Strikes dont't stack",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "TBD",
			description: [
				{
					description:
						"W-we're waiting on more official information. We're sorry for the inconvenience",
				},
			],
			maxLvl: 5,
		},
	},
}
