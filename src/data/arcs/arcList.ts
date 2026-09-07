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
	voice_of_the_voyager: {
		isPreview: true,
		id: "voice_of_the_voyager",
		imageSrc: "voice_of_the_voyager.webp",
		name: "Voice of The Voyager",
		description: "",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Golden Record",
			description:
				"Increases ATK by <dn>{0}</>.\nIncreases the wearer's Support Skill Crit DMG by <dn>{1}</>. Dealing DMG with a Support Skill increases their Ultimate Crit DMG by <dn>{2}</> for <dn>3</>s, up to <dn>3</> stacks. Resets the duration when triggered again.",
			values: {
				"1": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.66 },
					{ type: "Percent", value: 0.22 },
				],
				"2": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.825 },
					{ type: "Percent", value: 0.275 },
				],
				"3": [
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.99 },
					{ type: "Percent", value: 0.33 },
				],
				"4": [
					{ type: "Percent", value: 0.42 },
					{ type: "Percent", value: 1.155 },
					{ type: "Percent", value: 0.385 },
				],
				"5": [
					{ type: "Percent", value: 0.48 },
					{ type: "Percent", value: 1.32 },
					{ type: "Percent", value: 0.44 },
				],
			},
		},
	},

	ravenous_blade: {
		isFeatured: true,
		id: "ravenous_blade",
		imageSrc: "ravenous_blade.webp",
		name: "Ravenous Blade",
		description: "",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Cursed Blade - Soulbound",
			description:
				"Increases Crit Rate by <dn>{0}</>.\nGrants the wearer a <dn>{1}</> Crit DMG bonus for <dn>15</>s when they deal Incantation DMG. Stacks up to <dn>7</> times, with no more than 1 stack gained every <dn>0.3</>s. Resets the duration when triggered again.",
			values: {
				"1": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.9 },
				],
				"2": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.1125 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.135 },
				],
				"4": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.1575 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.18 },
				],
			},
		},
	},

	the_wrong_gate: {
		id: "the_wrong_gate",
		imageSrc: "the_wrong_gate.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Reverie Gate",
			description:
				"Increases ATK by <dn>{0}</>.\nWhen the wearer performs healing, increases the wearer's Anima DMG dealt by <dn>{2}</> and all  allies' DMG dealt by <dn>{1}</> for <dn>20</>s. Resets the duration when triggered again. Effects with the same name do not stack.",
			values: {
				"1": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.3 },
				],
				"2": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.1875 },
					{ type: "Percent", value: 0.375 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.45 },
				],
				"4": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.2625 },
					{ type: "Percent", value: 0.525 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.6 },
				],
			},
		},
	},

	blushing_mirage: {
		id: "blushing_mirage",
		imageSrc: "blushing_mirage.webp",
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
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Moonphase Shift",
			description:
				"Increases ATK by <dn>{0}</>. \nAfter casting Ultimate, increases the wearer's Cosmos DMG dealt by <dn>{1}</> and allows the wearer to ignore <dn>{2}</> of enemy DEF for <dn>20</>s. Resets the duration when triggered again.",
			values: {
				"1": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.12 },
				],
				"2": [
					{ type: "Percent", value: 0.23 },
					{ type: "Percent", value: 0.368 },
					{ type: "Percent", value: 0.138 },
				],
				"3": [
					{ type: "Percent", value: 0.26 },
					{ type: "Percent", value: 0.416 },
					{ type: "Percent", value: 0.156 },
				],
				"4": [
					{ type: "Percent", value: 0.29 },
					{ type: "Percent", value: 0.464 },
					{ type: "Percent", value: 0.174 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.512 },
					{ type: "Percent", value: 0.192 },
				],
			},
		},
	},

	whats_desired: {
		id: "whats_desired",
		imageSrc: "whats_desired.webp",
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
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Golden Fleece",
			description:
				"Increases the wearer's Lakshana DMG by <dn>{0}</>. Increases the wearer's CRIT DMG by <dn>{1}</> for <dn>20</>s when they cast a Redirect Skill or Ultimate. Resets the duration when triggered again.",
			values: {
				"1": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.4 },
				],
				"2": [
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.5 },
				],
				"3": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.6 },
				],
				"4": [
					{ type: "Percent", value: 0.35 },
					{ type: "Percent", value: 0.7 },
				],
				"5": [
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.8 },
				],
			},
		},
	},

	stellar_veil: {
		id: "stellar_veil",
		imageSrc: "stellar_veil.webp",
		name: "Stellar Veil",
		description: "At sunrise, the lost stars are merely homeward bound.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Aqua Astra",
			description:
				"Increases the wearer's Psyche DMG by <dn>{0}</>. Increases Crit DMG dealt by <dn>{1}</> for <dn>5</>s when dealing Psyche DMG, up to <dn>10</> stacks. Triggers at most once every <dn>0.1</>s.",
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.02 },
				],
				"2": [
					{ type: "Percent", value: 0.145 },
					{ type: "Percent", value: 0.024 },
				],
				"3": [
					{ type: "Percent", value: 0.17 },
					{ type: "Percent", value: 0.028 },
				],
				"4": [
					{ type: "Percent", value: 0.195 },
					{ type: "Percent", value: 0.032 },
				],
				"5": [
					{ type: "Percent", value: 0.21 },
					{ type: "Percent", value: 0.036 },
				],
			},
		},
	},

	the_rain_that_shook_the_world: {
		id: "the_rain_that_shook_the_world",
		imageSrc: "the_rain_that_shook_the_world.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Hypervortex",
			description:
				"Deals <dn>{0}</> increased Cosmos DMG with the wearer's Redirect Skill and Ultimate.\nIncreases the wearer's Cycle Intensity by <dn>{1}</> for <dn>15</>s after casting a Redirect Skill. Resets the duration when triggered again.",
			values: {
				"1": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 36 },
				],
				"2": [
					{ type: "Percent", value: 0.33 },
					{ type: "Percent", value: 45 },
				],
				"3": [
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 54 },
				],
				"4": [
					{ type: "Percent", value: 0.39 },
					{ type: "Percent", value: 63 },
				],
				"5": [
					{ type: "Percent", value: 0.42 },
					{ type: "Percent", value: 72 },
				],
			},
		},
	},

	the_last_rose: {
		id: "the_last_rose",
		imageSrc: "the_last_rose.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Bohemian Rose",
			description:
				"Increases ATK by <dn>{0}</>.\nGrants 1 stack of Chaos Thorn each time the wearer deals DoT. Increases CRIT DMG by <dn>{1}</> per stack for <dn>3</>s. Triggers at most <dn>once</> every <dn>0.3</>s, up to <dn>10</> stacks, and refreshes the duration when retriggered. Grants <dn>10</> stacks of Chaos Thorn immediately when the wearer casts a Redirect Skill.\nExtends the Broken state of a Broken enemy by <dn>3</>s when the wearer deals damage to them (triggers at most once per Break Effect).",
			values: {
				"1": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.06 },
				],
				"2": [
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 0.075 },
				],
				"3": [
					{ type: "Percent", value: 0.21 },
					{ type: "Percent", value: 0.09 },
				],
				"4": [
					{ type: "Percent", value: 0.245 },
					{ type: "Percent", value: 0.105 },
				],
				"5": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.12 },
				],
			},
		},
	},

	marching_beyond_time: {
		id: "marching_beyond_time",
		imageSrc: "marching_beyond_time.webp",
		name: "Marching Beyond Time",
		description: "We press on, lest we rust away to nothing.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Time Beyond Time",
			description:
				"Increases ATK by <dn>{0}</>.\nEnters Wastelab and clears current Wastetime when the wearer casts a Redirect Skill. While in Wastelab, allies gain <dn>1</> stack of Wastetime each time they use a Redirect or Support Skill, up to <dn>3</> stacks. When the wearer uses their Ultimate in Wastelab, they exit Wastelab and consume all Wastetime, increasing Ultimate Crit DMG by <dn>{1}</>, plus an additional <dn>{2}</> per Wastetime consumed. Consuming <dn>3</> Wastetime stacks at once grants an extra <dn>{3}</> DEF Ignore for <dn>70</>s.",
			values: {
				"1": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.08 },
					{ type: "Percent", value: 0.12 },
				],
				"2": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.15 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.18 },
				],
				"4": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.42 },
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.21 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.48 },
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.24 },
				],
			},
		},
	},

	ready_ready: {
		isFeatured: true,
		id: "ready_ready",
		imageSrc: "ready_ready.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Ready-Ready",
			description:
				"Increases ATK by <dn>{0}</>.\nIncreases Basic Atack and Critical Riposte damage by <dn>{0}</> for <dn>15</>s when casting a Redirect Skill or Ultimate, up to <dn>2</> stacks.\nGrants a Left Tiger Talisman when casting Redirect Skill and a Right Tiger Talisman when casting Ultimate.\nUnlocks Commander Tiger Talisman if the wearer obtains the other type of talisman within <dn>15</> of gaining one.\nArc Commander Tiger Talisman — Increases the wearer's damage to Bosses by <dn>{1}</> for <dn>10</>s.",
			values: {
				"1": [
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.1 },
				],
				"2": [
					{ type: "Percent", value: 0.1875 },
					{ type: "Percent", value: 0.125 },
				],
				"3": [
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.15 },
				],
				"4": [
					{ type: "Percent", value: 0.2625 },
					{ type: "Percent", value: 0.175 },
				],
				"5": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.2 },
				],
			},
		},
	},

	song_of_the_whale: {
		id: "song_of_the_whale",
		imageSrc: "song_of_the_whale.webp",
		name: "Song of the Whale",
		description: "The surging tide is its final farewell.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Deep Blue Sorrow",
			description:
				"Increases ATK by <dn>{0}</>.\nIncreases the wearer's damage to Broken enemies by <dn>{0}</>. Restores <dn>30.00%</> HP to the wearer if a Broken enemy is defeated. Triggers at most <dn>once</> every <dn>30</>s.",
			values: {
				"1": [{ type: "Percent", value: 0.12 }],
				"2": [{ type: "Percent", value: 0.14 }],
				"3": [{ type: "Percent", value: 0.16 }],
				"4": [{ type: "Percent", value: 0.18 }],
				"5": [{ type: "Percent", value: 0.2 }],
			},
		},
	},

	tears_beneath_the_mask: {
		id: "tears_beneath_the_mask",
		imageSrc: "tears_beneath_the_mask.webp",
		name: "Tears Beneath the Mask",
		description: "Who stole my child? Was it you? Was it him? Or was it…",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Nestbound Bird",
			description:
				"Applies Warning Gaze on enemies hit by the wearer's Ultimate. Marked enemies deal <dn>{0}</> reduced damage for <dn>20</>s. Effect does not stack.",
			values: {
				"1": [{ type: "Percent", value: 0.18 }],
				"2": [{ type: "Percent", value: 0.21 }],
				"3": [{ type: "Percent", value: 0.24 }],
				"4": [{ type: "Percent", value: 0.27 }],
				"5": [{ type: "Percent", value: 0.3 }],
			},
		},
	},

	reality_refuge: {
		id: "reality_refuge",
		imageSrc: "reality_refuge.webp",
		name: "Reality Refuge",
		description: "She told me that I was only ever a butterfly.",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.12,
		},
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Swallowtail",
			description:
				"Increases Anima DMG by <dn>{0}</>.\nIncreases the wearer's Attachment DMG by <dn>{1}</>. Increases the Attachment DMG bonus to <dn>{2}</> for <dn>6</>s when the wearer casts an Ultimate. Effect does not stack.",
			values: {
				"1": [
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.2 },
				],
				"2": [
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 0.1125 },
					{ type: "Percent", value: 0.225 },
				],
				"3": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.125 },
					{ type: "Percent", value: 0.25 },
				],
				"4": [
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.1375 },
					{ type: "Percent", value: 0.275 },
				],
				"5": [
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.3 },
				],
			},
		},
	},

	fluff_of_fearlessness: {
		id: "fluff_of_fearlessness",
		imageSrc: "fluff_of_fearlessness.webp",
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
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Popping Candy",
			description:
				"Increases ATK by <dn>{0}</> for <dn>10</>s after the wearer casts an Ultimate. Effect does not stack.",
			values: {
				"1": [{ type: "Percent", value: 0.25 }],
				"2": [{ type: "Percent", value: 0.3 }],
				"3": [{ type: "Percent", value: 0.35 }],
				"4": [{ type: "Percent", value: 0.4 }],
				"5": [{ type: "Percent", value: 0.45 }],
			},
		},
	},

	fluff_of_fleetness: {
		id: "fluff_of_fleetness",
		imageSrc: "fluff_of_fleetness.webp",
		name: "Fluff of Fleetness",
		description: "Hunter Guild Commemorative Arc: MAD FLUFF!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.176,
		},
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Motor Candy",
			description:
				"Increases <dn>{0}</> ATK every <dn>1</>s while the wearer is the active character, up to <dn>5</> stacks. Resets when the wearer leaves the field.",
			values: {
				"1": [{ type: "Percent", value: 0.05 }],
				"2": [{ type: "Percent", value: 0.06 }],
				"3": [{ type: "Percent", value: 0.07 }],
				"4": [{ type: "Percent", value: 0.08 }],
				"5": [{ type: "Percent", value: 0.09 }],
			},
		},
	},

	fluff_of_finesse: {
		id: "fluff_of_finesse",
		imageSrc: "fluff_of_finesse.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Thief's Candy",
			description:
				"Increases wearer's damage by <dn>{0}</> for <dn>10</>s after performing a Critical Dodge, up to <dn>3</> stacks. Resets the duration when triggered again.",
			values: {
				"1": [{ type: "Percent", value: 0.08 }],
				"2": [{ type: "Percent", value: 0.096 }],
				"3": [{ type: "Percent", value: 0.112 }],
				"4": [{ type: "Percent", value: 0.128 }],
				"5": [{ type: "Percent", value: 0.144 }],
			},
		},
	},

	fluff_of_ferocity: {
		id: "fluff_of_ferocity",
		imageSrc: "fluff_of_ferocity.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Knight's Candy",
			description:
				"Increases wearer's CRIT DMG by <dn>{0}</> for <dn>10</>s after landing a critical hit, up to <dn>10</> stacks. Resets the duration when triggered again.",
			values: {
				"1": [{ type: "Percent", value: 0.04 }],
				"2": [{ type: "Percent", value: 0.048 }],
				"3": [{ type: "Percent", value: 0.056 }],
				"4": [{ type: "Percent", value: 0.064 }],
				"5": [{ type: "Percent", value: 0.072 }],
			},
		},
	},

	fluff_of_fortitude: {
		id: "fluff_of_fortitude",
		imageSrc: "fluff_of_fortitude.webp",
		name: "Fluff of Fortitude",
		description: "Hunter Guild Commemorative Arc: So fluffy!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Jawbreaker's Candy",
			description:
				"Increases the wearer's DMG by <dn>{0}</>. Increases this effect to <dn>{1}</> against enemies with HP below 50%.",
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
		imageSrc: "hethereaus_keeper.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Justice Executioner",
			description:
				"Increases ATK by <dn>{0}</>.\nIncreases damage dealt to Bosses by <dn>{0}</>.\nUnlocks Arc: Officer Whisker.\nArc: Officer Whisker — Summons Officer Whisker to assist in combat. Officer Whisker continuously attacks enemies, dealing <dn>{1}</> of the wearer's ATK as damage per hit. Lasts <dn>30</>s. Cooldown: <dn>60</>s.",
			values: {
				"1": [
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 1 },
				],
				"2": [
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 1.25 },
				],
				"3": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 1.5 },
				],
				"4": [
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 1.75 },
				],
				"5": [
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 2 },
				],
			},
		},
	},

	eternal_waltz: {
		id: "eternal_waltz",
		imageSrc: "eternal_waltz.webp",
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
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Arachne",
			description:
				"Increases Max HP by <dn>{0}</>.\nIncreases Mental DMG dealt by <dn>{1}</> for <dn>10</>s after the wearer casts an Ultimate.",
			values: {
				"1": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.1 },
				],
				"2": [
					{ type: "Percent", value: 0.23 },
					{ type: "Percent", value: 0.12 },
				],
				"3": [
					{ type: "Percent", value: 0.26 },
					{ type: "Percent", value: 0.14 },
				],
				"4": [
					{ type: "Percent", value: 0.29 },
					{ type: "Percent", value: 0.16 },
				],
				"5": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.18 },
				],
			},
		},
	},

	raging_flames: {
		id: "raging_flames",
		imageSrc: "raging_flames.webp",
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
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Headless Rider",
			description:
				"Increases the wearer's Lakshana DMG by <dn>{0}</>. Increases the wearer's Redirect Skill and Ultimate DMG by <dn>{1}</> for <dn>10</>s after casting Ultimate. Increases the wearer's Redirect Skill DMG by <dn>{2}</> per cast while still active, up to 2 stacks.",
			values: {
				"1": [
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.05 },
				],
				"2": [
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 0.125 },
					{ type: "Percent", value: 0.06 },
				],
				"3": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.15 },
					{ type: "Percent", value: 0.07 },
				],
				"4": [
					{ type: "Percent", value: 0.225 },
					{ type: "Percent", value: 0.175 },
					{ type: "Percent", value: 0.08 },
				],
				"5": [
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.09 },
				],
			},
		},
	},

	your_happiness_is_priceless: {
		id: "your_happiness_is_priceless",
		imageSrc: "your_happiness_is_priceless.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Nacupeda",
			description:
				"Increases HP by <dn>{0}</>.\nGrants one of the following random effects when the wearer casts an Ultimate:\n1. Recovers <dn>{1}</> of Max HP for the team member with the lowest HP percentage.\n2. Grants a Shield equal to <dn>{1}</> of the wearer's Max HP for <dn>15</>s\n3. Recovers <dn>{2}</> for all team members.\nTriggers once every <dn>30</>s.",
			values: {
				"1": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.1 },
				],
				"2": [
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.25 },
					{ type: "Percent", value: 0.125 },
				],
				"3": [
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.15 },
				],
				"4": [
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.35 },
					{ type: "Percent", value: 0.175 },
				],
				"5": [
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.2 },
				],
			},
		},
	},

	contemplative_cat: {
		id: "contemplative_cat",
		imageSrc: "contemplative_cat.webp",
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
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Mammon",
			description:
				"Increases Cosmos DMG by <dn>{1}</> for every <dn>100000</> Fons the wearer holds, up to <dn>10</> stacks.",
			values: {
				"1": [{ type: "Percent", value: 0.025 }],
				"2": [{ type: "Percent", value: 0.03 }],
				"3": [{ type: "Percent", value: 0.035 }],
				"4": [{ type: "Percent", value: 0.04 }],
				"5": [{ type: "Percent", value: 0.045 }],
			},
		},
	},

	youthful_fantasy: {
		id: "youthful_fantasy",
		imageSrc: "youthful_fantasy.webp",
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
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: '"Black Tome"',
			description:
				"Increases Break Intensity by <dn>{0}</>.\nSeals Arc: Black Tome with two chains by default. Unleashes 1 chain each time any character on the team casts a Support Skill. Makes Arc: Black Tome available when all two chains are unleashed.\nArc: Black Tome — Summons the Black Tome for <dn>20</>s. Designates an enemy every <dn>5</>s. Increases the wearer's Chaos DMG dealt to designated enemies enemies by <dn>{1}</>. Deals Chaos DMG equal to <dn>{2}</> of the wearer's ATK to designated enemies when they take Break Damage.",
			values: {
				"1": [
					{ type: "Integer", value: 60 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 2 },
				],
				"2": [
					{ type: "Integer", value: 67 },
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 2.3 },
				],
				"3": [
					{ type: "Integer", value: 74 },
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 2.6 },
				],
				"4": [
					{ type: "Integer", value: 81 },
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 2.9 },
				],
				"5": [
					{ type: "Integer", value: 88 },
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 3.2 },
				],
			},
		},
	},

	blow_up_the_crowd: {
		id: "blow_up_the_crowd",
		imageSrc: "blow_up_the_crowd.webp",
		name: "Blow up the Crowd",
		description: "Shh… it's coming, it's coming! IT'S COMING!!!",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Beat King",
			description:
				"Increases the active character's ATK by <dn>{0}</> while the wearer is off-field, and increases the active character's ATK by <dn>{1}</> when the wearer deals damage, up to <dn>4</> stacks and triggering at most <dn>once</> every <dn>2</>s. Resets the effect when the wearer becomes the active character.\nIncreases Psyche DMG by <dn>{2}</> while the wearer is the active character, and increases Psyche DMG by <dn>{3}</> when dealing Psyche DMG with a Basic Attack, up to <dn>10</> stacks. Triggers at most once every <dn>0.3</>s. Resets the effect when switching characters.",
			values: {
				"1": [
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.02 },
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.02 },
				],
				"2": [
					{ type: "Percent", value: 0.11 },
					{ type: "Percent", value: 0.023 },
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.023 },
				],
				"3": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.026 },
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.026 },
				],
				"4": [
					{ type: "Percent", value: 0.13 },
					{ type: "Percent", value: 0.029 },
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.029 },
				],
				"5": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.032 },
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.032 },
				],
			},
		},
	},

	day_off: {
		id: "day_off",
		imageSrc: "day_off.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Eclipse",
			description:
				"Increases the wearer's ATK by <dn>{0}</>.\nUnlocks Arc: Eclipse.\nArc: Eclipse — The wearer creates a <dn>40</>s Eclipse. During the Eclipse, each enemy defeated restores <dn>{1}</> Ultimate Energy, up to <dn>5</> times. (cooldown: <dn>300</>s).",
			values: {
				"1": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 6 },
				],
				"2": [
					{ type: "Percent", value: 0.35 },
					{ type: "Percent", value: 7 },
				],
				"3": [
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 8 },
				],
				"4": [
					{ type: "Percent", value: 0.45 },
					{ type: "Percent", value: 9 },
				],
				"5": [
					{ type: "Percent", value: 0.5 },
					{ type: "Percent", value: 10 },
				],
			},
		},
	},

	camellia_society: {
		id: "camellia_society",
		imageSrc: "camellia_society.webp",
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
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Silent Garden",
			description:
				"Increases the wearer's CRIT DMG by <dn>{0}</> for <dn>5</>s when the wearer's HP is reduced without taking damage, up to <dn>4</> stacks.\nUnlocks Arc: Silent Garden.\nConsumes <dn>5.00%</> of current HP and randomly performs one of the following attakcs (CD <dn>25</>s) in Arc: Silent Garden:\nHarsh Rebuke: Rains merciless rebukes like leaves in a storm, dealing <dn>5</> instances of Incantation DMG of <dn>{1}</> ATK.\nIncessant Nagging: Pierces targets with sharp, cutting words like thorns, dealing <dn>6</> instances of Incantation DMG of <dn>{3}</> ATK; the final instance deals double damage.",
			values: {
				"1": [
					{ type: "Percent", value: 0.12 },
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.18 },
				],
				"2": [
					{ type: "Percent", value: 0.14 },
					{ type: "Percent", value: 0.28 },
					{ type: "Percent", value: 0.21 },
				],
				"3": [
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.32 },
					{ type: "Percent", value: 0.24 },
				],
				"4": [
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.36 },
					{ type: "Percent", value: 0.27 },
				],
				"5": [
					{ type: "Percent", value: 0.2 },
					{ type: "Percent", value: 0.4 },
					{ type: "Percent", value: 0.3 },
				],
			},
		},
	},

	good_boys_grand_adventure: {
		id: "good_boys_grand_adventure",
		imageSrc: "good_boys_grand_adventure.webp",
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
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Morphix",
			description:
				"Increases Charge Efficiency by <dn>{0}</>. Increases Team ATK by <dn>{1}</> for <dn>20</>s after the wearer casts an Ultimate. Increases Team ATK by an additional <dn>{2}</> if enemies are controlled by the Ultimate. Effects with the same name do not stack.",
			values: {
				"1": [
					{ type: "Percent", value: 0.18 },
					{ type: "Percent", value: 0.1 },
					{ type: "Percent", value: 0.06 },
				],
				"2": [
					{ type: "Percent", value: 0.21 },
					{ type: "Percent", value: 0.115 },
					{ type: "Percent", value: 0.07 },
				],
				"3": [
					{ type: "Percent", value: 0.24 },
					{ type: "Percent", value: 0.13 },
					{ type: "Percent", value: 0.08 },
				],
				"4": [
					{ type: "Percent", value: 0.27 },
					{ type: "Percent", value: 0.145 },
					{ type: "Percent", value: 0.09 },
				],
				"5": [
					{ type: "Percent", value: 0.3 },
					{ type: "Percent", value: 0.16 },
					{ type: "Percent", value: 0.1 },
				],
			},
		},
	},

	call_of_the_twisted_city: {
		id: "call_of_the_twisted_city",
		imageSrc: "call_of_the_twisted_city.webp",
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
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Cardboard Castle",
			description:
				"Increases Healing Bonus by <dn>{0}</> for <dn>10</>s after the wearer casts a Redirect Skill. Effect does not stack.",
			values: {
				"1": [{ type: "Percent", value: 0.12 }],
				"2": [{ type: "Percent", value: 0.14 }],
				"3": [{ type: "Percent", value: 0.16 }],
				"4": [{ type: "Percent", value: 0.18 }],
				"5": [{ type: "Percent", value: 0.2 }],
			},
		},
	},

	time_bandit: {
		id: "time_bandit",
		imageSrc: "time_bandit.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Picky",
			description:
				"Increases Break Intensity by <dn>{0}</> for <dn>50</>s after the wearer uses a Redirect Skill. Effect does not stack\nAllows use of Arc — Picky. (Cooldown: <dn>50</>s).\nArc — Picky: Summons Picky to pry open all nearby lockable objects.",
			values: {
				"1": [{ type: "Integer", value: 90 }],
				"2": [{ type: "Integer", value: 108 }],
				"3": [{ type: "Integer", value: 126 }],
				"4": [{ type: "Integer", value: 144 }],
				"5": [{ type: "Integer", value: 162 }],
			},
		},
	},

	the_fools_spring: {
		id: "the_fools_spring",
		imageSrc: "the_fools_spring.webp",
		name: "The Fools' Spring",
		description: "If I were a cicada, I'd still sing with my raspy voice.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.DEFBonus,
			baseValue: 0.21,
		},
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Solifugae Vita",
			description:
				"Increases ATK by <dn>{0}</> while the wearer has a Shield",
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
		imageSrc: "a_time_will_come.webp",
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
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Tidal Ascension",
			description:
				"Grants the wearer <dn>{0}</> ATK, <dn>{0}</> DEF, and <dn>{0}</> HP when the team has at least <dn>3</> different Esper Types.",
			values: {
				"1": [{ type: "Percent", value: 0.1 }],
				"2": [{ type: "Percent", value: 0.12 }],
				"3": [{ type: "Percent", value: 0.14 }],
				"4": [{ type: "Percent", value: 0.16 }],
				"5": [{ type: "Percent", value: 0.18 }],
			},
		},
	},

	drawn_blade: {
		id: "drawn_blade",
		imageSrc: "drawn_blade.webp",
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
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Crimson Hexblade",
			description:
				"Deals additional Incantation DMG equal to <dn>{0}</> of ATK when the wearer triggers a Parry Attack.",
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
		imageSrc: "failing_you_heavy_in_my_heart.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Spider Knowledge Collector",
			description:
				"Grants the wearer <dn>1</> stack of Spider Knowledge when dealing damage with Basic Attacks, up to <dn>8</> stacks (up to 1 stack every <dn>0.5</>s). All stakcks are consumed when casting Ultimate. Increases the entire teams's ATK by <dn>{0}</> for <dn>10</>s <dn>per</> stack consumed. Increases ATK by an additional <dn>{1}</> when <dn>8</> stacks are consumed.",
			values: {
				"1": [
					{ type: "Percent", value: 0.01 },
					{ type: "Percent", value: 0.02 },
				],
				"2": [
					{ type: "Percent", value: 0.0115 },
					{ type: "Percent", value: 0.023 },
				],
				"3": [
					{ type: "Percent", value: 0.013 },
					{ type: "Percent", value: 0.026 },
				],
				"4": [
					{ type: "Percent", value: 0.0145 },
					{ type: "Percent", value: 0.029 },
				],
				"5": [
					{ type: "Percent", value: 0.016 },
					{ type: "Percent", value: 0.032 },
				],
			},
		},
	},

	clear_skies: {
		id: "clear_skies",
		imageSrc: "clear_skies.webp",
		name: "Clear Skies",
		description: "Formation complete, securing air superiority.",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Paper Squadron",
			description:
				"Increases Anima DMG dealt by the wearer's Redirect Skill and Ultimate by <dn>{1}</>.",
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
		imageSrc: "watch_your_heads.webp",
		name: "Watch Your Heads!",
		description: "Hehehe… Don't be scared, it's just a laughing kite…",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.16,
		},
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Ghostly Kite",
			description:
				"Increases ATK by <dn>{0}</> and Lakshana DMG to targets affected by Remora and Stain <dn>{0}</> for <dn>15</>s after the wearer casts a Redirect Skill. Effect does not stack.",
			values: {
				"1": [{ type: "Percent", value: 0.1 }],
				"2": [{ type: "Percent", value: 0.12 }],
				"3": [{ type: "Percent", value: 0.14 }],
				"4": [{ type: "Percent", value: 0.16 }],
				"5": [{ type: "Percent", value: 0.18 }],
			},
		},
	},

	the_great_thief: {
		id: "the_great_thief",
		imageSrc: "the_great_thief.webp",
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
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Danzaburou",
			description:
				"Increases Break Intensity by <dn>{0}</> for all characters of the same Esper Type as the wearer (including the wearer) when the team has <dn>3</> or more such characters. This effect does not stack.",
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
		imageSrc: "the_good_the_bad_the_bitter.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: '"Bittercake"',
			description:
				"Increases wearer's DEF by <dn>{0}</> for <dn>10</>s when taking damage. Triggers at most once every <dn>20</>s.",
			values: {
				"1": [{ type: "Percent", value: 0.26 }],
				"2": [{ type: "Percent", value: 0.31 }],
				"3": [{ type: "Percent", value: 0.36 }],
				"4": [{ type: "Percent", value: 0.41 }],
				"5": [{ type: "Percent", value: 0.46 }],
			},
		},
	},

	mind_royale: {
		id: "mind_royale",
		imageSrc: "mind_royale.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Inspiration Terminator",
			description:
				"Increases the wearer <dn>10</> Ultimate Energy when casting a Redirect Skill. Triggers up to once every <dn>20s</>",
			values: {
				"1": [{ type: "Percent", value: 0.1 }],
				"2": [{ type: "Percent", value: 0.12 }],
				"3": [{ type: "Percent", value: 0.14 }],
				"4": [{ type: "Percent", value: 0.16 }],
				"5": [{ type: "Percent", value: 0.18 }],
			},
		},
	},

	oraora: {
		id: "oraora",
		imageSrc: "oraora.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Oraora!",
			description:
				"Increases the wearer's Basic Attack DMG by <dn>{0}</> for <dn>10</>s after each Basic Attack, upt to <dn>10</> stacks. Each stack's duration is calculated independently, and is not reset when new stacks are gained.",
			values: {
				"1": [{ type: "Percent", value: 0.02 }],
				"2": [{ type: "Percent", value: 0.024 }],
				"3": [{ type: "Percent", value: 0.028 }],
				"4": [{ type: "Percent", value: 0.032 }],
				"5": [{ type: "Percent", value: 0.036 }],
			},
		},
	},

	the_forgotten: {
		id: "the_forgotten",
		imageSrc: "the_forgotten.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Picture Frame",
			description:
				"Increases ATK by <dn>{0}</> when the wearer's HP is above 50%; increases DEF by <dn>{0}</> when HP is below 50%.",
			values: {
				"1": [{ type: "Percent", value: 0.2 }],
				"2": [{ type: "Percent", value: 0.24 }],
				"3": [{ type: "Percent", value: 0.28 }],
				"4": [{ type: "Percent", value: 0.32 }],
				"5": [{ type: "Percent", value: 0.36 }],
			},
		},
	},

	shiny_days: {
		id: "shiny_days",
		imageSrc: "shiny_days.webp",
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
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: "Film - MANISH",
			description:
				"Increases Break Intensity by <dn>{0}</>. Increases DMG by <dn>{1}</> against Broken units.",
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
		imageSrc: "cosmos_daze_wild_reverie.webp",
		name: "Cosmos Daze, Wild Reverie",
		description: "Masterpiece from Pop Re-Creator!",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: '"Bopp"',
			description:
				"Increases wearer's damage dealt by <dn>{0}</> for <dn>10</>s after casting Support Skill. Triggers at most once every <dn>20</>s.",
			values: {
				"1": [{ type: "Percent", value: 0.18 }],
				"2": [{ type: "Percent", value: 0.21 }],
				"3": [{ type: "Percent", value: 0.24 }],
				"4": [{ type: "Percent", value: 0.27 }],
				"5": [{ type: "Percent", value: 0.3 }],
			},
		},
	},

	umbrella: {
		id: "umbrella",
		imageSrc: "umbrella.webp",
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
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: '"Rainman"',
			description:
				"Increases HP by <dn>{0}</>.\nStrengthens shields by <dn>{0}</> while the wearer's HP is above 50%.",
			values: {
				"1": [{ type: "Percent", value: 0.1 }],
				"2": [{ type: "Percent", value: 0.12 }],
				"3": [{ type: "Percent", value: 0.14 }],
				"4": [{ type: "Percent", value: 0.16 }],
				"5": [{ type: "Percent", value: 0.18 }],
			},
		},
	},

	real_music: {
		id: "real_music",
		imageSrc: "real_music.webp",
		name: '"Real Music"',
		description:
			'Waddaya mean ya prefer "real music"? Is this not "real" enough for yer taste?',
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Liquid,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterialSet1: ascDramaCoreSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Haunted Record",
			description:
				"Grants the wearer a <dn>{0}</> Redirect Skill DMG bonus.",
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
		imageSrc: "us.webp",
		name: "Us.",
		description: "I am… you… are… you, are… it, is… me… no, I… am… us.",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Plasma,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterialSet1: ascColdDessertSet,
		ascensionMaterialSet2: ascDelusionsSet,
		effect: {
			name: "Protocore",
			description:
				"Increases the wearer's Basic Attack damage by <dn>{0}</>.",
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
		imageSrc: "be_happy.webp",
		name: "Be Happy",
		description: "Hm? Why aren't you laughing?",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Gas,
		baseAtk: 21,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.12,
		},
		ascensionMaterialSet1: ascLiquidDreamSet,
		ascensionMaterialSet2: ascNumeralSet,
		effect: {
			name: "Huggy Vines",
			description:
				"Restores wearer's HP by <dn>{0}</> upon defeating an enemy. Triggers at most once every <dn>20</>s.",
			values: {
				"1": [{ type: "Percent", value: 0.12 }],
				"2": [{ type: "Percent", value: 0.14 }],
				"3": [{ type: "Percent", value: 0.16 }],
				"4": [{ type: "Percent", value: 0.18 }],
				"5": [{ type: "Percent", value: 0.2 }],
			},
		},
	},

	first_step_to_success: {
		id: "first_step_to_success",
		imageSrc: "first_step_to_success.webp",
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
		ascensionMaterialSet1: ascMuiscSet,
		ascensionMaterialSet2: ascSilhouetteSet,
		effect: {
			name: "Noros",
			description:
				"Increases wearer's ATK by <dn>{0}</> for <dn>10</>s when casting a Redirect Skill. Triggers up to once every <dn>20</>s.",
			values: {
				"1": [{ type: "Percent", value: 0.12 }],
				"2": [{ type: "Percent", value: 0.13 }],
				"3": [{ type: "Percent", value: 0.14 }],
				"4": [{ type: "Percent", value: 0.15 }],
				"5": [{ type: "Percent", value: 0.16 }],
			},
		},
	},

	dangerous_game: {
		id: "dangerous_game",
		imageSrc: "dangerous_game.webp",
		name: "Dangerous Game",
		description: "Let's make a bet. Loser goes broke.",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Condensate,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 38,
		},
		ascensionMaterialSet1: ascAppleSeedSet,
		ascensionMaterialSet2: ascWhispersSet,
		effect: {
			name: '"Decomposer"',
			description:
				"Increases the wearer's Break Intesity by <dn>{0}</> for <dn>10</>s when reducing Break. Triggers at most every <dn>20</>s.",
			values: {
				"1": [{ type: "Integer", value: 60 }],
				"2": [{ type: "Integer", value: 66 }],
				"3": [{ type: "Integer", value: 72 }],
				"4": [{ type: "Integer", value: 78 }],
				"5": [{ type: "Integer", value: 84 }],
			},
		},
	},
}

export function getAllArcs() {
	return allArcs
}

const allArcsList = Object.values(allArcs)

export function getAllArcsList() {
	return allArcsList
}

export function findArc(arcId: string) {
	return allArcs[arcId]
}

export function findArcByName(arcName: string) {
	return allArcsList.find((arc) => arc.name === arcName)
}
