import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascSilhouetteSet,
	dressSleevesOfVanity,
	talentRoseSet,
	tearOfTheSea,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const jiuyuan: Character = {
	id: "jiuyuan",
	imageSrc: "jiuyuan.webp",
	name: "Jiuyuan",
	description: "A smooth-talking and enigmatic Elite Courier of Sterry who also serves as Acting Manager.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.ANIMA,
	arcType: EnumArcType.Plasma,
	ascensionMaterialSet: ascSilhouetteSet,
	ascensionBossMaterial: tearOfTheSea,
	talentMaterialSet: talentRoseSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "When Secrets Take Shape",
			description: [
				{
					section: "Basic Attack: When Secrets Take Shape",
					description:
						"Dual-wields to perform up to <dn>5</> consecutive attacks, dealing Anima DMG. Grants <dn>2</> Rose Pact Bullets. Establishes a Lethal Rose Pact with the target when the final hit strikes.",
				},
				{
					section: "Basic Attack: Bird's Eye View",
					description:
						"Wields her weapon while airborne and plunges, dealing <dn>1</> instance of Anima DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Basic Attack: Info-Guided Arts",
					description:
						"Hold Basic Attack to trigger. Auto-targets and fires a bullet, dealing <dn>1</> instance of Anima DMG. Consumes Rose Pact Bullets for continuous fire and prioritizes targets with Lethal Rose Pact when Rose Pact Bullets are available.",
				},
				{
					section: "Basic Attack: Opportunity Lock-On",
					description:
						"Press Aim to enter Aim mode. Fires a bullet that deals <dn>1</> instance of Anima DMG to the enemy in the crosshair.",
				},
				{
					section: "Critcal Riposte: Turning the Tide",
					description: "Triggers when using When Secrets Take Shape after a Critical Dodge. Swings both arms and fires in a cross pattern at targets in front, binding them with Lethal Rose Pact while dealing 1 instance of Anima DMG, reducing Break, and granting <dn>2</> Rose Pact Bullets."
				}
			],
			maxLvl: 10,
		},
		skill: {
			name: "Intel Hunter",
			description: [
				{
					description:
						"Dashes across the battlefield, pulling the target into the range of control and attacking. Deals multiple instances of Anima DMG and grants <dn>4</> Rose Pact Bullets while establishing a Lethal Rose Pact.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Final Reckoning",
			description: [
				{
					description:
						"Dashes across the battlefield at high speed, continuously firing on surrounding targets before ending with a large-scale explosion, dealing Anima DMG.\nTriggers Final Reckoning, causing all Lethal Rose Pact targets within range to enter a stage where Pact Settlement can be triggered, executing all settlements simultaneously on the final hit.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Intel Lock-On",
			description: [
				{
					description:
						"Fires a curved bullet, dealing <dn>1</> instance of Anima DMG and granting <dn>2</> Rose Pact Bullets upon hit.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Seize the Moment",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Spawns 1 additional Vita Bud and increases Vita Bud limit on field to 6.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Whispers at My Command",
			description: [
				{
					description:
						"Binds targets not affected by Fatal Rose Pact when Vita Pistils hit them. Triggers an additional settlement on targets already bound, causing them to take an extra <dn>15%</> × Anima DMG.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Dealership VIP",
			description: [
				{
					description:
						"<sh>Level 1:</> Reduces vehicle durability loss when damaged by <dn>3%</>.",
				},
				{
					description:
						"<sh>Level 2:</> Reduces Rampage Players vehicle modification labor fees by <dn>10%</>.",
				},
				{
					description:
						"<sh>Level 3:</> Reduces vehicle durability loss when damaged by <dn>3%</>.",
				},
				{
					description:
						"<sh>Level 4:</> Reduces Rampage Players vehicle modification labor fees by <dn>10%</>.",
				},
				{
					description:
						"<sh>Level 5:</> Reduces vehicle durability loss when damaged by <dn>4%</>.",
				},
			],
			maxLvl: 5,
		},
	},
}
