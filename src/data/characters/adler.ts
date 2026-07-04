import { EnumRarity } from "@/data/items"
import { Character, EnumCharacterElement } from "@/data/characters"
import { EnumArcType } from "@/data/arcs"
import {
	ascNumeralSet,
	dressSleevesOfVanity,
	talentMagicSet,
	waterMoonPick,
} from "@/data/items/materials"

export const adler: Character = {
	id: "adler",
	name: "Adler",
	description:
		"The perfect butler who brings peace of mind to everyone at Eibon and the neighborhood.",
	rarity: EnumRarity.Rare,
	element: EnumCharacterElement.Incantation,
	arcType: EnumArcType.Condensate,
	abilities: {
		basicAttack: {
			name: "Deliverance",
			description: [
				{
					section: "Basic Attack: Deliverance",
					description: [
						"Wields his weapon and performs up to 5 consecutive attacks, dealing Incantation DMG.",
					],
				},
				{
					section: "Basic Attack: Liberation",
					description: [
						"Enters aim mode, dealing 1 instance of single-target Incantation DMG to the enemy in the crosshair.",
					],
				},
				{
					section: "Basic Attack: Ignorance",
					description: [
						"Plunges, dealing 1 instance of Incantation DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
					],
				},
				{
					section: "Critical Reposte: Revelation",
					description: [
						"Triggers when casting Deliverance after a Critical Dodge. Dodges an attack with a quick dash, seizes the enemy's opening and swiftly swings his weapon, dealing 1 instance of Incantation DMG to an area, reducing their Break.",
					],
				},
				{
					section: "Karma",
					description: [
						"Triggers when casting Deliverance after a Critical Dodge. Dodges an attack with a quick dash, seizes the enemy's opening and swiftly swings his weapon, dealing 1 instance of Incantation DMG to an area, reducing their Break.",
						"Grants Adler 2 stacks of Karma when Liberation hits an enemy.",
						"Max Karma stacks: 20.",
					],
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Evil's Bane",
			description: [
				{
					description: [
						"Need help? Summons Sunya phantoms to strike enemies, dealing 1 instance of Incantation DMG to an area, then inflicting Incantation DMG over time on enemies and granting active characters a shield with Blessing.",
						"Consumes all stacks of Karma on skill cast. Each stack consumed grants Adler 2% Skill DMG.",
					],
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Tranquility",
			description: [
				{
					description: [
						"I wish not fight if possible. Summons Rupa, Vedana, Sanna, Vinnana, and Sankhara, 5 Sunyas in total, to strike all enemy targets. Each target takes 5 instances of Incantation DMG. When only a single enemy remains on the field, Sunyas will perform a second strike, dealing a total of 10 instances of Incantation DMG.",
					],
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Pristine Reflection",
			description: [
				{
					description: [
						"This fight shall not be prolonged any longer. Aims and fires 1 Compressed Round at the enemy, dealing 1 instance of Incantation DMG to an area on hit.",
					],
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Temperance",
			description: [
				{
					smallHeading: "Scorch Enhancement:",
					description: [
						"Applies one of three random debuffs whenever Scorch is inflicted on a target: -20% ATK, -10% Esper Resistance, or +10% Break Efficiency, lasting for 15s. The same effect cannot stack.",
					],
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Righteous Heart",
			description: [{ description: ["Adler DEF +20%"] }],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Coffee Master",
			description: [
				{
					smallHeading: "Level 1:",
					description: [
						"Adler increases dish prices by an additional 0.12 Fons.",
					],
				},
				{
					smallHeading: "Level 2:",
					description: [
						"Adler reduces ingredient consumption rate by 1%.",
					],
				},
				{
					smallHeading: "Level 3:",
					description: [
						"In Owner's Selection, coffee is automatically prepared.",
					],
				},
				{
					smallHeading: "Level 4:",
					description: [
						"Adler reduces ingredient consumption rate by 1%.",
					],
				},
				{
					smallHeading: "Level 5:",
					description: [
						"Adler increases dish prices by an additional 0.18 Fons.",
					],
				},
			],
			maxLvl: 5,
		},
	},
	ascensionMaterialSet: ascNumeralSet,
	ascensionBossMaterial: waterMoonPick,
	talentMaterialSet: talentMagicSet,
	talentBossMaterial: dressSleevesOfVanity,
	imageSrc: "adler.png",
}
