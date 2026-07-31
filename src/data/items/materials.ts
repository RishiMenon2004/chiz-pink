import type { Material, MaterialSet } from "@/types/item"

import { EnumRarity } from "@/data/items"

export enum EnumMaterialType {
	WeeklyBossDrop = "Weekly Boss Drops",
	BossDrop = "World Boss Drops",
	CharacterExp = "Esper XP",
	CharacterAscension = "Esper Ascension",
	Talent = "Esper Talent",
	WeaponAscension = "Arc Ascension",
	WeaponExp = "Arc XP",
	Currency = "Currency",
	Reward = "Reward",
}

/* Rewards */
export const diceLimited: Material = {
	id: "dice_limited",
	name: "Solid Dice",
	rarity:EnumRarity.Epic,
	materialType: EnumMaterialType.Reward,
	imageSrc: "/rewards/dice_limited",
	sources: ["Fair Exchange", "Circle Bounty: Elite", "Scarborough Fair: Limited Board"]
}

export const diceStandard: Material = {
	id: "dice_standard",
	name: "Fabricated Dice",
	rarity:EnumRarity.Epic,
	materialType: EnumMaterialType.Reward,
	imageSrc: "/rewards/dice_standard",
	sources: ["Fair Exchange", "Circle Bounty: Standard", "Scarborough Fair: Permanent Board"]
}

export const floeCinemeTicket: Material = {
	id: "floe_cineme_ticket",
	name: "Floe Cinema Ticket",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Reward,
	imageSrc: "/rewards/floe_cinema_ticket",
	sources: [],
}

export const porsche918Spyder: Material = {
	id: "porsche_918_spyder",
	name: "Porsche 918 Spyder",
	materialType: EnumMaterialType.Reward,
	rarity: EnumRarity.Epic,
	imageSrc: "/rewards/porche_918_spyder",
	sources: ["Everdriving Mystery Box Event"],
}

export const regaliaDraco: Material = {
	id: "regalia_draco",
	name: "Regalia Draco",
	materialType: EnumMaterialType.Reward,
	rarity: EnumRarity.Epic,
	imageSrc: "/rewards/regalia_draco",
	sources: ["Everdriving Mystery Box Event"],
}

/* Currencies */
export const annulith: Material = {
	id: "annulith",
	name: "Annulith",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.Currency,
	imageSrc: "/currency_annulith",
	sources: [],
}

export const beetleCoin: Material = {
	id: "beetle_coin",
	name: "Beetle Coin",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Currency,
	imageSrc: "/currency_beetle_coin",
	sources: [
		"Houdinii's Magic Stage",
		"Hunter Exchange",
		"Material Selection Box",
	],
}

export const fons: Material = {
	id: "fons",
	name: "Fons",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Currency,
	imageSrc: "/currency_fons",
	sources: ["Hethereau Hobbies", "Fair Exchange"],
}

export const characterPixel: Material = {
	id: "characterPixel",
	name: "Character Pixel",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Currency,
	imageSrc: "/stamina_pixels",
	sources: []
}

export const cityStamina: Material = {
	id: "cityStamina",
	name: "City Stamina",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Currency,
	imageSrc: "/stamina_city",
	sources: []
}

/* Weekly Boss Drops - Talent*/
export const goodBoyStamp: Material = {
	id: "good_boy_stamp",
	name: "Good Boy Stamp",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.WeeklyBossDrop,
	imageSrc: "/weekly_good_boy_stamp",
	sources: ['Anomaly Pilgrimage: "Morphix"'],
}

export const dressSleevesOfVanity: Material = {
	id: "dress_sleeves_of_vanity",
	name: "Dress Sleeves of Vanity",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.WeeklyBossDrop,
	imageSrc: "/weekly_dress_sleeves_of_vanity",
	sources: ['Anomaly Pilgrimage: "The Never-ending Arachne"'],
}

export const eternalMemory: Material = {
	id: "eternal_memory",
	name: "Eternal Memory",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.WeeklyBossDrop,
	imageSrc: "/weekly_eternal_memory",
	sources: ['Anomaly Pilgrimage: "Debt Collector"'],
}

/* Character Experience */
export const eliteHunterGuide: Material = {
	id: "elite_hunter_guide",
	name: "Elite Hunter Guide",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterExp,
	imageSrc: "/exp_elite_hunter_guide",
	sources: [
		"Houdinii's Magic Stage",
		"Hunter Exchange",
		"Material Selection Box",
	],
	linkedMaterials: ["senior_hunter_guide", "rising_hunter_guide"],
}

