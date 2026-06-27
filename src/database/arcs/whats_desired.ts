import { EnumRarity, EnumStatAttribute } from "@/database/item"
import { ascColdDessertSet, ascDelusionsSet } from "../materials"
import { Arc, EnumArcType } from "./arc"

export const whatsDesired: Arc = {
	id: "whats_desired",
	name: "What's Desired",
	rarity: EnumRarity.Epic,
	type: EnumArcType.Condensate,
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
