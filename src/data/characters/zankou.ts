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
	isFeatured: true,
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
					description: "Wields her blade and performs up to 5 consecutive attacks while in Reality Form, dealing Incantation DMG. Pulls in targets within range on the 5th instance of Basic Attack. Gains the Hunt buff for the attack's duration."
				},
				{
					section: "Basic Attack: Nightmare Waltz",
					description:
						"Wields her blade to pull the silk and perfroms up to 4 consecutive attacks while in Illusion form, dealing Incantation DMG and inflicting 1 stack of Heartwrench on hit. Pulls in targets within range on the 3rd instance of Basic Attack. Each Nightmare Waltz attack spreads up to 4 DoT effects from the target to all enemies in the area, including the original target. Gains the Delusion buff for the attack's duration. The DMG dealt by Nightmare Waltz counts as Follow-up Attack DMG.",
				},
				{
					section: "Basic Attack: Flickering Shadow",
					description: "Hold Basic Attack during the 1st or 2nd stage of Wildfire while in Reality Form to trigger Flickering Shadow, dealing Incantation DMG.",
				},
				{
					section: "Basic Attack: Moonfall",
					description:
						"Hold Basic Attack during the 1st or 2nd stage of Nightmare Waltz while in Illusion Form to trigger Moonfall, dealing Incantation DMG. Inflicts 1 stack of Heartwrench on hit. The DMG dealt by Moonfall counts as Follow-up Attack DMG.",
				},
				{
					section: "Basic Attack: Broken Twigs",
					description: "Press Basic Attack while airborne to plunge, dealing 1 instance of Incantation DMG in an area upon impact. Increases DMG based on fall height by up to 100%."
				},
				{
					section: "Critical Riposte: Voidstep",
					description: "Press Basic Attack after a Critical Dodge to deal Incantation DMG and reduce Break.",
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
						"Switches to Illusion Form after successfully castinh Sanguine Dash while in Reality Form. Enables an enhanced Sanguine Dash for a set time after the 4th or 5th stage of Wildfire, Flickering Shadow or Voidstep. Inflicts Heartwrench on targets hit and triggers Disarray, reducing massive Break of enemies in a large area. Delays removal of the Reality Form Hunt effect when switching to Illusion Form with Sanguine Dash. Prevents the form switch if the skill is interrupted before it is complete.",
				},
				{
					section: "Soulcross",
					description:
						"Switches to Reality Form after successfully casting Soulcross while in Illusion Form. Enables an enhanced Soulcross shortly before Illusion Form ends. Deals massive DMG to enemies in a large area, inflicts Heartwrench on targets hit, and triggers Oblivion, activating Bloodfeast Reverie.\nGrants Illusion Form and returns Zankou to Reality Form when Soulcross or Bloodfeast Reverie is successfully cast, when its duration expires, or when Zankou leaves the field. Delays the removal of the Illusion Form Delusion effect when switching to Reality Form with Soulcross. Counts all DMG dealt by Soulcross and it's enhanced version as Follow-up Attack DMG. Prevents Form switch if the skill is interrupted before it is complete.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Bloodfeast Reverie",
			description: [
				{
					description:
						"Press to cast the Ultimate when Ultimate Energy is full. Has 2 Ultimates: Inferno Flamenco and Bloodfeast Reverie.\nCasts Inferno Flamenco if Bloodfeast Reverie is inactive\nPrioritizes Bloodfeast Reverie if it is active. Counts DMG dealt by Bloodfeast Reverie as Follow-up Attack DMG and inflicts Vile Ash on enemies in a large area. Enables one enhanced Inferno Flamenco to be cast without consuming Ultimate Energy within a limited time after successfully casting Bloodfeast Reverie. Removes this cast opportunity when the time limit expires.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Stoked Flame",
			description: [
				{
					description:
						"Wields her blode to attack, dealing 1 instance of Incantaion DMG.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Silent Sunset",
			description: [
				{
					description:
						"<sh>Scorch Enhancement:</> Scorch can be stacked up to 3 times. For each DoT effect allies inflict on target afflicted with Scorch, Zankou inflicts 1 stack of Scorch on them, replacing the DMG, type, and duration of Existing Scorch on the target with those of the newly inflcited effect. Scorch inflicted by this effect cannot trigger it again.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Crimson Reverie",
			description: [
				{
					description:
						"Sets Sankou's Cycle Energy to 100 upon entering battle. Cooldown: 30s. Triggers only once per battle. Increases Zankou's Cycle Intensity by 100 while she is on the team.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Competitive Edge",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases all Volley Star Characters' Serve by <dn>10</>.",
				},
				{
					description:
						"<sh>Level 2:</> Increases Tycoon Incentive Fund earnings from Volley Star Weekly Matches by <dn>10%</>. (Up to the Tycoon Incentive Fund limit.)",
				},
				{
					description:
						"<sh>Level 3:</> Increases all Volley Star Characters' Spike by <dn>10</>.",
				},
				{
					description:
						"<sh>Level 4:</> Increases Tycoon Incentive Fund earnings from Volley Star Weekly Matches by <dn>10%</>. (Up to the Tycoon Incentive Fund limit.)",
				},
				{
					description:
						"<sh>Level 5:</> Increases all Volley Star Characters' Recieve by <dn>10</>.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "All In",
			description: [
				{
					description:
						"<sh>Level 1:</> Costs <dn>1</> additional City Stamina per Fight Club match to claim the corresponding rewards.",
				},
				{
					description:
						"<sh>Level 2:</> Costs <dn>1</> additional City Stamina per Fight Club match to claim the corresponding rewards.",
				},
			],
			maxLvl: 2,
		},
	},
}