export const seniorHunterGuide: Material = {
	id: "senior_hunter_guide",
	name: "Senior Hunter Guide",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterExp,
	imageSrc: "/exp_senior_hunter_guide",
	sources: [
		"Houdinii's Magic Stage",
		"Hunter Exchange",
		"Material Selection Box",
	],
	linkedMaterials: ["elite_hunter_guide", "rising_hunter_guide"],
}

export const risingHunterGuide: Material = {
	id: "rising_hunter_guide",
	name: "Rising Hunter Guide",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterExp,
	imageSrc: "/exp_rising_hunter_guide",
	sources: [
		"Houdinii's Magic Stage",
		"Hunter Exchange",
		"Material Selection Box",
	],
	linkedMaterials: ["elite_hunter_guide", "senior_hunter_guide"],
}

export const expHunterGuideSet: MaterialSet = [
	risingHunterGuide,
	seniorHunterGuide,
	eliteHunterGuide,
]

/* Character Ascension */
export const paradoxicalWhispers: Material = {
	id: "paradoxical_whispers",
	name: "Paradoxical Whispers",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_paradoxical_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["obscure_whispers", "lost_whispers"],
}

export const obscureWhispers: Material = {
	id: "obscure_whispers",
	name: "Obscure Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_obscure_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["paradoxical_whispers", "lost_whispers"],
}

export const lostWhispers: Material = {
	id: "lost_whispers",
	name: "Lost Whispers",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_lost_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["paradoxical_whispers", "obscure_whispers"],
}

export const ascWhispersSet: MaterialSet = [
	lostWhispers,
	obscureWhispers,
	paradoxicalWhispers,
]

export const chaosSilhouette: Material = {
	id: "chaos_silhouette",
	name: "Chaos Silhouette",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_chaos_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["blurred_silhouette", "fading_silhouette"],
}

export const blurredSilhouette: Material = {
	id: "blurred_silhouette",
	name: "Blurred Silhouette",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_blurred_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["chaos_silhouette", "fading_silhouette"],
}

export const fadingSilhouette: Material = {
	id: "fading_silhouette",
	name: "Fading Silhouette",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_fading_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["chaos_silhouette", "blurred_silhouette"],
}

export const ascSilhouetteSet: MaterialSet = [
	fadingSilhouette,
	blurredSilhouette,
	chaosSilhouette,
]

export const distortedNumeral: Material = {
	id: "distorted_numeral",
	name: "Distorted Numeral",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_distorted_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["unsolved_numeral", "blurred_numeral"],
}

export const unsolvedNumeral: Material = {
	id: "unsolved_numeral",
	name: "Unsolved Numeral",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_unsolved_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["distorted_numeral", "blurred_numeral"],
}

export const blurredNumeral: Material = {
	id: "blurred_numeral",
	name: "Blurred Numeral",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_blurred_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["distorted_numeral", "unsolved_numeral"],
}

export const ascNumeralSet: MaterialSet = [
	blurredNumeral,
	unsolvedNumeral,
	distortedNumeral,
]

export const transcendentDelusions: Material = {
	id: "transcendent_delusions",
	name: "Transcendent Delusions",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_transcendent_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["yearning_delusions", "suspended_delusions"],
}

export const yearningDelusions: Material = {
	id: "yearning_delusions",
	name: "Yearning Delusions",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_yearning_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["transcendent_delusions", "suspended_delusions"],
}

export const suspendedDelusions: Material = {
	id: "suspended_delusions",
	name: "Suspended Delusions",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_suspended_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["transcendent_delusions", "yearning_delusions"],
}

export const ascDelusionsSet: MaterialSet = [
	suspendedDelusions,
	yearningDelusions,
	transcendentDelusions,
]

/* Boss Drops - Character Ascension */
export const waterMoonPick: Material = {
	id: "water_moon_pick",
	name: "Water Moon Pick",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_water_moon_pick",
	sources: ['Anomaly Hunt: "Beat King"', "Material Selection Box"],
}

export const chargingKnightSparkPlug: Material = {
	id: "charging_knight_spark_plug",
	name: "Charging Knight Spark Plug",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_charging_knight_spark_plug",
	sources: ['Anomaly Hunt: "Headless Rider"', "Material Selection Box"],
}

export const confessionalFLowerSeed: Material = {
	id: "confessional_flower_seed",
	name: "Confessional Flower Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_confessional_flower_seed",
	sources: ['Anomaly Hunt: "Serenetti"', "Material Selection Box"],
}

