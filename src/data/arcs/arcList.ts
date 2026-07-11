import type { Arc } from "@/types/weapon"

import { EnumRarity, EnumStatAttribute } from "@/data/items"
import {
	ascAppleSeedSet,
	ascMuiscSet,
	ascLiquidDreamSet,
	ascColdDessertSet,
	ascDramaCoreSet,
	ascWhispersSet,
	ascSilhouetteSet,
	ascNumeralSet,
	ascDelusionsSet,
} from "@/data/items/materials"

import { EnumArcType } from "./arc"

const allArcs: Record<string, Arc> = {
	blushing_mirage: {
		isFeatured: true,
		id: "blushing_mirage",
		imageSrc: "blushing_mirage.png",
		name: "Blushing Mirage",
		description:
			"Moonlight whispers a promise of unfurled wings, stirring rare passion and inspiration. But not every whisper should be trusted.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Moonphase Shift",
			description: [
				"Increases ATK by <lv>{0}</>. \nAfter casting Ultimate, increases the wearer's Cosmos DMG dealt by <lv>{1}</> and allows the wearer to ignore <lv>{2}</> of enemy DEF for <lv>{3}</>s. Resets the duration when triggered again.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.23 },
					{ type: "Percent", value: 0.368 },
					{ type: "Percent", value: 0.138 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.26 },
					{ type: "Percent", value: 0.416 },
					{ type: "Percent", value: 0.156 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.29 },
					{ type: "Percent", value: 0.464 },
					{ type: "Percent", value: 0.174 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.512 },
					{ type: "Percent", value: 0.192 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},
	
	the_wrong_gate: {
		isPreview: true,
		id: "the_wrong_gate",
		imageSrc: "the_wrong_gate.png",
		name: "The Wrong Gate",
		description:
			"Do not open that door. Do not leave this place. Wouldn't you rather stay somewhere warm?",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Reverie Gate",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the allies' DMG dealt by <lv>{1}</> when the wearer heals, and increases the wearer's Anima DMG dealt by <lv>{2}</> for <lv>{3}</>s. Resets the duration when triggered again. This effect is unique within the team.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.1875 },
					{ type: "Percent", value: 0.375 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.45 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.2625 },
					{ type: "Percent", value: 0.525 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.6 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	whats_desired: {
		id: "whats_desired",
		imageSrc: "whats_desired.png",
		name: "What's Desired",
		description:
			"And so the epic begins, and everyone sets out on the journey. As for where the road ends, does it really matter?",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Golden Fleece",
			description: [
				"Increases the wearer's Lakshana DMG by <lv>{0}</>. Increases the wearer's CRIT DMG by <lv>{1}</> for <lv>{2}</>s when they cast a Redirect Skill or Ultimate. Resets the duration when triggered again.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.4 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.5 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.6 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.35 },
					{ type: "Percent", value: 0.7 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.8 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	stellar_veil: {
		id: "stellar_veil",
		imageSrc: "stellar_veil.png",
		name: "Stellar Veil",
		description: "At sunrise, the lost stars are merely homeward bound.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Aqua Astra",
			description: [
				"Increases the wearer's Psyche DMG by <lv>{0}</>. Increases Crit DMG dealt by <lv>{1}</> for <lv>{2}</>s when dealing Psyche DMG, up to <lv>10</> stacks. Triggers at most once every <lv>0.1</>s.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.02 },
					{ type: "Integer", value: 5 },
				],
				"2": [
					{ type: "Percent", value: 0.145 },
					{ type: "Percent", value: 0.024 },
					{ type: "Integer", value: 5 },
				],
				"3": [
					{ type: "Percent", value: 0.17 },
					{ type: "Percent", value: 0.028 },
					{ type: "Integer", value: 5 },
				],
				"4": [
					{ type: "Percent", value: 0.195 },
					{ type: "Percent", value: 0.032 },
					{ type: "Integer", value: 5 },
				],
				"5": [
					{ type: "Percent", value: 0.21 },
					{ type: "Percent", value: 0.036 },
					{ type: "Integer", value: 5 },
				],
			},
		},
	},

	the_rain_that_shook_the_world: {
		id: "the_rain_that_shook_the_world",
		imageSrc: "the_rain_that_shook_the_world.png",
		name: "The Rain That Shook the World",
		description:
			"It emerged from a downpour that turned the world upside down.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.088,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Hypervortex",
			description: [
				"Deals <lv>{0}</> increased Cosmos DMG with the wearer's Redirect Skill and Ultimate.\nIncreases the wearer's Cycle Intensity by <lv>{1}</> for <lv>{2}</>s after casting a Redirect Skill. Resets the duration when triggered again.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 36 },
					{ type: "Integer", value: 15 },
				],
				"2": [
					{ type: "Percent", value: 0.33 },
					{ type: "Percent", value: 45 },
					{ type: "Integer", value: 15 },
				],
				"3": [
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 54 },
					{ type: "Integer", value: 15 },
				],
				"4": [
					{ type: "Percent", value: 0.39 },
					{ type: "Percent", value: 63 },
					{ type: "Integer", value: 15 },
				],
				"5": [
					{ type: "Percent", value: 0.42 },
					{ type: "Percent", value: 72 },
					{ type: "Integer", value: 15 },
				],
			},
		},
	},

	the_last_rose: {
		id: "the_last_rose",
		imageSrc: "the_last_rose.png",
		name: "The Last Rose",
		description:
			"On the water's surface, the last rose blooms alone. She waits… for a dear friend, or perhaps for a boundless dream.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Bohemian Rose",
			description: [
				"Increases ATK by <lv>{0}</>.\nGrants 1 stack of Chaos Thorn each time the wearer deals DoT. Increases CRIT DMG by <lv>{1}</> per stack for <lv>{2}</>s. Triggers at most <lv>once</> every <lv>0.3</>s, up to <lv>10</> stacks, and refreshes the duration when retriggered. Grants <lv>10</> stacks of Chaos Thorn immediately when the wearer casts a Redirect Skill.\nExtends the Broken state of a Broken enemy by <lv>{3}</>s when the wearer deals damage to them (triggers at most once per Break Effect).",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.06 },
					{ type: "Integer", value: 3 },
					{ type: "Integer", value: 3 },
				],
				"2": [
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 0.075 },
					{ type: "Integer", value: 3 },
					{ type: "Integer", value: 3 },
				],
				"3": [
					{ type: "Percent", value: 0.21 },
					{ type: "Percent", value: 0.09 },
					{ type: "Integer", value: 3 },
					{ type: "Integer", value: 3 },
				],
				"4": [
					{ type: "Percent", value: 0.245 },
					{ type: "Percent", value: 0.105 },
					{ type: "Integer", value: 3 },
					{ type: "Integer", value: 3 },
				],
				"5": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 3 },
					{ type: "Integer", value: 3 },
				],
			},
		},
	},

	marching_beyond_time: {
		id: "marching_beyond_time",
		imageSrc: "marching_beyond_time.png",
		name: "Marching Beyond Time",
		description: "We press on, lest we rust away to nothing.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Time Beyond Time",
			description: [
				"Increases ATK by <lv>{0}</>.\r\nEnters Wastelab and clears current Wastetime when the wearer casts a Redirect Skill. While in Wastelab, allies gain <lv>1</> stack of Wastetime each time they use a Redirect or Support Skill, up to <lv>3</> stacks. When the wearer uses their Ultimate in Wastelab, they exit Wastelab and consume all Wastetime, increasing Ultimate Crit DMG by <lv>{1}</>, plus an additional <lv>{2}</> per Wastetime consumed. Consuming <lv>3</> Wastetime stacks at once grants an extra <lv>{3}</> DEF Ignore for <lv>{4}</>s.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.08 },
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 70 },
				],
				"2": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.15 },
					{ type: "Integer", value: 70 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 70 },
				],
				"4": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.42 },
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.21 },
					{ type: "Integer", value: 70 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.48 },
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.24 },
					{ type: "Integer", value: 70 },
				],
			},
		},
	},

	song_of_the_whale: {
		id: "song_of_the_whale",
		imageSrc: "song_of_the_whale.png",
		name: "Song of the Whale",
		description: "The surging tide is its final farewell.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Deep Blue Sorrow",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage to Broken enemies by <lv>{1}</>. Restores <lv>{2}</> HP to the wearer if a Broken enemy is defeated. Triggers at most <lv>once</> every <lv>{3}</>s.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 30 },
				],
				"2": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 30 },
				],
				"3": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 30 },
				],
				"4": [
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 30 },
				],
				"5": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 30 },
				],
			},
		},
	},

	tears_beneath_the_mask: {
		id: "tears_beneath_the_mask",
		imageSrc: "tears_beneath_the_mask.png",
		name: "Tears Beneath the Mask",
		description: "Who stole my child? Was it you? Was it him? Or was it…",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Nestbound Bird",
			description: [
				"Applies Warning Gaze on enemies hit by the wearer's Ultimate. Marked enemies deal <lv>18%</> reduced damage for <lv>20</>s. Effect does not stack.",
				"Applies Warning Gaze on enemies hit by the wearer's Ultimate. Marked enemies deal <lv>21%</> reduced damage for <lv>20</>s. Effect does not stack.",
				"Inflicts Warning Gaze on enemies hit by the wearer's Ultimate, reducing their damage dealt by <lv>24%</> for <lv>20</>s. Effect does not stack.",
				"Applies Warning Gaze on enemies hit by the wearer's Ultimate. Marked enemies deal <lv>27%</> reduced damage for <lv>20</>s. Effect does not stack.",
				"Applies Warning Gaze on enemies hit by the wearer's Ultimate. Marked enemies deal <lv>30%</> reduced damage for <lv>20</>s. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.21 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.27 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	reality_refuge: {
		id: "reality_refuge",
		imageSrc: "reality_refuge.png",
		name: "Reality Refuge",
		description: "She told me that I was only ever a butterfly.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Swallowtail",
			description: [
				"Increases Anima DMG by <lv>{0}</>.\nIncreases the wearer's Attachment DMG by <lv>{1}</>. Increases the Attachment DMG bonus to <lv>{2}</> for <lv>{3}</>s when the wearer casts an Ultimate. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 6 },
				],
				"2": [
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 0.1125 },
					{ type: "Percent", value: 0.225 },
					{ type: "Integer", value: 6 },
				],
				"3": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.125 },
					{ type: "Percent", value: 0.25 },
					{ type: "Integer", value: 6 },
				],
				"4": [
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.1375 },
					{ type: "Percent", value: 0.275 },
					{ type: "Integer", value: 6 },
				],
				"5": [
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 6 },
				],
			},
		},
	},

	fluff_of_fearlessness: {
		id: "fluff_of_fearlessness",
		imageSrc: "fluff_of_fearlessness.png",
		name: "Fluff of Fearlessness",
		description:
			"Hunter Guild Commemorative Arc: Cool fluffs don't look at explosions.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.088,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Popping Candy",
			description: [
				"Increases ATK by <lv>{0}</> for <lv>{1}</>s after the wearer casts an Ultimate. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.25 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.35 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.4 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.45 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	fluff_of_fleetness: {
		id: "fluff_of_fleetness",
		imageSrc: "fluff_of_fleetness.png",
		name: "Fluff of Fleetness",
		description: "Hunter Guild Commemorative Arc: MAD FLUFF!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.176,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Motor Candy",
			description: [
				"Increases <lv>{1}</> ATK every <lv>{0}</>s while the wearer is the active character, up to <lv>5</> stacks. Resets when the wearer leaves the field.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.05 },
					{ type: "Integer", value: 1 },
				],
				"2": [
					{ type: "Percent", value: 0.06 },
					{ type: "Integer", value: 1 },
				],
				"3": [
					{ type: "Percent", value: 0.07 },
					{ type: "Integer", value: 1 },
				],
				"4": [
					{ type: "Percent", value: 0.08 },
					{ type: "Integer", value: 1 },
				],
				"5": [
					{ type: "Percent", value: 0.09 },
					{ type: "Integer", value: 1 },
				],
			},
		},
	},

	fluff_of_finesse: {
		id: "fluff_of_finesse",
		imageSrc: "fluff_of_finesse.png",
		name: "Fluff of Finesse",
		description:
			"Hunter Guild Commemorative Arc: Not every encounter is a pleasant one…",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Thief's Candy",
			description: [
				"Increases wearer's damage by <lv>{0}</> for <lv>{1}</>s after performing a Critical Dodge, up to <lv>3</> stacks. Resets the duration when triggered again.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.08 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.096 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.112 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.128 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.144 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	fluff_of_ferocity: {
		id: "fluff_of_ferocity",
		imageSrc: "fluff_of_ferocity.png",
		name: "Fluff of Ferocity",
		description:
			"Hunter Guild Commemorative Arc: Discard all that is useless…",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Knight's Candy",
			description: [
				"Increases wearer's CRIT DMG by <lv>{0}</> for <lv>{1}</>s after landing a critical hit, up to <lv>10</> stacks. Resets the duration when triggered again.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.04 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.048 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.056 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.064 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.072 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	fluff_of_fortitude: {
		id: "fluff_of_fortitude",
		imageSrc: "fluff_of_fortitude.png",
		name: "Fluff of Fortitude",
		description: "Hunter Guild Commemorative Arc: So fluffy!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Jawbreaker's Candy",
			description: [
				"Increases the wearer's DMG by <lv>{0}</>. Increases this effect to <lv>{1}</> against enemies with HP below 50%.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.22 },
					{ type: "Percent", value: 0.28 },
				],
				"2": [
					{ type: "Percent", value: 0.26 },
					{ type: "Percent", value: 0.34 },
				],
				"3": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.4 },
				],
				"4": [
					{ type: "Percent", value: 0.34 },
					{ type: "Percent", value: 0.46 },
				],
				"5": [
					{ type: "Percent", value: 0.38 },
					{ type: "Percent", value: 0.52 },
				],
			},
		},
	},

	hethereaus_keeper: {
		id: "hethereaus_keeper",
		imageSrc: "hethereaus_keeper.png",
		name: "Hethereau's Keeper",
		description:
			"Once again, another day has passed peacefully. Hats off to Officer Whisker!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Justice Executioner",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases damage dealt to Bosses by <lv>{1}</>.\nUnlocks Arc: Officer Whisker.\nArc: Officer Whisker — Summons Officer Whisker to assist in combat. Officer Whisker continuously attacks enemies, dealing <lv>{2}</> of the wearer's ATK as damage per hit. Lasts <lv>30</>s. Cooldown: <lv>{3}</>s.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 1 },
					{ type: "Integer", value: 60 },
				],
				"2": [
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 1.25 },
					{ type: "Integer", value: 60 },
				],
				"3": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 1.5 },
					{ type: "Integer", value: 60 },
				],
				"4": [
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 1.75 },
					{ type: "Integer", value: 60 },
				],
				"5": [
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 2 },
					{ type: "Integer", value: 60 },
				],
			},
		},
	},

	eternal_waltz: {
		id: "eternal_waltz",
		imageSrc: "eternal_waltz.png",
		name: "Eternal Waltz",
		description:
			"Dance to the beat, feel the dizzying sensation as if the world is ending, until forever!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 28,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.165,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Arachne",
			description: [
				"Increases Max HP by <lv>{0}</>.\nIncreases Mental DMG dealt by <lv>{1}</> for <lv>{2}</>s after the wearer casts an Ultimate.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.1 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.23 },
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.26 },
					{ type: "Percent", value: 0.14 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.29 },
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	raging_flames: {
		id: "raging_flames",
		imageSrc: "raging_flames.png",
		name: "Raging Flames",
		description:
			"The desire for speed flows through my veins, the roar of engines thunders in my chest! Come on, let's go! Step onto this racetrack where we pledge our souls!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 43,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Themed Flames",
			description: [
				"Increases the wearer's Resonance DMG by <lv>{0}</>.\nAfter the wearer casts an Ultimate, increases the wearer's DMG by <lv>{1}</> for <lv>{2}</>s. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.1 },
					{ type: "Integer", value: 10 },
					{ type: "Percent", value: 0.05 },
					{ type: "Percent", value: 0.15 },
				],
				"2": [
					{ type: "Percent", value: 0.125 },
					{ type: "Integer", value: 10 },
					{ type: "Percent", value: 0.06 },
					{ type: "Percent", value: 0.175 },
				],
				"3": [
					{ type: "Percent", value: 0.15 },
					{ type: "Integer", value: 10 },
					{ type: "Percent", value: 0.07 },
					{ type: "Percent", value: 0.2 },
				],
				"4": [
					{ type: "Percent", value: 0.175 },
					{ type: "Integer", value: 10 },
					{ type: "Percent", value: 0.08 },
					{ type: "Percent", value: 0.225 },
				],
				"5": [
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 10 },
					{ type: "Percent", value: 0.09 },
					{ type: "Percent", value: 0.25 },
				],
			},
		},
	},

	your_happiness_is_priceless: {
		id: "your_happiness_is_priceless",
		imageSrc: "your_happiness_is_priceless.png",
		name: "Your Happiness is Priceless",
		description:
			"Mm, mm-hmm, mm-hmm-hmm-hmm-hmm-hmm-hmm! (Give me Fons— You'll be happy, and I'll be happy too!)",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.DEFBonus,
			baseValue: 0.154,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Prized Joy",
			description: [
				"Increases the wearer's damage by <lv>{0}</> after they are hit. Grants <lv>{1}</> DEF Ignore for <lv>{2}</>s after the wearer is hit. Triggers at most once every <lv>{3}</>s.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.1 },
					{ type: "Integer", value: 30 },
				],
				"2": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.25 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.125 },
					{ type: "Integer", value: 30 },
				],
				"3": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.15 },
					{ type: "Integer", value: 30 },
				],
				"4": [
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.35 },
					{ type: "Percent", value: 0.35 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.175 },
					{ type: "Integer", value: 30 },
				],
				"5": [
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.4 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 30 },
				],
			},
		},
	},

	contemplative_cat: {
		id: "contemplative_cat",
		imageSrc: "contemplative_cat.png",
		name: "Contemplative Cat",
		description:
			"The meaning of life… the reason for existence… the answer to the universe is… 4… balls of yarn!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.176,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "The Cat's Wish",
			description: [
				"Increases ATK by <lv>{0}</>.\nAfter the wearer casts an Ultimate, increases the wearer's Ice DMG by <lv>{1}</> for <lv>{2}</>s. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 100000 },
					{ type: "Percent", value: 0.025 },
				],
				"2": [
					{ type: "Percent", value: 100000 },
					{ type: "Percent", value: 0.03 },
				],
				"3": [
					{ type: "Percent", value: 100000 },
					{ type: "Percent", value: 0.035 },
				],
				"4": [
					{ type: "Percent", value: 100000 },
					{ type: "Percent", value: 0.04 },
				],
				"5": [
					{ type: "Percent", value: 100000 },
					{ type: "Percent", value: 0.045 },
				],
			},
		},
	},

	youthful_fantasy: {
		id: "youthful_fantasy",
		imageSrc: "youthful_fantasy.png",
		name: "Youthful Fantasy",
		description:
			'"Secret"… The moment it was recorded, it was already known by everyone.',
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Youthful Sigh",
			description: [
				"Increases ATK by <lv>{0}</>.\nAfter the wearer uses a Support Skill, increases the wearer's damage by <lv>{1}</> for <lv>{2}</>s. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Integer", value: 60 },
					{ type: "Integer", value: 20 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 2 },
				],
				"2": [
					{ type: "Integer", value: 67 },
					{ type: "Integer", value: 20 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 2.3 },
				],
				"3": [
					{ type: "Integer", value: 74 },
					{ type: "Integer", value: 20 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 2.6 },
				],
				"4": [
					{ type: "Integer", value: 81 },
					{ type: "Integer", value: 20 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 2.9 },
				],
				"5": [
					{ type: "Integer", value: 88 },
					{ type: "Integer", value: 20 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 3.2 },
				],
			},
		},
	},

	blow_up_the_crowd: {
		id: "blow_up_the_crowd",
		imageSrc: "blow_up_the_crowd.png",
		name: "Blow up the Crowd",
		description: "Shh… it's coming, it's coming! IT'S COMING!!!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Screaming Rave",
			description: [
				"Increases the wearer's damage by <lv>{0}</>.\nIncreases the wearer's DMG dealt to enemies with <lv>50%</> or less HP by <lv>{1}</> for <lv>{2}</>s after the wearer casts an Ultimate. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.02 },
					{ type: "Integer", value: 2 },
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.02 },
				],
				"2": [
					{ type: "Percent", value: 0.11 },
					{ type: "Percent", value: 0.023 },
					{ type: "Integer", value: 2 },
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.023 },
				],
				"3": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.026 },
					{ type: "Integer", value: 2 },
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.026 },
				],
				"4": [
					{ type: "Percent", value: 0.13 },
					{ type: "Percent", value: 0.029 },
					{ type: "Integer", value: 2 },
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.029 },
				],
				"5": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.032 },
					{ type: "Integer", value: 2 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.032 },
				],
			},
		},
	},

	ready_ready: {
		id: "ready_ready",
		imageSrc: "ready_ready.png",
		name: "Ready-Ready",
		description:
			"Hold me close, embrace the courage and resolve that transcends the fallen—I salute you, great Tiger warriors.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Ready-Ready",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases allies' DMG by <lv>{1}</> for <lv>{2}</>s after the wearer casts a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.15 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.1 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.1875 },
					{ type: "Percent", value: 0.1875 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.125 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.225 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.15 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.2625 },
					{ type: "Percent", value: 0.2625 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.175 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 15 },
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	day_off: {
		id: "day_off",
		imageSrc: "day_off.png",
		name: "Day Off",
		description:
			'Eclipse said, "Let there be double days off."\nAnd thus, the double days off came into being (Eclipse Exclusive Edition).',
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ChargeEffeciency,
			baseValue: 0.132,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Wasted Time",
			description: [
				"Increases the wearer's Charge Efficiency by <lv>{0}</>.\nIncreases the wearer's DMG by <lv>{1}</> for <lv>{2}</>s after dodging. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 40 },
					{ type: "Percent", value: 6 },
					{ type: "Integer", value: 5 },
					{ type: "Integer", value: 300 },
				],
				"2": [
					{ type: "Percent", value: 0.35 },
					{ type: "Integer", value: 40 },
					{ type: "Percent", value: 7 },
					{ type: "Integer", value: 5 },
					{ type: "Integer", value: 300 },
				],
				"3": [
					{ type: "Percent", value: 0.4 },
					{ type: "Integer", value: 40 },
					{ type: "Percent", value: 8 },
					{ type: "Integer", value: 5 },
					{ type: "Integer", value: 300 },
				],
				"4": [
					{ type: "Percent", value: 0.45 },
					{ type: "Integer", value: 40 },
					{ type: "Percent", value: 9 },
					{ type: "Integer", value: 5 },
					{ type: "Integer", value: 300 },
				],
				"5": [
					{ type: "Percent", value: 0.5 },
					{ type: "Integer", value: 40 },
					{ type: "Percent", value: 10 },
					{ type: "Integer", value: 5 },
					{ type: "Integer", value: 300 },
				],
			},
		},
	},

	camellia_society: {
		id: "camellia_society",
		imageSrc: "camellia_society.png",
		name: "Camellia Society",
		description:
			"Though I'm not supposed to let my composure slip onto the petals… that flower really cut deep.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 43,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.048,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Camellia Society",
			description: [
				"Increases the wearer's CRIT Rate by <lv>{0}</>.\nIncreases the wearer's ATK by <lv>{1}</> for <lv>{2}</>s after dealing DoT. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.05 },
					{ type: "Integer", value: 25 },
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.18 },
				],
				"2": [
					{ type: "Percent", value: 0.14 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.05 },
					{ type: "Integer", value: 25 },
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.21 },
				],
				"3": [
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.05 },
					{ type: "Integer", value: 25 },
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.24 },
				],
				"4": [
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.05 },
					{ type: "Integer", value: 25 },
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.27 },
				],
				"5": [
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 5 },
					{ type: "Percent", value: 0.05 },
					{ type: "Integer", value: 25 },
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.3 },
				],
			},
		},
	},

	good_boys_grand_adventure: {
		id: "good_boys_grand_adventure",
		imageSrc: "good_boys_grand_adventure.png",
		name: "Good Boy's Grand Adventure",
		description:
			"What do you see? A winged white wolf? An adorable white dog? Or perhaps…?",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.18,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Good Boy's Adventure",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's DMG by <lv>{1}</> for <lv>{2}</>s after casting an Ultimate. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.1 },
					{ type: "Integer", value: 20 },
					{ type: "Percent", value: 0.06 },
				],
				"2": [
					{ type: "Percent", value: 0.21 },
					{ type: "Percent", value: 0.115 },
					{ type: "Integer", value: 20 },
					{ type: "Percent", value: 0.07 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.13 },
					{ type: "Integer", value: 20 },
					{ type: "Percent", value: 0.08 },
				],
				"4": [
					{ type: "Percent", value: 0.27 },
					{ type: "Percent", value: 0.145 },
					{ type: "Integer", value: 20 },
					{ type: "Percent", value: 0.09 },
				],
				"5": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 20 },
					{ type: "Percent", value: 0.1 },
				],
			},
		},
	},

	call_of_the_twisted_city: {
		id: "call_of_the_twisted_city",
		imageSrc: "call_of_the_twisted_city.png",
		name: "Call of the Twisted City",
		description:
			"When the world begins to warp, crying out in ways no one can understand, who among us can hold on to their sanity?",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.15,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "The Twisted City",
			description: [
				"Increases HP by <lv>{0}</>.\nIncreases the wearer's DMG by <lv>{1}</> for <lv>{2}</>s after a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.14 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	time_bandit: {
		id: "time_bandit",
		imageSrc: "time_bandit.png",
		name: "Time Bandit",
		description:
			"Time is like water next to a sponge. Look away for only a second, and it vanishes.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Solid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Time Bandit",
			description: [
				"Increases HP by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using an Ultimate. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Integer", value: 90 },
					{ type: "Integer", value: 50 },
				],
				"2": [
					{ type: "Integer", value: 108 },
					{ type: "Integer", value: 50 },
				],
				"3": [
					{ type: "Integer", value: 126 },
					{ type: "Integer", value: 50 },
				],
				"4": [
					{ type: "Integer", value: 144 },
					{ type: "Integer", value: 50 },
				],
				"5": [
					{ type: "Integer", value: 162 },
					{ type: "Integer", value: 50 },
				],
			},
		},
	},

	the_fools_spring: {
		id: "the_fools_spring",
		imageSrc: "the_fools_spring.png",
		name: "The Fools' Spring",
		description: "If I were a cicada, I'd still sing with my raspy voice.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.DEFBonus,
			baseValue: 0.21,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Fool's Spring",
			description: [
				"Increases the wearer's DEF by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after taking damage. Effect does not stack.",
			],
			values: {
				"1": [{ type: "Percent", value: 0.18 }],
				"2": [{ type: "Percent", value: 0.21 }],
				"3": [{ type: "Percent", value: 0.24 }],
				"4": [{ type: "Percent", value: 0.27 }],
				"5": [{ type: "Percent", value: 0.3 }],
			},
		},
	},

	a_time_will_come: {
		id: "a_time_will_come",
		imageSrc: "a_time_will_come.png",
		name: "A Time Will Come",
		description:
			"Descending from the heavens, returning to the heavens. Believing in that destined day, we leap into this endless migration with no visible end.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "A Time Will Come",
			description: [
				"Increases the wearer's CRIT Rate by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after dealing damage. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.1 },
				],
				"2": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.12 },
				],
				"3": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.14 },
				],
				"4": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.16 },
				],
				"5": [
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.18 },
				],
			},
		},
	},

	drawn_blade: {
		id: "drawn_blade",
		imageSrc: "drawn_blade.png",
		name: "Drawn Blade",
		description:
			"Lone moon, dark clouds. Blade drawn, soul departs. Form fades, blade weeps.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Plasma,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.15,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Drawn Blade",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Support Skill. Effect does not stack.",
			],
			values: {
				"1": [{ type: "Percent", value: 2 }],
				"2": [{ type: "Percent", value: 2.3 }],
				"3": [{ type: "Percent", value: 2.6 }],
				"4": [{ type: "Percent", value: 2.9 }],
				"5": [{ type: "Percent", value: 3.2 }],
			},
		},
	},

	failing_you_heavy_in_my_heart: {
		id: "failing_you_heavy_in_my_heart",
		imageSrc: "failing_you_heavy_in_my_heart.png",
		name: "Failing You, Heavy in My Heart",
		description:
			"When you see red reflected in your teacher's eyes, that usually means you're about to fail the class.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 48,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Heavy Heart",
			description: [
				"Increases the wearer's Break Effect by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after breaking an enemy. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.01 },
					{ type: "Percent", value: 0.02 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.0115 },
					{ type: "Percent", value: 0.023 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.013 },
					{ type: "Percent", value: 0.026 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.0145 },
					{ type: "Percent", value: 0.029 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.016 },
					{ type: "Percent", value: 0.032 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	clear_skies: {
		id: "clear_skies",
		imageSrc: "clear_skies.png",
		name: "Clear Skies",
		description: "Formation complete, securing air superiority.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Clear Skies",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using an Ultimate. Effect does not stack.",
			],
			values: {
				"1": [{ type: "Percent", value: 0.2 }],
				"2": [{ type: "Percent", value: 0.2375 }],
				"3": [{ type: "Percent", value: 0.275 }],
				"4": [{ type: "Percent", value: 0.3125 }],
				"5": [{ type: "Percent", value: 0.35 }],
			},
		},
	},

	watch_your_heads: {
		id: "watch_your_heads",
		imageSrc: "watch_your_heads.png",
		name: "Watch Your Heads!",
		description: "Hehehe… Don't be scared, it's just a laughing kite…",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.16,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Watch Your Heads",
			description: [
				"Increases the wearer's CRIT DMG by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after taking damage. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.1 },
					{ type: "Integer", value: 15 },
				],
				"2": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 15 },
				],
				"3": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.14 },
					{ type: "Integer", value: 15 },
				],
				"4": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 15 },
				],
				"5": [
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 15 },
				],
			},
		},
	},

	the_great_thief: {
		id: "the_great_thief",
		imageSrc: "the_great_thief.png",
		name: "The Great Thief",
		description:
			"The moment I saw you, I was captivated. Your soft fur, that mischievous look on your face—I was mesmerized for so long that it wasn't until you left that I realized… where are my grilled skewers?",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 48,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Great Thief",
			description: [
				"Increases the wearer's Break Effect by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [{ type: "Integer", value: 70 }],
				"2": [{ type: "Integer", value: 84 }],
				"3": [{ type: "Integer", value: 98 }],
				"4": [{ type: "Integer", value: 112 }],
				"5": [{ type: "Integer", value: 126 }],
			},
		},
	},

	the_good_the_bad_the_bitter: {
		id: "the_good_the_bad_the_bitter",
		imageSrc: "the_good_the_bad_the_bitter.png",
		name: "The Good, The Bad, The Bitter",
		description:
			"A touch of bitterness, but it'll still put you in a good mood, won't it?",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "The Good, The Bad, The Bitter",
			description: [
				"Increases HP by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Support Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.26 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.31 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.36 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.41 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.46 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	mind_royale: {
		id: "mind_royale",
		imageSrc: "mind_royale.png",
		name: "Mind Royale",
		description:
			"Inspiration is like potato chips—crunching and crackling, leaving scattered crumbs everywhere, without rhyme or reason.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 36,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 24,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Mind Royale",
			description: [
				"Increases the wearer's Break Effect by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.1 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.14 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	oraora: {
		id: "oraora",
		imageSrc: "oraora.png",
		name: "Oraora!",
		description:
			"It's said that in a faraway place, Ora Puncher has a cousin, Muda Puncher.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Plasma,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.15,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "Oraora!",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.02 },
					{ type: "Integer", value: 10 },
				],
				"2": [
					{ type: "Percent", value: 0.024 },
					{ type: "Integer", value: 10 },
				],
				"3": [
					{ type: "Percent", value: 0.028 },
					{ type: "Integer", value: 10 },
				],
				"4": [
					{ type: "Percent", value: 0.032 },
					{ type: "Integer", value: 10 },
				],
				"5": [
					{ type: "Percent", value: 0.036 },
					{ type: "Integer", value: 10 },
				],
			},
		},
	},

	the_forgotten: {
		id: "the_forgotten",
		imageSrc: "the_forgotten.png",
		name: "The Forgotten",
		description:
			"Even if I'm just a complement to those masterpieces… I'm still beautiful too, right?",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Solid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "The Forgotten",
			description: [
				"Increases HP by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after taking damage. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.2 },
				],
				"2": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.24 },
				],
				"3": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.28 },
				],
				"4": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.32 },
				],
				"5": [
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.36 },
				],
			},
		},
	},

	shiny_days: {
		id: "shiny_days",
		imageSrc: "shiny_days.png",
		name: "Shiny Days",
		description:
			"Capturing these radiant moments, even in dreams they must go on. Regret was never beautiful, and you were never alone.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Shiny Days",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Support Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Integer", value: 48 },
					{ type: "Percent", value: 0.1 },
				],
				"2": [
					{ type: "Integer", value: 57 },
					{ type: "Percent", value: 0.12 },
				],
				"3": [
					{ type: "Integer", value: 66 },
					{ type: "Percent", value: 0.14 },
				],
				"4": [
					{ type: "Integer", value: 75 },
					{ type: "Percent", value: 0.16 },
				],
				"5": [
					{ type: "Integer", value: 84 },
					{ type: "Percent", value: 0.18 },
				],
			},
		},
	},

	cosmos_daze_wild_reverie: {
		id: "cosmos_daze_wild_reverie",
		imageSrc: "cosmos_daze_wild_reverie.png",
		name: "Cosmos Daze, Wild Reverie",
		description: "Masterpiece from Pop Re-Creator!",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Cosmos Daze",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using an Ultimate. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.21 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.27 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.3 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	umbrella: {
		id: "umbrella",
		imageSrc: "umbrella.png",
		name: "Umbrella",
		description:
			"Remember to get enough sleep and check the weather forecast; remember to eat your meals and take an umbrella when going out.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.DEFBonus,
			baseValue: 0.21,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Umbrella",
			description: [
				"Increases the wearer's DEF by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.1 },
				],
				"2": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.12 },
				],
				"3": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.14 },
				],
				"4": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.16 },
				],
				"5": [
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.18 },
				],
			},
		},
	},

	real_music: {
		id: "real_music",
		imageSrc: "real_music.png",
		name: "Real Music",
		description:
			'Waddaya mean ya prefer "real music"? Is this not "real" enough for yer taste?',
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Liquid,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Real Music",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Support Skill. Effect does not stack.",
			],
			values: {
				"1": [{ type: "Percent", value: 0.12 }],
				"2": [{ type: "Percent", value: 0.13 }],
				"3": [{ type: "Percent", value: 0.14 }],
				"4": [{ type: "Percent", value: 0.15 }],
				"5": [{ type: "Percent", value: 0.16 }],
			},
		},
	},

	us: {
		id: "us",
		imageSrc: "us.png",
		name: "Us.",
		description: "I am… you… are… you, are… it, is… me… no, I… am… us.",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Plasma,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		effect: {
			name: "Us",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [{ type: "Percent", value: 0.12 }],
				"2": [{ type: "Percent", value: 0.13 }],
				"3": [{ type: "Percent", value: 0.14 }],
				"4": [{ type: "Percent", value: 0.15 }],
				"5": [{ type: "Percent", value: 0.16 }],
			},
		},
	},

	be_happy: {
		id: "be_happy",
		imageSrc: "be_happy.png",
		name: "Be Happy",
		description: "Hm? Why aren't you laughing?",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Gas,
		baseAtk: 21,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascNumeralSet,
		effect: {
			name: "Be Happy",
			description: [
				"Increases HP by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after taking damage. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.14 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.18 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.2 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	first_step_to_success: {
		id: "first_step_to_success",
		imageSrc: "first_step_to_success.png",
		name: "First Step to Success",
		description:
			"Good self-control is the first step on the road to success.",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Solid,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascSilhouetteSet,
		effect: {
			name: "First Step to Success",
			description: [
				"Increases ATK by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Support Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Percent", value: 0.13 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Percent", value: 0.14 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Percent", value: 0.15 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Percent", value: 0.16 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
			},
		},
	},

	dangerous_game: {
		id: "dangerous_game",
		imageSrc: "dangerous_game.png",
		name: "Dangerous Game",
		description: "Let's make a bet. Loser goes broke.",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Condensate,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 38,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascWhispersSet,
		effect: {
			name: "Dangerous Game",
			description: [
				"Increases the wearer's Break Effect by <lv>{0}</>.\nIncreases the wearer's damage by <lv>{1}</> for <lv>{2}</>s after using a Redirect Skill. Effect does not stack.",
			],
			values: {
				"1": [
					{ type: "Integer", value: 60 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"2": [
					{ type: "Integer", value: 66 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"3": [
					{ type: "Integer", value: 72 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"4": [
					{ type: "Integer", value: 78 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
				"5": [
					{ type: "Integer", value: 84 },
					{ type: "Integer", value: 10 },
					{ type: "Integer", value: 20 },
				],
			},
		},
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
