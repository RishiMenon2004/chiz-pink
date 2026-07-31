import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	aPageFromDelusionsShore,
	ascSilhouetteSet,
	goodBoyStamp,
	talentHeartSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const mint: Character = {
	id: "mint",
	imageSrc: "mint.webp",
	name: "Mint",
	description:
		"If there was such a ranking, I'd probably hold the record for \"Most Times Tricked by Anomalies\" in the Containment Units…",
	rarity: EnumRarity.Rare,
	element: EnumCharacterElement.ANIMA,
	arcType: EnumArcType.Liquid,
	ascensionMaterialSet: ascSilhouetteSet,
	ascensionBossMaterial: aPageFromDelusionsShore,
	talentMaterialSet: talentHeartSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Perfect Containment",
			description: [
				{
					section: "Basic Attack: Perfect Containment",
					description:
						"Wields her weapon and performs up to <dn>5</> consecutive attacks, dealing Anima DMG.",
				},
				{
					section: "Basic Attack: Justice from Above",
					description:
						"Wields her weapon in the air and plunges, dealing <dn>1</> instance of Anima DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Caramel Crisp",
					description:
						"Triggers when using Perfect Containment after a Critical Dodge. Leaps up to dodge an attack, seizes the enemy's opening, and swiftly swings her weapon, dealing 1 instance of Anima DMG to an area and reducing Break.",
				},
				{
					section: "Basic Attack: Justice from Above",
					description:
						"Hold Basic Attack to make Mint dance and spin, forming a tornado that continuously drains Stamina and deals continuous Anima DMG to surrounding enemies.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Ultimate: Super Claws",
			description: [
				{
					description:
						"Time to cool things down! Dashes forward, then returns to her original position, dealing <dn>2</> instances of AoE Anima DMG to enemies along the path.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Ultimate: Thunderous Whirlwind Slash",
			description: [
				{
					description:
						"Are you ready! Channels the surrounding wind into her dual blades, transforming them into wind blades that deal multiple instances of Anima DMG to an area. Lands with a final hit that deals massive Anima DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Ultimate: Invincible Tornado Slash",
			description: [
				{
					description:
						"Perfect finishing work from an elite member! Charges and leaps into the air, performing a penetrating attack on enemies, dealing <dn>1</> instance of Anima DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Transform! Super Mint!",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Expands Vita Pistils' damage area on hit.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Bingo! We're Done Here!",
			description: [
				{
					description:
						"While Mint is on the field, her DEF is increased by <dn>20%</> and her resistance to Interruptions is increased by <dn>30%</>.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Mint Tornado",
			description: [
				{
					description:
						"<sh>Level 1:</> Mint increases dish prices by an additional <dn>0.12</> Fons.",
				},
				{
					description:
						"<sh>Level 2:</> Mint reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 3:</> In Owner's Selection, tips increase with each combo. Up to <dn>5</> times per combo.",
				},
				{
					description:
						"<sh>Level 4:</> Mint reduces ingredient consumption rate by <dn>1%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Mint increases dish prices by an additional <dn>0.18</> Fons.",
				},
			],
			maxLvl: 5,
		},
	},
}
