import { EnumRarity, EnumStatAttribute } from "@/data/items"
import { ascColdDessertSet, ascDelusionsSet } from "../items/materials"
import { Arc, EnumArcType } from "./arc"

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
