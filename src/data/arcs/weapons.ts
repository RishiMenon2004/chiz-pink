import type { Arc } from "@/types/weapon"

import { EnumRarity, EnumStatAttribute } from "@/data/items"
import {
	ascAppleSeedSet,
	ascColdDessertSet,
	ascDelusionsSet,
	ascDramaCoreSet,
	ascWhispersSet,
} from "@/data/items/materials"

import { EnumArcType } from "./arc"

export const whatsDesired: Arc = {
	id: "whats_desired",
	name: "What's Desired",
	rarity: EnumRarity.Epic,
	type: EnumArcType.Condensate,
	baseAtk: 37,
	mainAttribute: {
		attribute: EnumStatAttribute.CritRate,
		baseValue: 9.6,
	},
	ascensionMaterial1: ascColdDessertSet,
	ascensionMaterial2: ascDelusionsSet,
	effect: {
		name: "Golden Fleece",
		description:
			"Increases the wearer's Lakshana DMG by 20.00%. Increases the wearer's CRIT DMG by 40.00% for 20s when they cast a Redirect Skill or Ultimate. Resets the duration when triggered again.",
	},
	imageSrc: "whats_desired.png",
}

export const theLastRose: Arc = {
	id: "the_last_rose",
	name: "The Last Rose",
	rarity: EnumRarity.Epic,
	type: EnumArcType.Liquid,
	baseAtk: 37,
	mainAttribute: {
		attribute: EnumStatAttribute.CritRate,
		baseValue: 9.6,
	},
	ascensionMaterial1: ascAppleSeedSet,
	ascensionMaterial2: ascWhispersSet,
	effect: {
		name: "Bohemian Rose",
		description:
			"Increases ATK by 14.00%. Grants 1 stack of Chaos Thorn each time the wearer deals DoT. Increases CRIT DMG by 6.00% per stack for 3s. Triggers at most once every 0.3s, up to 10 stacks, and refreshes the duration when retriggered. Grants 10 stacks of Chaos Thorn immediately when the wearer casts a Redirect Skill.",
	},
	imageSrc: "the_last_rose.png",
}

export const marchingBeyondTime: Arc = {
	id: "marching_beyond_time",
	name: "Marching Beyond Time",
	rarity: EnumRarity.Epic,
	type: EnumArcType.Solid,
	baseAtk: 37,
	mainAttribute: {
		attribute: EnumStatAttribute.CritRate,
		baseValue: 9.6,
	},
	ascensionMaterial1: ascDramaCoreSet,
	ascensionMaterial2: ascWhispersSet,
	effect: {
		name: "Time Beyond Time",
		description:
			"Increases ATK by 16.00%. Enters Wastelab and clears current Wastetime when the wearer casts a Redirect Skill. While in Wastelab, allies gain 24% stack of Wastetime each time they use a Redirect or Support Skill, up to 8% stacks. When the wearer uses their Ultimate in Wastelab, they exit Wastelab and consume all Wastetime, increasing Ultimate Crit DMG by 12%, plus an additional 3 per Wastetime consumed. Consuming 3 Wastetime stacks at once grants an extra 12% DEF Ignore for 3s.",
	},
	imageSrc: "marching_beyond_time.png",
}
