import { Character } from "@/types/character"

import { EnumRarity } from "@/data/items"
import {
	ascWhispersSet,
	confessionalFLowerSeed,
	dressSleevesOfVanity,
	talentBirdSet,
} from "@/data/items/materials"
import { EnumArcType } from "@/data/arcs"
import { EnumCharacterElement } from "@/data/characters"

export const hotori: Character = {
	id: "hotori",
	imageSrc: "hotori.webp",
	name: "Hotori",
	description: "The Boss of Eibon, who doesn't seem to be very sober.",
	rarity: EnumRarity.Epic,
	element: EnumCharacterElement.COSMOS,
	arcType: EnumArcType.Solid,
	ascensionMaterialSet: ascWhispersSet,
	ascensionBossMaterial: confessionalFLowerSeed,
	talentMaterialSet: talentBirdSet,
	talentBossMaterial: dressSleevesOfVanity,
	abilities: {
		basicAttack: {
			name: "Misty Moon Style",
			description: [
				{
					section: "Basic Attack: Misty Moon Style",
					description:
						"Wields her weapon and performs up to <dn>5</> consecutive attacks, dealing Cosmos DMG.",
				},
				{
					section: "Basic Attack: Non-Closed Timepiece",
					description:
						"Displays a Non-Closed Timepiece when Hotori is switched in. Rotates its pointer slowly clockwise over time, accumulating energy. Caps the energy the Non-Closed Timepiece can accumulate at 120.",
				},
				{
					section: "Basic Attack: Rippling Waves",
					description:
						"Hold Basic Attack in combat to trigger. Gracefully dashes forward and attacks, dealing <dn>4</> instances of Cosmos DMG to an area.",
				},
				{
					section: "Basic Attack: Crescent",
					description:
						"Wields the weapon mid-air and plunges, dealing <dn>1</> instance of Cosmos DMG to an area upon impact. Increases DMG based on fall height, up to 100%.",
				},
				{
					section: "Critical Riposte: Half Moment",
					description:
						"Triggers when using Misty Moon Style after a Critical Dodge. Raises the umbrella to counterattack opponents instantly, dealing <dn>1</> instance of Cosmos DMG and reducing Break.",
				},
			],
			maxLvl: 10,
		},
		skill: {
			name: "Present Replay",
			description: [
				{
					description:
						"Requires no cooldown for Present Replay.\nAllows Hotori to spend <dn>60</> Non-Closed Timepiece energy to cast Present Replay when energy is greater than <dn>60</>. Deals <dn>7</> instances of Cosmos DMG to an area. Records Support Skills and Redirect Skills used by allies for the next <dn>5</>s, appreciating up to <dn>3</> timings per use, with each character recorded at most once.\nRewinds the Non-Closed Timepiece pointer continuously during use. Stops recording after the pointer rewinds a certain amount, and continues rewinding a fixed amount if recording completes early. Clears records when entering or leaving battle. Overwrites existing records when using Present Replay again.",
				},
			],
			maxLvl: 10,
		},
		ultimate: {
			name: "World's Tide",
			description: [
				{
					description:
						"Has no cooldown or Ultimate Energy cost for World's Tide.\nAllows Hotori to unleash World's Tide when Non-Closed Timepiece energy is fully charged, dealing <dn>10</> instances of Cosmos DMG to an area. Draws a katana from the umbrella handle and changes attack mode. Slows surrounding time to near standstill for a period, disabling character switching. Cleanses any received time control debuffs and grants immunity to time control debuffs during Time Stop. Replays all attacks recorded by Present Replay <dn>1</> time and clears the records if any exist.\nRewinds the Non-Closed Timepiece pointer continuously during Time Stop. Builds combo stacks with Hotori's katana attacks, increasing damage per hit. Deals Finisher DMG when combo stacks reach <dn>10</>. Ends time stop when the pointer rewinds completely or when Finisher DMG is dealt.",
				},
			],
			maxLvl: 10,
		},
		support: {
			name: "Shopkeeper's Authority",
			description: [
				{
					description:
						"Time to teach these rude guests some manners. Throws the umbrella, dealing <dn>1</> instance of Cosmos DMG to an area.",
				},
			],
			maxLvl: 10,
		},
		passive1: {
			name: "Ghost Orchid Crest",
			description: [
				{
					description:
						"<sh>Blossom Enhancement:</> Prevents Vita Bud attacks from pausing during Time Stop.",
				},
			],
			maxLvl: 1,
		},
		passive2: {
			name: "All Treasures Under Heaven",
			description: [
				{
					description:
						"Increases World's Tide's Finisher DMG Ratio by <dn>100%</>.",
				},
			],
			maxLvl: 1,
		},
		lifeSkill1: {
			name: "Treasure Hunt",
			description: [
				{
					description:
						"<sh>Level 1:</> Increases auction items by <dn>1</> extra per auction.",
				},
				{
					description:
						"<sh>Level 2:</> Grants <dn>1</> additional attempt to refresh unpurchased auction items per auction.",
				},
				{
					description:
						"<sh>Level 3:</> Increases auction items by <dn>2</> extra per auction.",
				},
				{
					description:
						"<sh>Level 4:</> Sets the number of attempts to refresh unpurchased auction items to <dn>2</>.",
				},
				{
					description:
						"<sh>Level 5:</> Increases auction items by <dn>3</> extra per auction.",
				},
			],
			maxLvl: 5,
		},
	},
}
