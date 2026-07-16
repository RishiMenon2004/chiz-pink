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
}

/* Currencies */
const beetleCoin: Material = {
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

const fons: Material = {
	id: "fons",
	name: "Fons",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Currency,
	imageSrc: "/currency_fons",
	sources: ["Hethereau Hobbies", "Fair Exchange"],
}

/* Weekly Boss Drops - Talent*/
const goodBoyStamp: Material = {
	id: "good_boy_stamp",
	name: "Good Boy Stamp",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.WeeklyBossDrop,
	imageSrc: "/weekly_good_boy_stamp",
	sources: ['Anomaly Pilgrimage: "Morphix"'],
}

const dressSleevesOfVanity: Material = {
	id: "dress_sleeves_of_vanity",
	name: "Dress Sleeves of Vanity",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.WeeklyBossDrop,
	imageSrc: "/weekly_dress_sleeves_of_vanity",
	sources: ['Anomaly Pilgrimage: "The Never-ending Arachne"'],
}

const eternalMemory: Material = {
	id: "eternal_memory",
	name: "Eternal Memory",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.WeeklyBossDrop,
	imageSrc: "/weekly_eternal_memory",
	sources: ['Anomaly Pilgrimage: "Debt Collector"'],
}

/* Character Experience */
const eliteHunterGuide: Material = {
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

const seniorHunterGuide: Material = {
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

const risingHunterGuide: Material = {
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

const expHunterGuideSet: MaterialSet = [
	risingHunterGuide,
	seniorHunterGuide,
	eliteHunterGuide,
]

/* Character Ascension */
const paradoxicalWhispers: Material = {
	id: "paradoxical_whispers",
	name: "Paradoxical Whispers",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_paradoxical_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["obscure_whispers", "lost_whispers"],
}

const obscureWhispers: Material = {
	id: "obscure_whispers",
	name: "Obscure Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_obscure_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["paradoxical_whispers", "lost_whispers"],
}

const lostWhispers: Material = {
	id: "lost_whispers",
	name: "Lost Whispers",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_lost_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["paradoxical_whispers", "obscure_whispers"],
}

const ascWhispersSet: MaterialSet = [
	lostWhispers,
	obscureWhispers,
	paradoxicalWhispers,
]

const chaosSilhouette: Material = {
	id: "chaos_silhouette",
	name: "Chaos Silhouette",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_chaos_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["blurred_silhouette", "fading_silhouette"],
}

const blurredSilhouette: Material = {
	id: "blurred_silhouette",
	name: "Blurred Silhouette",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_blurred_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["chaos_silhouette", "fading_silhouette"],
}

const fadingSilhouette: Material = {
	id: "fading_silhouette",
	name: "Fading Silhouette",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_fading_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["chaos_silhouette", "blurred_silhouette"],
}

const ascSilhouetteSet: MaterialSet = [
	fadingSilhouette,
	blurredSilhouette,
	chaosSilhouette,
]

const distortedNumeral: Material = {
	id: "distorted_numeral",
	name: "Distorted Numeral",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_distorted_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["unsolved_numeral", "blurred_numeral"],
}

const unsolvedNumeral: Material = {
	id: "unsolved_numeral",
	name: "Unsolved Numeral",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_unsolved_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["distorted_numeral", "blurred_numeral"],
}

const blurredNumeral: Material = {
	id: "blurred_numeral",
	name: "Blurred Numeral",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_blurred_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["distorted_numeral", "unsolved_numeral"],
}

const ascNumeralSet: MaterialSet = [
	blurredNumeral,
	unsolvedNumeral,
	distortedNumeral,
]

const transcendentDelusions: Material = {
	id: "transcendent_delusions",
	name: "Transcendent Delusions",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_transcendent_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["yearning_delusions", "suspended_delusions"],
}

const yearningDelusions: Material = {
	id: "yearning_delusions",
	name: "Yearning Delusions",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_yearning_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["transcendent_delusions", "suspended_delusions"],
}

const suspendedDelusions: Material = {
	id: "suspended_delusions",
	name: "Suspended Delusions",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	imageSrc: "/ascension_suspended_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange"],
	linkedMaterials: ["transcendent_delusions", "yearning_delusions"],
}

const ascDelusionsSet: MaterialSet = [
	suspendedDelusions,
	yearningDelusions,
	transcendentDelusions,
]

/* Boss Drops - Character Ascension */
const waterMoonPick: Material = {
	id: "water_moon_pick",
	name: "Water Moon Pick",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_water_moon_pick",
	sources: ['Anomaly Hunt: "Beat King"', "Material Selection Box"],
}

const chargingKnightSparkPlug: Material = {
	id: "charging_knight_spark_plug",
	name: "Charging Knight Spark Plug",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_charging_knight_spark_plug",
	sources: ['Anomaly Hunt: "Headless Rider"', "Material Selection Box"],
}

const ConfessionalFLowerSeed: Material = {
	id: "confessional_flower_seed",
	name: "Confessional Flower Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_confessional_flower_seed",
	sources: ['Anomaly Hunt: "Serenetti"', "Material Selection Box"],
}

const aPageFromDelusionsShore: Material = {
	id: "a_page_from_delusions_shore",
	name: "A Page from Delusion's Shore",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_a_page_from_delusions_shore",
	sources: ['Anomaly Hunt: "Black Tome"', "Material Selection Box"],
}

const tearOfTheSea: Material = {
	id: "tear_of_the_sea",
	name: "Tear of The Sea",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_tear_of_the_sea",
	sources: ['Anomaly Hunt: "Sea Prisoner"', "Material Selection Box"],
}

const nestGuardFragment: Material = {
	id: "nest_guard_fragment",
	name: "Nest Guard Fragment",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_nest_guard_fragment",
	sources: ['Anomaly Hunt: "Nestbound Bird"', "Material Selection Box"],
}

const colorfulTicketStub: Material = {
	id: "colorful_ticket_stub",
	name: "Colorful Ticket Stub",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	imageSrc: "/boss_colorful_ticket_stub",
	sources: ['Anomaly Hunt: "Swallowtail"', "Material Selection Box"],
}

/* Talent */
const theOliveBranch: Material = {
	id: "the_olive_branch",
	name: "The Olive Branch",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_the_olive_branch",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["doves_flutter", "nestlings_longing"],
}

const dovesFlutter: Material = {
	id: "doves_flutter",
	name: "Dove's Flutter",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_doves_flutter",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_olive_branch", "nestlings_longing"],
}

const nestlingsLonging: Material = {
	id: "nestlings_longing",
	name: "Nestling's Longing",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_nestlings_longing",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_olive_branch", "doves_flutter"],
}

const talentBirdSet: MaterialSet = [
	nestlingsLonging,
	dovesFlutter,
	theOliveBranch,
]

const whiteRose: Material = {
	id: "white_rose",
	name: "White Rose",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_white_rose",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["co", "fng"],
}

const co: Material = {
	id: "co",
	name: "CO",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_co",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["white_rose", "fng"],
}

const fng: Material = {
	id: "fng",
	name: "FNG",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_fng",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["white_rose", "co"],
}

const talentRoseSet: MaterialSet = [fng, co, whiteRose]

const blackHat: Material = {
	id: "black_hat",
	name: "Black Hat",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_black_hat",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["known_weariness", "first_expectations"],
}

const knownWeariness: Material = {
	id: "known_weariness",
	name: "Known Weariness",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_known_weariness",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["black_hat", "first_expectations"],
}

const firstExpectations: Material = {
	id: "first_expectations",
	name: "First Expectations",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_first_expectations",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["black_hat", "known_weariness"],
}

const talentMagicSet: MaterialSet = [firstExpectations, knownWeariness, blackHat]

const heartRacingNight: Material = {
	id: "heart_racing_night",
	name: "Heart-Racing Night",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_heart_racing_night",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["resonance_of_faith", "synchronicity_of_thought"],
}

const resonanceOfFaith: Material = {
	id: "resonance_of_faith",
	name: "Resonance of Faith",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_resonance_of_faith",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["heart_racing_night", "synchronicity_of_thought"],
}

const synchronicityOfThought: Material = {
	id: "synchronicity_of_thought",
	name: "Synchronicity of Thought",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_synchronicity_of_thought",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["heart_racing_night", "resonance_of_faith"],
}

const talentHeartSet: MaterialSet = [
	synchronicityOfThought,
	resonanceOfFaith,
	heartRacingNight,
]

const theSecondSelf: Material = {
	id: "the_second_self",
	name: "The Second Self",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_the_second_self",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["suspended_whispers", "hesitation_of_the_waves"],
}

const suspendedWhispers: Material = {
	id: "suspended_whispers",
	name: "Suspended Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_suspended_whispers",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_second_self", "hesitation_of_the_waves"],
}

const hesitationOfTheWaves: Material = {
	id: "hesitation_of_the_waves",
	name: "Hesitation of the Waves",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/skill_hesitation_of_the_waves",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["the_second_self", "suspended_whispers"],
}

const talentTarotSet: MaterialSet = [
	hesitationOfTheWaves,
	suspendedWhispers,
	theSecondSelf,
]

const dreamlessSeed: Material = {
	id: "dreamless_seed",
	name: "Dreamless Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	imageSrc: "/city_dreamless_seed",
	sources: ["Daily Activity", "Fair Exchange", "Hunter Exchange"],
}

/* Weapon Ascension */
const goldenAppleSeed: Material = {
	id: "golden_apple_seed",
	name: "Golden Apple Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_golden_appleseed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["silver_apple_seed", "iron_apple_seed"],
}

const silverAppleSeed: Material = {
	id: "silver_apple_seed",
	name: "Silver Apple Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_silver_appleseed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["golden_apple_seed", "iron_apple_seed"],
}

const ironAppleSeed: Material = {
	id: "iron_apple_seed",
	name: "Iron Apple Seed",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_iron_appleseed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["golden_apple_seed", "silver_apple_seed"],
}

const ascAppleSeedSet: MaterialSet = [
	ironAppleSeed,
	silverAppleSeed,
	goldenAppleSeed,
]

const harmony: Material = {
	id: "harmony",
	name: "Harmony",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_harmony",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["versey", "beaty"],
}

const versey: Material = {
	id: "versey",
	name: "Versey",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_versey",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["harmony", "beaty"],
}

const beaty: Material = {
	id: "beaty",
	name: "Beaty",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_beaty",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["harmony", "versey"],
}

const ascMuiscSet: MaterialSet = [beaty, versey, harmony]

const liquidDreamCan: Material = {
	id: "liquid_dream_can",
	name: "Liquid Dream Can",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_liquid_dream_can",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["liquid_dream_travel_kit", "liquid_dream_trial_kit"],
}

const liquidDreamTravelKit: Material = {
	id: "liquid_dream_travel_kit",
	name: "Liquid Dream Travel Kit",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_liquid_dream_travel_kit",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["liquid_dream_can", "liquid_dream_trial_kit"],
}

const liquidDreamTrialKit: Material = {
	id: "liquid_dream_trial_kit",
	name: "Liquid Dream Trial Kit",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_liquid_dream_trial_kit",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["liquid_dream_can", "liquid_dream_travel_kit"],
}

const ascLiquidDreamSet: MaterialSet = [
	liquidDreamTrialKit,
	liquidDreamTravelKit,
	liquidDreamCan,
]

const specialColdDessert: Material = {
	id: "special_cold_dessert",
	name: "Special Cold Dessert",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_special_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["plain_cold_dessert", "flavorless_cold_dessert"],
}

const plainColdDessert: Material = {
	id: "plain_cold_dessert",
	name: "Plain Cold Dessert",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_plain_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["special_cold_dessert", "flavorless_cold_dessert"],
}

const flavorlessColdDessert: Material = {
	id: "flavorless_cold_dessert",
	name: "Flavorless Cold Dessert",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_flavorless_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["special_cold_dessert", "plain_cold_dessert"],
}

const ascColdDessertSet: MaterialSet = [
	flavorlessColdDessert,
	plainColdDessert,
	specialColdDessert,
]

const collectorsDramaCore: Material = {
	id: "collectors_drama_core",
	name: "Collector's Drama Core",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_collectors_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["master_drama_core", "beginner_drama_core"],
}

const masterDramaCore: Material = {
	id: "master_drama_core",
	name: "Master Drama Core",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_master_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["collectors_drama_core", "beginner_drama_core"],
}

const beginnerDramaCore: Material = {
	id: "beginner_drama_core",
	name: "Beginner Drama Core",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	imageSrc: "/wpascension_beginner_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box"],
	linkedMaterials: ["collectors_drama_core", "master_drama_core"],
}

