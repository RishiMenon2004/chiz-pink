import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascNumeralSet,
	chargingKnightSparkPlug,
	goodBoyStamp,
	talentMagicSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const sakiri: Character = {
	id: "sakiri",
	imageSrc: "sakiri.png",
	name: "Sakiri",
	description: "Unrivaled at Eibon and as scary as she looks.Basic Attack: ",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.INCANTATION,
	arcType: EnumArcType.Condensate,
	ascensionMaterialSet: ascNumeralSet,
	ascensionBossMaterial: chargingKnightSparkPlug,
	talentMaterialSet: talentMagicSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Kiroumaru Headbutt",
			description: [
				{
					section: "Basic Attack: Ram",
					description:
						"Sakiri swings Kiroumaru and performs up to <dn>5</> consecutive attacks, dealing Incantation DMG.",
				},
				{
					section: "Basic Attack: Eating Mode",
					description:
						"Hold to activate Eating Mode with Kiroumaru. Mounts Sakiri onto Kiroumaru, allowing movement.\nOpens its mouth to continuously pull nearby targets within a cone while Hungry. Destroys movable objects in the scene and devours weak enemies.\nTakes <dn>180</>s to digest each devoured enemy, with only <dn>1</> target digested at a time.\nBecomes Full when the number of enemies being digested reaches the limit, remaining movable but unable to pull or devour enemies.\nRelease to exit the mode.",
				},
				{
					section: "Basic Attack: Swallow",
					description:
						"Wields Kiroumaru in the air and plunges, dealing <dn>1</> instance of Incantation DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Mischief",
					description:
						"Triggers when using Ram after a Critical Dodge. Leaps high into the air and strikes down hard with Kiroumaru against enemies left vulnerable by their missed attacks. Deals 1 instance of Incantation DMG to an area and reduces Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Devour Whole",
			description: [
				{
					section: "Redirect Skill: Burp",
					description:
						"Press to activate. Kiroumaru opens its mouth, pulling in nearby enemies. Kiroumaru then inflates and knocks down the enemy.",
				},
				{
					section: "Redirect Skill: Gravity Eater",
					description:
						"Hold to activate. Kiroumaru opens its mouth, pulling in nearby enemies. Kiroumaru then bites through the ground, devouring the gravity in that area, levitating enemies there (not effective against Boss).",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Feast of Gluttony",
			description: [
				{
					description:
						"No escaping this time! Kiroumaru spits out a large amount of Gravity Slurry from above, dealing <dn>6</> instances of Incantation DMG to an area. Applies strong gravity to hit enemies, pressing them heavily to the ground (not effective against Bosses). Prevents Suppressed enemies from moving for a period. Increases Team ATK (excluding Sakiri) based on Sakiri's Base ATK.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Squash!",
			description: [
				{
					description:
						"Let's see which unlucky soul is about to get squashed? Sakiri slams the enlarged Kiroumaru heavily onto the target, dealing <dn>1</> instance of Incantation DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Can I Eat This?",
			description: [
				{
					description:
						"<sh>Scorch Enhancement:</> Increases DoT taken by the target by 25% for each type of DoT effect while in Scorch state, up to 100%.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Impish Trick",
			description: [
				{
					description:
						"Reduces enemies' DEF by 10% for 20s after inflicting Airborne or Suppress.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "No Work, No Reward",
			description: [
				{
					description:
						"<sh>Level 1:</> Sakiri increases dish prices by an additional <dn>0.12</> Fons.",
				},
				{
					description:
						"<sh>Level 2:</> Sakiri reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, Kiroumaru actively attacks and drives away Danzaburou.",
				},
				{
					description:
						"<sh>Level 4:</> Sakiri reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Sakiri increases dish prices by <dn>0.3</> Fons when a dish contains 3 identical tags.",
				},
			],
			maxLvl: 5,
		},
	},
}
