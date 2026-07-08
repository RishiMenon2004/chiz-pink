import type { Arc } from "@/types/weapon"

import { EnumRarity, EnumStatAttribute } from "@/data/items"
import {
	ascAppleSeedSet,
	ascColdDessertSet,
	ascDelusionsSet,
	ascDramaCoreSet,
	ascSilhouetteSet,
	ascWhispersSet,
} from "@/data/items/materials"

import { EnumArcType } from "./arc"

const allArcs: Record<string, Arc> = {
	the_wrong_gate: {
		id: "the_wrong_gate",
		name: "The Wrong Gate",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 12,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "the_wrong_gate.png",
	},

	blushing_mirage: {
		id: "blushing_mirage",
		name: "Blushing Mirage",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 9.6,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "blushing_mirage.png",
	},

	whats_desired: {
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
		imageSrc: "whats_desired.png",
	},

	the_last_rose: {
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
		imageSrc: "the_last_rose.png",
	},

	marching_beyond_time: {
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
		imageSrc: "marching_beyond_time.png",
	},
}

export function getAllArcs() {
	return allArcs
}

export function getAllArcsAsArray() {
	return Object.values(allArcs)
}

export function findArc(arcId: string) {
	return allArcs[arcId]
}