const ascDramaCoreSet: MaterialSet = [
	beginnerDramaCore,
	masterDramaCore,
	collectorsDramaCore,
]

/* Weapon Experience */
const chaoticDye: Material = {
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

const colorlessDye: Material = {
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

const lightDye: Material = {
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

const expDyeSet: MaterialSet = [lightDye, colorlessDye, chaoticDye]

export {
	beetleCoin,
	fons,
	goodBoyStamp,
	dressSleevesOfVanity,
	eternalMemory,
	eliteHunterGuide,
	seniorHunterGuide,
	risingHunterGuide,
	expHunterGuideSet,
	paradoxicalWhispers,
	obscureWhispers,
	lostWhispers,
	ascWhispersSet,
	chaosSilhouette,
	blurredSilhouette,
	fadingSilhouette,
	ascSilhouetteSet,
	distortedNumeral,
	unsolvedNumeral,
	blurredNumeral,
	ascNumeralSet,
	transcendentDelusions,
	yearningDelusions,
	suspendedDelusions,
	ascDelusionsSet,
	waterMoonPick,
	chargingKnightSparkPlug,
	ConfessionalFLowerSeed,
	aPageFromDelusionsShore,
	tearOfTheSea,
	nestGuardFragment,
	colorfulTicketStub,
	theOliveBranch,
	dovesFlutter,
	nestlingsLonging,
	talentBirdSet,
	whiteRose,
	co,
	fng,
	talentRoseSet,
	blackHat,
	knownWeariness,
	firstExpectations,
	talentMagicSet,
	heartRacingNight,
	resonanceOfFaith,
	synchronicityOfThought,
	talentHeartSet,
	theSecondSelf,
	suspendedWhispers,
	hesitationOfTheWaves,
	talentTarotSet,
	dreamlessSeed,
	goldenAppleSeed,
	silverAppleSeed,
	ironAppleSeed,
	ascAppleSeedSet,
	harmony,
	versey,
	beaty,
	ascMuiscSet,
	liquidDreamCan,
	liquidDreamTravelKit,
	liquidDreamTrialKit,
	ascLiquidDreamSet,
	specialColdDessert,
	plainColdDessert,
	flavorlessColdDessert,
	ascColdDessertSet,
	collectorsDramaCore,
	masterDramaCore,
	beginnerDramaCore,
	ascDramaCoreSet,
	chaoticDye,
	colorlessDye,
	lightDye,
	expDyeSet,
}