export const aPageFromDelusionsShore: Material = {
	id: "a_page_from_delusions_shore",
	name: "A Page from Delusion's Shore",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_a_page_from_delusions_shore",
	sources: ['Anomaly Hunt: "Black Tome"', "Material Selection Box"],
}

export const tearOfTheSea: Material = {
	id: "tear_of_the_sea",
	name: "Tear of The Sea",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_tear_of_the_sea",
	sources: ['Anomaly Hunt: "Sea Prisoner"', "Material Selection Box"],
}

export const nestGuardFragment: Material = {
	id: "nest_guard_fragment",
	name: "Nest Guard Fragment",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_nest_guard_fragment",
	sources: ['Anomaly Hunt: "Nestbound Bird"', "Material Selection Box"],
}

export const colorfulTicketStub: Material = {
	id: "colorful_ticket_stub",
	name: "Colorful Ticket Stub",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_colorful_ticket_stub",
	sources: ['Anomaly Hunt: "Swallowtail"', "Material Selection Box"],
}

/* Talent */
export const theOliveBranch: Material = {
	id: "the_olive_branch",
	name: "The Olive Branch",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_the_olive_branch",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["doves_flutter", "nestlings_longing"],
}

export const dovesFlutter: Material = {
	id: "doves_flutter",
	name: "Dove's Flutter",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_doves_flutter",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_olive_branch", "nestlings_longing"],
}

export const nestlingsLonging: Material = {
	id: "nestlings_longing",
	name: "Nestling's Longing",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_nestlings_longing",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_olive_branch", "doves_flutter"],
}

export const talentBirdSet: MaterialSet = [
	nestlingsLonging,
	dovesFlutter,
	theOliveBranch,
]

export const whiteRose: Material = {
	id: "white_rose",
	name: "White Rose",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_white_rose",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["co", "fng"],
}

export const co: Material = {
	id: "co",
	name: "CO",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_co",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["white_rose", "fng"],
}

export const fng: Material = {
	id: "fng",
	name: "FNG",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_fng",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["white_rose", "co"],
}

export const talentRoseSet: MaterialSet = [fng, co, whiteRose]

export const blackHat: Material = {
	id: "black_hat",
	name: "Black Hat",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_black_hat",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["known_weariness", "first_expectations"],
}

export const knownWeariness: Material = {
	id: "known_weariness",
	name: "Known Weariness",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_known_weariness",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["black_hat", "first_expectations"],
}

export const firstExpectations: Material = {
	id: "first_expectations",
	name: "First Expectations",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_first_expectations",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["black_hat", "known_weariness"],
}

export const talentMagicSet: MaterialSet = [
	firstExpectations,
	knownWeariness,
	blackHat,
]

export const heartRacingNight: Material = {
	id: "heart_racing_night",
	name: "Heart-Racing Night",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_heart_racing_night",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["resonance_of_faith", "synchronicity_of_thought"],
}

export const resonanceOfFaith: Material = {
	id: "resonance_of_faith",
	name: "Resonance of Faith",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_resonance_of_faith",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["heart_racing_night", "synchronicity_of_thought"],
}

export const synchronicityOfThought: Material = {
	id: "synchronicity_of_thought",
	name: "Synchronicity of Thought",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_synchronicity_of_thought",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["heart_racing_night", "resonance_of_faith"],
}

export const talentHeartSet: MaterialSet = [
	synchronicityOfThought,
	resonanceOfFaith,
	heartRacingNight,
]

export const theSecondSelf: Material = {
	id: "the_second_self",
	name: "The Second Self",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_the_second_self",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["suspended_whispers", "hesitation_of_the_waves"],
}

export const suspendedWhispers: Material = {
	id: "suspended_whispers",
	name: "Suspended Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_suspended_whispers",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_second_self", "hesitation_of_the_waves"],
}

export const hesitationOfTheWaves: Material = {
	id: "hesitation_of_the_waves",
	name: "Hesitation of the Waves",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_hesitation_of_the_waves",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_second_self", "suspended_whispers"],
}

export const talentTarotSet: MaterialSet = [
	hesitationOfTheWaves,
	suspendedWhispers,
	theSecondSelf,
]

export const dreamlessSeed: Material = {
	id: "dreamless_seed",
	name: "Dreamless Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/city_dreamless_seed",
	sources: ["Daily Activity", "Fair Exchange", "Hunter Exchange"],
}

/* Weapon Ascension */
export const goldenAppleSeed: Material = {
	id: "golden_apple_seed",
	name: "Golden Apple Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_golden_appleseed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["silver_apple_seed", "iron_apple_seed"],
}

