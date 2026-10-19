import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascSilhouetteSet,
	dressSleevesOfVanity,
	talentRoseSet,
	tearOfTheSea,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "./character"

export const jiuyuan: Character = {
	id: "jiuyuan",
	imageSrc: "jiuyuan.webp",
	name: "Jiuyuan",
	description: "A smooth-talking and enigmatic Elite Courier of Sterry who also serves as Acting Manager.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.ANIMA,
	arcType: EnumArcType.Solid,
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
						"Dual-wields to perform up to <dn>5</> consecutive attacks, dealing <el>Anima DMG</>. Grants <dn>2</> <kw>Rose Pact Bullets</>. Establishes a <kw>Lethal Rose Pact</> with the target when the final hit strikes.",
				},
				{
					section: "Basic Attack: Bird's Eye View",
					description:
						"Wields her weapon while airborne and plunges, dealing <dn>1</> instance of <el>Anima DMG</> to an area upon impact. Increases DMG based on fall height, up to <dn>100%</>.",
				},
				{
					section: "Basic Attack: Info-Guided Arts",
					description:
						"Hold Basic Attack to trigger. Auto-targets and fires a bullet, dealing <dn>1</> instance of <el>Anima DMG</>. Consumes <kw>Rose Pact Bullets</> for continuous fire and prioritizes targets with <kw>Lethal Rose Pact</> when <kw>Rose Pact Bullets</> are available.",
				},
				{
					section: "Basic Attack: Opportunity Lock-On",
					description:
						"Press Aim to enter Aim mode. Fires a bullet that deals <dn>1</> instance of <el>Anima DMG</> to the enemy in the crosshair.",
				},
				{
					section: "Critical Riposte: Turning the Tide",
					description: "Triggers when using When Secrets Take Shape after a Critical Dodge. Swings both arms and fires in a cross pattern at targets in front, binding them with <kw>Lethal Rose Pact</> while dealing <dn>1</> instance of <el>Anima DMG</>, reducing Break, and granting <dn>2</> <kw>Rose Pact Bullets</>."
				}
			],
			maxLvl: 10,
		},
		skill: {
			name: "Intel Hunter",
			description: [
				{
					description:
						"Dashes across the battlefield, pulling the target into the range of control and attacking. Deals multiple instances of <el>Anima DMG</> and grants <dn>4</> <kw>Rose Pact Bullets</> while establishing a <kw>Lethal Rose Pact</>.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Final Reckoning",
			description: [
				{
					description:
						"Dashes across the battlefield at high speed, continuously firing on surrounding targets before ending with a large-scale explosion, dealing <el>Anima DMG</>.\nTriggers Final Reckoning, causing all <kw>Lethal Rose Pact</> targets within range to enter a stage where <kw>Pact Settlement</> can be triggered, executing all settlements simultaneously on the final hit.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Intel Lock-On",
			description: [
				{
					description:
						"Fires a curved bullet, dealing <dn>1</> instance of <el>Anima DMG</> and granting <dn>2</> <kw>Rose Pact Bullets</> upon hit.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Seize the Moment",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Spawns <dn>1</> additional Vita Bud and increases Vita Bud limit on field to <dn>6</>.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Whispers at My Command",
			description: [
				{
					description:
						"Binds targets not affected by <kw>Fatal Rose Pact</> when Vita Pistils hit them. Triggers an additional settlement on targets already bound, causing them to take an extra <dn>15%</> × <el>Anima DMG</>.",
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
