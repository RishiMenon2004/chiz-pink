import { Character } from "@/types/character"

import { EnumRarity } from "../items"
import {
	ascWhispersSet,
	chargingKnightSparkPlug,
	dressSleevesOfVanity,
	talentBirdSet,
} from "../items/materials"
import { EnumArcType } from "../arcs"
import { EnumCharacterElement } from "./character"

export const shinku: Character = {
	id: "shinku",
	imageSrc: "shinku.png",
	name: "Shinku",
	description:
		"A cold, distant type who's used to keeping people at arm's length.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Condensate,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: chargingKnightSparkPlug,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "Special Combat Arts",
			description: [
				{
					section: "Basic Attack: Special Combat Arts",
					description:
						"Performs up to <dn>5</> consecutive attacks, dealing Cosmos DMG. Grants Defiant Spirit on hit.",
				},
				{
					section: "Basic Attack: Arrowfall",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of Cosmos DMG upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Basic Attack: Special Combat Arts (Altered)",
					description:
						"Hold Basic Attack during the 3rd/4th/5th hit of Special Combat Arts to trigger Special Combat Arts (Altered), dealing Cosmos DMG and granting Defiant Spirit on hit.",
				},
				{
					section: "Critical Riposte: Split-Second Victory",
					description:
						"Triggers when using Special Combat Arts after a Critical Dodge. Retaliates against the target with a sharp kick, dealing <dn>1</> instance of Cosmos DMG, reducing their Break, and gaining Defiant Spirit.",
				},
				{
					section: "Basic Attack: Tidal Assault",
					description:
						"Performs up to <dn>5</> consecutive attacks, dealing Cosmos DMG. Grants Fading Reason on hit.",
				},
				{
					section: "Basic Attack: Hammerfall",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of Cosmos DMG upon impact. Increases DMG based on fall height, up to 100%. Grants Fading Reason on hit.",
				},
				{
					section: "Basic Attack: Tidal Assault (Scorn)",
					description:
						"Hold Basic Attack during the 3rd/4th/5th hit of Tidal Assault to trigger Tidal Assault (Scorn), dealing <dn>1</> instance of Cosmos DMG and granting Fading Reason on hit.",
				},
				{
					section: "Critical Riposte: No Respite",
					description:
						"Triggers when using Tidal Assault after a Critical Dodge. Retaliates against the target with a sharp kick, dealing <dn>1</> instance of Cosmos DMG, reducing the target's Break, and gaining Fading Reason.\nInflicts Forced Knockback and briefly stuns (not effective against Bosses) the target when Parry Attack or Critical Riposte hits while in the Menacing Gaze state, then deals 1 additional instance of DMG to the target equal to <dn>20%</> of Instant Strike.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "High-Speed Breach",
			description: [
				{
					section: "Redirect Skill: High-Speed Breach",
					description:
						"No time to catch your breath. Charges toward the target and launches a fierce assault, dealing multiple instances of Cosmos DMG and gaining Defiant Spirit.",
				},
				{
					section: "Redirect Skill: Scarlet Descent",
					description:
						"Consumes all Fading Reason. Leaps above the target into their blind spot and unleashes a powerful downward claw strike, dealing high Cosmos DMG. Casts up to <dn>5</> times during each Surging Crimson state.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Special Combat Arts",
			description: [
				{
					section: "Ultimate: Crimson Fury",
					description:
						"Don't think you can pull something like that and escape unscathed… Consumes all Defiant Spirit to enter the Surging Crimson state, then launches multiple attacks, dealing high Cosmos DMG to the target.\nReplaces Special Combat Arts with Tidal Assault and High-Speed Breach with Scarlet Descent while in Surging Crimson state. Increases DMG dealt and Resistance to Interruptions, greatly boosts Movement, and lasts for <dn>13</>s. Ends Surging Crimson when switching characters.\nHold Dodge while moving to partially release her Esper Ability and greatly boost Movement.",
				},
				{
					section: "Ultimate: Crimson Judgment",
					description:
						"Casts Crimson Judgment when Surging Crimson is about to end. Press Ultimate repeatedly to dash rapidly between targets, dealing high Cosmos DMG.\nGrants <dn>1</> additional instance of Crimson Judgment for each use of Scarlet Descent during Surging Crimson. Can be cast up to <dn>3</> times during each Surging Crimson state.",
				},
				{
					section: "Ultimate: Dragonflame Verdict",
					description:
						"Press Ultimate again to cast Dragonflame Verdict after all uses of Crimson Judgment have been consumed or after Surging Crimson ends, dealing massive Cosmos DMG to targets in a large area.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Breaching Tactics",
			description: [
				{
					description:
						"Enough already! Delivers a forceful knee strike, dealing 1 instance of Cosmos DMG and gaining Defiant Spirit.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Lone Stride",
			description: [
				{
					description:
						"<sh>Charge Enhancement:</> Grants off-field characters the same amount of Charge when the active character gains Ultimate Energy. While Shinku is active and in Charge state, each trigger deals AoE DMG equal to <dn>400%</> of ATK (scales with Basic Attack level, reaching <dn>863.6%</> at level 11), and increases her ATK by <dn>5%</> for <dn>30</>s, up to 10 stacks. Cooldown: <dn>1</>s.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Wrathscale",
			description: [
				{
					description:
						"Increases Ultimate DMG against non-Boss enemies by <dn>50%</>.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Sneaking a Break",
			description: [
				{
					description:
						"<sh>Level 1:</> Shinku increases dish prices by <dn>0.3</> Fons for every 3 Beverage Tags on dishes.",
				},
				{
					description:
						"<sh>Level 2:</> Shinku reduces Ingredient Consumption Rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> Shinku increases dish prices by <dn>0.3</> Fons for every 3 Beverage Tags on dishes.",
				},
				{
					description:
						"<sh>Level 4:</> Shinku reduces Ingredient Consumption Rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Shinku increases dish prices by <dn>3%</> for every 3 Beverage Tags on dishes.",
				},
			],
			maxLvl: 5,
		},
		lifeSkill2: {
			name: "Always Up for a Challenge",
			description: [
				{
					description:
						"<sh>Level 1:</> Spend an additional <dn>2</> City Stamina in Little Sparrow: Mahjong Inferno mode, or an additional <dn>6</> City Stamina in Little Sparrow: Riichi Mahjong mode, and receive corresponding rewards for spending more Stamina.",
				},
				{
					description:
						"<sh>Level 2:</> Spend an additional <dn>1</> City Stamina in Little Sparrow: Mahjong Inferno mode, or an additional <dn>3</> City Stamina in Little Sparrow: Riichi Mahjong mode, and receive corresponding rewards for spending more Stamina.",
				},
			],
			maxLvl: 2,
		},
	},
}
