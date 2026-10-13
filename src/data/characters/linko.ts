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
	id: "linko",
	imageSrc: "linko.webp",
	name: "Linko",
	description:
		'A girl who can detect "frequencies" of all things, perceiving the world like no one else.',
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.ANIMA,
	arcType: EnumArcType.Plasma,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: waterMoonPick,
	talentMaterialSet: talentRoseSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "Poltergeist CQC",
			description: [
				{
					section: "Basic Attack: Poltergeist CQC",
					description:
						"Casts Poltergeist CQC to perform up to <dn>5</> consecutive attacks, dealing Anima DMG. Builds up Modulation points with each hit.\nCasts Full-Frequency Pulse to consume Modulation points and enhance the triggered <kw>Synced Strike</>.",
				},
				{
					section: "Basic Attack: Spectral Smack",
					description:
						"Hold Basic Attack during Poltergeist CQC to make Linko strike the current target with both palms, dealing Anima DMG.",
				},
				{
					section: "Basic Attack: Spectral Entrance",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of Anima DMG in an area upon impact. Increases DMG based on fall height by up to 100%.",
				},
				{
					section: "Basic Attack: Spectral Rush",
					description:
						"Sends Xiaozhen to ambush the target every <dn>8</>s while Linko is off-field, causing Xiaozhen to attack once and inflict a <kw>Hit 'Em Here!</> mark.",
				},
				{
					section: "Critical Riposte: Ghosthand Counter",
					description:
						"Triggers when using Poltergeist CQC after a Critical Dodge. Charges toward the target, dealing <dn>4</> instances of Anima DMG in an area and building up Modulation.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Full-Frequency Pulse",
			description: [
				{
					description:
						"Channels Esper Ability upon casting Full-Frequency Pulse, bombarding the target with ghost energy to deal up to <dn>4</> instances of Anima DMG and calling Xiaozhen or an ally to perform a <kw>Synced Strike</>. Opens a selection wheel to choose Xiaozhen or an ally, then performs the selected character's <kw>Synced Strike</>, dealing DMG of the corresponding attribute. Grants this <kw>Synced Strike</> a DMG Bonus and consumes all accumulated Modulation, converting it into an additional DMG Bonus.\nBriefly pauses the battle timer while selecting the attacker and initiating the <kw>Synced Strike</>.\nReplaces an ally's position on the wheel with Xiaozhen if the ally is unable to act or is not on the team. Grants Xiaozhen's <kw>Synced Strike</> an additional DMG Bonus for each additional Xiaozhen on the wheel.\nEnable Auto-Cast Skills under \"Settings > System Features\" to have the first ally in the team perform <kw>Synced Strike</> by default.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Oversync",
			description: [
				{
					description:
						'Enters Overdrive upon casting Oversync, deploying a Resonance Field for a set duration and Syncing with up to <dn>3</> allies. Allows Redirect Skill to be pressed to call on Synced allies in sequence to perform <kw>Synced Strikes</>, up to <dn>3</> times. Deals <dn>1</> additional instance of Anima Area DMG when a <kw>Synced Strike</> is performed within Resonance Field.\nEnds Overdrive when its duration expires or when Oversync is pressed again, releasing an overloaded noise burst that deals multiple instances of Anima Area DMG and <dn>1</> instance of Anima Burst DMG to all enemies within Resonance Field. Increases this Anima Burst DMG based on the number of different debuffs on each target.\nExtends Resonance Field for a set duration after Overdrive ends. Counts Support Skills triggered by allies within Resonance Field as <kw>Synced Strikes</>, treats their DMG as Follow-up Attack DMG, and grants them the bonuses from Precision Tuning, Starlit Whispers, and The World Answers.\nEnable Auto-Cast Skills under "Settings > System Features" to have allies perform <kw>Synced Strikes</> in sequence by default.',
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Spectral Cross",
			description: [
				{
					description:
						"Strikes the target together with Xiaozhen, dealing <dn>1</> instance of Anima DMG in an area.\nSummons an ally to perform a <kw>Synced Strike</> by breaking a <kw>Hit 'Em Here!</> mark, casting Full-Frequency Pulse, or casting Oversync. Scales <kw>Synced Strike</>'s DMG Ratio with Spectral Cross's skill level.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Weakness Radar",
			description: [
				{
					description:
						"<sh>Hexed Enhancement:</> Increases the base DMG of additional Follow-up Attacks from Hexed to <dn>30%</> while Linko is on the team. Targets affected by Hexed take <dn>10%</> more Follow-up Attack DMG.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Precision Tuning",
			description: [
				{
					description:
						"Reduces the target's Esper Ability Resistance corresponding to the attribute of the character who triggers <kw>Synced Strike</> by <dn>8%</> for <dn>12</>s. Resistance Reduction effects for different attributes can coexist on the same target. Effects of the same attribute inflicted by <kw>Synced Strike</> do not stack. Resets the duration when triggered again.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Kitchen Magic",
			description: [
				{
					description:
						"<sh>Level 1:</> Linko increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 2:</> Linko reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> Linko increases traffic by <dn>18</>.",
				},
				{
					description:
						"<sh>Level 4:</> Linko reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Linko increases traffic by <dn>27</>.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Show & Tell",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases Fons Earnings from display cases in Going, Going, Gone! by <dn>10%</>.",
				},
				{
					description:
						"<sh>Level 2:</> Increases Fons Earnings from display cases in Going, Going, Gone! by <dn>5%</>.",
				},
			],
			maxLvl: 2,
		},
	},
}
