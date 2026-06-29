import { EnumRarity, EnumStatAttribute } from "@/database/items"
import { ascDramaCoreSet, ascWhispersSet } from "@/database/items/materials"
import { Arc, EnumArcType } from "./arc"

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
