import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascNumeralSet,
	dressSleevesOfVanity,
	nestGuardFragment,
	talentTarotSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const haniel: Character = {
	id: "haniel",
	imageSrc: "haniel.png",
	name: "Haniel",
	description:
		"My dream is to become a beautiful high school girl who saves the world!",
	rarity: EnumRarity.Rare,
	element: EnumCharacterElement.PSYCHE,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascNumeralSet,
	ascensionBossMaterial: nestGuardFragment,
	talentMaterialSet: talentTarotSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "Genesse Technique",
			description: [
				{
					section: "Basic Attack: Genesse Technique",
					description:
						"Fires magic projectiles and performs up to <dn>5</> consecutive attacks, dealing Psyche DMG.",
				},
				{
					section: "Basic Attack: Paranormal Cannon",
					description:
						"Hold Basic Attack during the 1st hit to charge, then fire a charged cannon forward.",
				},
				{
					section: "Basic Attack: Paranormal Entrance",
					description:
						"Press Basic Attack while airborne to plunge, dealing <dn>1</> instance of Psyche DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Ace Sweep",
					description:
						"Triggers when using Genesse Technique after a Critical Dodge. Being this slow will get us customer complaints, you know? Dodges the attack and fires a missile, dealing <dn>1</> instance of Psyche DMG, and reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Silent Moonlit Forest Guardian",
			description: [
				{
					description:
						"\"O owl of the quiet, moonlit forest depths, answer my call!\" Throws her portable speaker Hootie, dealing Psyche DMG to an area.\nGrants the Team an ATK bonus based on Haniel's Base ATK while Hootie is active.\nGrants Hootie <dn>1</> stack of Four-Part Harmony when the current character attacks, up to <dn>1</> stack every <dn>0.5</>s. Accumulating <dn>4</> stacks of Four-Part Harmony triggers Ensemble, dealing Psyche DMG to enemies in an area around Hootie.\nOnly <dn>1</> Hootie can exist at a time. Casting again refreshes Hootie's duration. Hootie remains when switching characters.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "A Melody Named Haniel",
			description: [
				{
					description:
						"Genesse Girls' Academy Paranormal Department! Assuming control! Releases an enhancement field centered on herself and gaining the Paranormal Ace effect for a period of time.\nGrants the Team an ATK bonus based on Haniel's Base ATK.\nTriggering Ensemble simultaneously triggers 1 additional Ensemble - Symphony effect around the character with increased DMG and range. Ensemble - Symphony does not grant Plot Armor for Haniel. When triggering Ensemble, the current active character's next attack deals additional damage for <dn>3</>s. Effect does not stack.\nWhile Paranormal Ace is active, Hootie's duration timer is paused until the end of the effect.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Easter Egg Time",
			description: [
				{
					description:
						"Don't be so boring! How about a little easter egg? Fires <dn>1</> magic projectile at the enemy, dealing <dn>1</> instance of Psyche DMG.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "It's Friendship!",
			description: [
				{
					description:
						"<sh>Nova Enhancement:</> Allows all allies to drain ATK from the target when Nova ends. The target loses ATK equal to 4% of Haniel's Base ATK, and each ally gains ATK equal to 8% of Haniel's Base ATK. The total drain is capped at 16% of Haniel's Base ATK, and the target cannot lose more than 20% of their initial ATK. Restores both parties' stats upon exiting combat.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "It's Bond!",
			description: [
				{
					description:
						"Grants Haniel <dn>1</> stack of Plot Armor when the current character triggers Ensemble, increasing the ricochet cap of Paranormal Cannon. Grants <dn>1</> stack of Plot Armor per Ensemble trigger.\nGrants <dn>2</> stacks of Plot Armor per Ensemble trigger while Haniel is in Paranormal Ace state.\nCan accumulate up to <dn>4</> stacks of Plot Armor.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "A Pro on the Job",
			description: [
				{
					description:
						"<sh>Level 1:</> Haniel increases dish prices by an additional <dn>0.12</> Fons.",
				},
				{
					description:
						"<sh>Level 2:</> Haniel reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> Haniel increases dish prices by an additional <dn>0.12</> Fons.",
				},
				{
					description:
						"<sh>Level 4:</> Haniel reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Haniel increases dish prices by an additional <dn>0.18</> Fons.",
				},
			],
			maxLvl: 5,
		},
	},
}
