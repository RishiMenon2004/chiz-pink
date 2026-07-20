import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascWhispersSet,
	chargingKnightSparkPlug,
	goodBoyStamp,
	talentBirdSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const zero: Character = {
	id: "zero",
	imageSrc: "zero_f.png",
	name: "Esper Zero",
	description:
		"The only esper in history without a detectable Wertheimer Index.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: chargingKnightSparkPlug,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: goodBoyStamp,
	abilities: {
		basicAttack: {
			name: "Appraisal",
			description: [
				{
					section: "Basic Attack: Appraisal - Severance",
					description:
						"Channels energy through the weapon, performing up to <dn>5</> consecutive attacks that deal Cosmos DMG.",
				},
				{
					section: "Basic Attack: Appraisal - Break",
					description:
						"Wields the weapon mid-air and plunges, dealing <dn>1</> instance of Cosmos DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Appraise and Engrave",
			description: [
				{
					description:
						"Opening, exposed! Performs <dn>3</> consecutive weapon strikes. Leaps into the air to charge. Fires an Esper Cannon that deals <dn>1</> instance of Cosmos DMG to an area. Deals an additional <dn>1</> instance of Cosmos DMG to the first enemy hit whose level is below Zero's own level.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "Divide by Zero",
			description: [
				{
					description:
						"Sweeps away the unseen lines that connect the Nexus in a dance of blades. Deals multiple instances of Cosmos DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Rift Blossom",
			description: [
				{
					description:
						"Slashes through space and detonates a rift, dealing <dn>2</> instances of Cosmos DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Appraiser",
			description: [
				{
					description:
						"<sh>Charge Enhancement:</> Restores HP equal to 50% of Zero's Base ATK when the active character gains Ultimate Energy.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "Anomaly Perception",
			description: [
				{
					description:
						"Ultimate: Divide by Zero damage increases by <dn>25%</>.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Five-Star Paragon",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases Affection gained from Gifts by <dn>5%</> when Bond Level is <dn>4</> or below.",
				},
				{
					description:
						"<sh>Level 2:</> Increases Affection gained from Gifts by <dn>5%</> when Bond Level is <dn>5</> or below.",
				},
				{
					description:
						"<sh>Level 3:</> Increases Affection gained from Gifts by <dn>5%</> when Bond Level is <dn>6</> or below.",
				},
				{
					description:
						"<sh>Level 4:</> Increases Affection gained from Gifts by <dn>5%</> when Bond Level is <dn>7</> or below.",
				},
				{
					description:
						"<sh>Level 5:</> Increases Affection gained from Gifts by <dn>5%</> when Bond Level is <dn>8</> or below.",
				},
			],
			maxLvl: 5,
		},
	},
}
