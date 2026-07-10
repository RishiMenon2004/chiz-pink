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
	the_wrong_gate: {
		isPreview: true,
		id: "the_wrong_gate",
		name: "The Wrong Gate",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "the_wrong_gate.png",
	},

	blushing_mirage: {
		isFeatured: true,
		id: "blushing_mirage",
		name: "Blushing Mirage",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
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
			baseValue: 0.096,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "whats_desired.png",
	},

	stellar_veil: {
		id: "stellar_veil",
		name: "Stellar Veil",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "stellar_veil.png",
	},

	the_rain_that_shook_the_world: {
		id: "the_rain_that_shook_the_world",
		name: "The Rain That Shook the World",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.088,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "the_rain_that_shook_the_world.png",
	},

	the_last_rose: {
		id: "the_last_rose",
		name: "The Last Rose",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
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
			baseValue: 0.096,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "marching_beyond_time.png",
	},

	song_of_the_whale: {
		id: "song_of_the_whale",
		name: "Song of the Whale",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "song_of_the_whale.png",
	},

	tears_beneath_the_mask: {
		id: "tears_beneath_the_mask",
		name: "Tears Beneath the Mask",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "tears_beneath_the_mask.png",
	},

	reality_refuge: {
		id: "reality_refuge",
		name: "Reality Refuge",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "reality_refuge.png",
	},

	fluff_of_fearlessness: {
		id: "fluff_of_fearlessness",
		name: "Fluff of Fearlessness",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.088,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "fluff_of_fearlessness.png",
	},

	fluff_of_fleetness: {
		id: "fluff_of_fleetness",
		name: "Fluff of Fleetness",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.176,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "fluff_of_fleetness.png",
	},

	fluff_of_finesse: {
		id: "fluff_of_finesse",
		name: "Fluff of Finesse",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "fluff_of_finesse.png",
	},

	fluff_of_ferocity: {
		id: "fluff_of_ferocity",
		name: "Fluff of Ferocity",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "fluff_of_ferocity.png",
	},

	fluff_of_fortitude: {
		id: "fluff_of_fortitude",
		name: "Fluff of Fortitude",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "fluff_of_fortitude.png",
	},

	hethereaus_keeper: {
		id: "hethereaus_keeper",
		name: "Hethereau's Keeper",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "hethereaus_keeper.png",
	},

	eternal_waltz: {
		id: "eternal_waltz",
		name: "Eternal Waltz",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 28,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.165,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "eternal_waltz.png",
	},

	raging_flames: {
		id: "raging_flames",
		name: "Raging Flames",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 43,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "raging_flames.png",
	},

	your_happiness_is_priceless: {
		id: "your_happiness_is_priceless",
		name: "Your Happiness is Priceless",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.DEFBonus,
			baseValue: 0.154,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "your_happiness_is_priceless.png",
	},

	contemplative_cat: {
		id: "contemplative_cat",
		name: "Contemplative Cat",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.176,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "contemplative_cat.png",
	},

	youthful_fantasy: {
		id: "youthful_fantasy",
		name: "Youthful Fantasy",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Liquid,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "youthful_fantasy.png",
	},

	blow_up_the_crowd: {
		id: "blow_up_the_crowd",
		name: "Blow up the Crowd",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.11,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "blow_up_the_crowd.png",
	},

	ready_ready: {
		id: "ready_ready",
		name: "Ready-Ready",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Plasma,
		baseAtk: 37,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.096,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "ready_ready.png",
	},

	day_off: {
		id: "day_off",
		name: "Day Off",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Solid,
		baseAtk: 33,
		mainAttribute: {
			attribute: EnumStatAttribute.ChargeEffeciency,
			baseValue: 0.132,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "day_off.png",
	},

	camellia_society: {
		id: "camellia_society",
		name: "Camellia Society",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Condensate,
		baseAtk: 43,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.048,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "camellia_society.png",
	},

	good_boys_grand_adventure: {
		id: "good_boys_grand_adventure",
		name: "Good Boy's Grand Adventure",
		rarity: EnumRarity.Epic,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.18,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "good_boys_grand_adventure.png",
	},

	call_of_the_twisted_city: {
		id: "call_of_the_twisted_city",
		name: "Call of the Twisted City",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.15,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "call_of_the_twisted_city.png",
	},

	time_bandit: {
		id: "time_bandit",
		name: "Time Bandit",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Solid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "time_bandit.png",
	},

	the_fools_spring: {
		id: "the_fools_spring",
		name: "The Fools' Spring",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.DEFBonus,
			baseValue: 0.21,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "the_fools_spring.png",
	},

	a_time_will_come: {
		id: "a_time_will_come",
		name: "A Time Will Come",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.CritRate,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "a_time_will_come.png",
	},

	drawn_blade: {
		id: "drawn_blade",
		name: "Drawn Blade",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Plasma,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.15,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "drawn_blade.png",
	},

	failing_you_heavy_in_my_heart: {
		id: "failing_you_heavy_in_my_heart",
		name: "Failing You, Heavy in My Heart",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 48,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "failing_you_heavy_in_my_heart.png",
	},

	clear_skies: {
		id: "clear_skies",
		name: "Clear Skies",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "clear_skies.png",
	},

	watch_your_heads: {
		id: "watch_your_heads",
		name: "Watch Your Heads!",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.CritDMG,
			baseValue: 0.16,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "watch_your_heads.png",
	},

	the_great_thief: {
		id: "the_great_thief",
		name: "The Great Thief",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 48,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "the_great_thief.png",
	},

	the_good_the_bad_the_bitter: {
		id: "the_good_the_bad_the_bitter",
		name: "The Good, The Bad, The Bitter",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "the_good_the_bad_the_bitter.png",
	},

	mind_royale: {
		id: "mind_royale",
		name: "Mind Royale",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 36,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 24,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "mind_royale.png",
	},

	oraora: {
		id: "oraora",
		name: "Oraora!",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Plasma,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.15,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "oraora.png",
	},

	the_forgotten: {
		id: "the_forgotten",
		name: "The Forgotten",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Solid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "the_forgotten.png",
	},

	shiny_days: {
		id: "shiny_days",
		name: "Shiny Days",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Liquid,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "shiny_days.png",
	},

	cosmos_daze_wild_reverie: {
		id: "cosmos_daze_wild_reverie",
		name: "Cosmos Daze, Wild Reverie",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Gas,
		baseAtk: 31,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.1,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "cosmos_daze_wild_reverie.png",
	},

	umbrella: {
		id: "umbrella",
		name: "Umbrella",
		rarity: EnumRarity.Rare,
		type: EnumArcType.Condensate,
		baseAtk: 25,
		mainAttribute: {
			attribute: EnumStatAttribute.DEFBonus,
			baseValue: 0.21,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "umbrella.png",
	},

	real_music: {
		id: "real_music",
		name: "Real Music",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Liquid,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascDramaCoreSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "real_music.png",
	},

	us: {
		id: "us",
		name: "Us.",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Plasma,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascColdDessertSet,
		ascensionMaterial2: ascDelusionsSet,
		imageSrc: "us.png",
	},

	be_happy: {
		id: "be_happy",
		name: "Be Happy",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Gas,
		baseAtk: 21,
		mainAttribute: {
			attribute: EnumStatAttribute.HPBonus,
			baseValue: 0.12,
		},
		ascensionMaterial1: ascLiquidDreamSet,
		ascensionMaterial2: ascNumeralSet,
		imageSrc: "be_happy.png",
	},

	first_step_to_success: {
		id: "first_step_to_success",
		name: "First Step to Success",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Solid,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.ATKBonus,
			baseValue: 0.08,
		},
		ascensionMaterial1: ascMuiscSet,
		ascensionMaterial2: ascSilhouetteSet,
		imageSrc: "first_step_to_success.png",
	},

	dangerous_game: {
		id: "dangerous_game",
		name: "Dangerous Game",
		rarity: EnumRarity.Uncommon,
		type: EnumArcType.Condensate,
		baseAtk: 24,
		mainAttribute: {
			attribute: EnumStatAttribute.BreakIntensity,
			baseValue: 38,
		},
		ascensionMaterial1: ascAppleSeedSet,
		ascensionMaterial2: ascWhispersSet,
		imageSrc: "dangerous_game.png",
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
