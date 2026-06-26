import { EnumRarity, EnumStatAttribute } from "../item"
import { Arc, EnumArcType } from "./arc"

export const theLastRose: Arc = {
	id: "the_last_rose",
	name: "The Last Rose",
	rarity: EnumRarity.Epic,
	type: EnumArcType.Liquid,
	mainAttribute: {
		attribute: EnumStatAttribute.CritRate,
		baseValue: 16.8,
	},
	effect: {
		name: "Bohemian Rose",
		description:
			"Increases ATK by 14.00%. Grants 1 stack of Chaos Thorn each time the wearer deals DoT. Increases CRIT DMG by 6.00% per stack for 3s. Triggers at most once every 0.3s, up to 10 stacks, and refreshes the duration when retriggered. Grants 10 stacks of Chaos Thorn immediately when the wearer casts a Redirect Skill.",
	},
	imageSrc: "the_last_rose.png",
}