export const silverAppleSeed: Material = {
	id: "silver_apple_seed",
	name: "Silver Apple Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_silver_appleseed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["golden_apple_seed", "iron_apple_seed"],
}

export const ironAppleSeed: Material = {
	id: "iron_apple_seed",
	name: "Iron Apple Seed",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_iron_appleseed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["golden_apple_seed", "silver_apple_seed"],
}

export const ascAppleSeedSet: MaterialSet = [
	ironAppleSeed,
	silverAppleSeed,
	goldenAppleSeed,
]

export const harmony: Material = {
	id: "harmony",
	name: "Harmony",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_harmony",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["versey", "beaty"],
}

export const versey: Material = {
	id: "versey",
	name: "Versey",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_versey",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["harmony", "beaty"],
}

export const beaty: Material = {
	id: "beaty",
	name: "Beaty",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_beaty",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["harmony", "versey"],
}

export const ascMuiscSet: MaterialSet = [beaty, versey, harmony]

export const liquidDreamCan: Material = {
	id: "liquid_dream_can",
	name: "Liquid Dream Can",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_liquid_dream_can",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["liquid_dream_travel_kit", "liquid_dream_trial_kit"],
}

export const liquidDreamTravelKit: Material = {
	id: "liquid_dream_travel_kit",
	name: "Liquid Dream Travel Kit",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_liquid_dream_travel_kit",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["liquid_dream_can", "liquid_dream_trial_kit"],
}

export const liquidDreamTrialKit: Material = {
	id: "liquid_dream_trial_kit",
	name: "Liquid Dream Trial Kit",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_liquid_dream_trial_kit",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["liquid_dream_can", "liquid_dream_travel_kit"],
}

export const ascLiquidDreamSet: MaterialSet = [
	liquidDreamTrialKit,
	liquidDreamTravelKit,
	liquidDreamCan,
]

export const specialColdDessert: Material = {
	id: "special_cold_dessert",
	name: "Special Cold Dessert",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_special_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["plain_cold_dessert", "flavorless_cold_dessert"],
}

export const plainColdDessert: Material = {
	id: "plain_cold_dessert",
	name: "Plain Cold Dessert",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_plain_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["special_cold_dessert", "flavorless_cold_dessert"],
}

export const flavorlessColdDessert: Material = {
	id: "flavorless_cold_dessert",
	name: "Flavorless Cold Dessert",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_flavorless_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["special_cold_dessert", "plain_cold_dessert"],
}

export const ascColdDessertSet: MaterialSet = [
	flavorlessColdDessert,
	plainColdDessert,
	specialColdDessert,
]

export const collectorsDramaCore: Material = {
	id: "collectors_drama_core",
	name: "Collector's Drama Core",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_collectors_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["master_drama_core", "beginner_drama_core"],
}

export const masterDramaCore: Material = {
	id: "master_drama_core",
	name: "Master Drama Core",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_master_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["collectors_drama_core", "beginner_drama_core"],
}

export const beginnerDramaCore: Material = {
	id: "beginner_drama_core",
	name: "Beginner Drama Core",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_beginner_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["collectors_drama_core", "master_drama_core"],
}

export const ascDramaCoreSet: MaterialSet = [
	beginnerDramaCore,
	masterDramaCore,
	collectorsDramaCore,
]

/* Weapon Experience */
export const chaoticDye: Material = {
	id: "chaotic_dye",
	name: "Chaotic Dye",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponExp,
	imageSrc: "/wpexp_chaotic_dye",
	sources: [
		"Houdinii's Magic Stage",
		"Hunter Exchange",
		"Material Selection Box",
	],
	linkedMaterials: ["colorless_dye", "light_dye"],
}

export const colorlessDye: Material = {
	id: "colorless_dye",
	name: "Colorless Dye",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponExp,
	imageSrc: "/wpexp_colorless_dye",
	sources: [
		"Houdinii's Magic Stage",
		"Hunter Exchange",
		"Material Selection Box",
	],
	linkedMaterials: ["chaotic_dye", "light_dye"],
}

export const lightDye: Material = {
	id: "light_dye",
	name: "Light Dye",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponExp,
	imageSrc: "/wpexp_light_dye",
	sources: [
		"Houdinii's Magic Stage",
		"Hunter Exchange",
		"Material Selection Box",
	],
	linkedMaterials: ["chaotic_dye", "colorless_dye"],
}

export const expDyeSet: MaterialSet = [lightDye, colorlessDye, chaoticDye]
