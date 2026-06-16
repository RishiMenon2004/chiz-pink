export type Material = {
	id: string,
	name: string;
	quantity?: number;
	description?: string;
	rarity: EnumRarity;
	materialType: EnumMaterialType;
	src: string,
	sources: string[];
}

export enum EnumRarity {
	Common = 2,
	Uncommon = 3,
	Rare = 4,
	Epic = 5
}

export enum EnumMaterialType {
	CharacterExp,
	CharacterAscension,
	BossDrop,
	Talent,
	WeaponAscension,
	WeaponExp,
	Currency,
	Other,
}

/* Currencies */
const beetleCoin: Material = {
	id: "beetle_coin",
	name: "Beetle Coin",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Currency,
	src: "/currency_beetle_coin",
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const fons: Material = {
	id: "fons",
	name: "Fons",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Currency,
	src: "/currency_fons",
	sources: ["Hethereau Hobbies", "Fair Exchange",]
}

/* Weekly Boss Drops - Talent*/
const goodBoyStamp: Material = {
	id: "good_boy_stamp",
	name: "Good Boy Stamp",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.BossDrop,
	src: "/weekly_good_boy_stamp",
	sources: ["Anomaly Pilgrimage: \"Morphix\"",]
}

const dressSleevesOfVanity: Material = {
	id: "dress_sleeves_of_vanity",
	name: "Dress Sleeves of Vanity",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.BossDrop,
	src: "/weekly_dress_sleeves_of_vanity",
	sources: ["Anomaly Pilgrimage: \"The Never-ending Arachne\"",]
}

const eternalMemory: Material = {
	id: "eternal_memory",
	name: "Eternal Memory",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.BossDrop,
	src: "/eternal_memory",
	sources: ["Anomaly Pilgrimage: \"Debt Collector\"",]
}

/* Character Experience */
const eliteHunterGuide: Material = {
	id: "elite_hunter_guide",
	name: "Elite Hunter Guide",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterExp,
	src: "/exp_elite_hunter_guide",
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const seniorHunterGuide: Material = {
	id: "senior_hunter_guide",
	name: "Senior Hunter Guide",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterExp,
	src: "/exp_senior_hunter_guide",
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const risingHunterGuide: Material = {
	id: "rising_hunter_guide",
	name: "Rising Hunter Guide",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterExp,
	src: "/exp_rising_hunter_guide",
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

/* Character Ascension */
const paradoxicalWhispers: Material = {
	id: "paradoxical_whispers",
	name: "Paradoxical Whispers",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_paradoxical_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const obscureWhispers: Material = {
	id: "obscure_whispers",
	name: "Obscure Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_obscure_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const lostWhispers: Material = {
	id: "lost_whispers",
	name: "Lost Whispers",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_lost_whispers",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const chaosSilhouette: Material = {
	id: "chaos_silhouette",
	name: "Chaos Silhouette",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_chaos_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const blurredSilhouette: Material = {
	id: "blurred_silhouette",
	name: "Blurred Silhouette",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_blurred_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const fadingSilhouette: Material = {
	id: "fading_silhouette",
	name: "Fading Silhouette",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_fading_silhouette",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const distortedNumeral: Material = {
	id: "distorted_numeral",
	name: "Distorted Numeral",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_distorted_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const unsolvedNumeral: Material = {
	id: "unsolved_numeral",
	name: "Unsolved Numeral",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_unsolved_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const blurredNumeral: Material = {
	id: "blurred_numeral",
	name: "Blurred Numeral",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_blurred_numeral",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const transcendentDelusions: Material = {
	id: "transcendent_delusions",
	name: "Transcendent Delusions",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_transcendent_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const yearningDelusions: Material = {
	id: "yearning_delusions",
	name: "Yearning Delusions",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_yearning_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const suspendedDelusions: Material = {
	id: "suspended_delusions",
	name: "Suspended Delusions",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	src: "/ascension_suspended_delusions",
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

/* Boss Drops - Character Ascension */
const waterMoonPick: Material = {
	id: "water_moon_pick",
	name: "Water Moon Pick",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	src: "/boss_water_moon_pick",
	sources: ["Anomaly Hunt: \"Beat King\"", "Material Selection Box",]
}

const chargingKnightSparkPlug: Material = {
	id: "charging_knight_spark_plug",
	name: "Charging Knight Spark Plug",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	src: "/boss_charging_knight_spark_plug",
	sources: ["Anomaly Hunt: \"Headless Rider\"", "Material Selection Box",]
}

const ConfessionalFLowerSeed: Material = {
	id: "confessional_flower_seed",
	name: "Confessional Flower Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	src: "/boss_confessional_flower_seed",
	sources: ["Anomaly Hunt: \"Serenetti\"", "Material Selection Box",]
}

const aPageFromDelusionsShore: Material = {
	id: "a_page_from_delusions_shore",
	name: "A Page from Delusion's Shore",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	src: "/boss_a_page_from_delusions_shore",
	sources: ["Anomaly Hunt: \"Black Tome\"", "Material Selection Box",]
}

const tearOfTheSea: Material = {
	id: "tear_of_the_sea",
	name: "Tear of The Sea",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	src: "/boss_tear_of_the_sea",
	sources: ["Anomaly Hunt: \"Sea Prisoner\"", "Material Selection Box",]
}

const nestGuardFragment: Material = {
	id: "nest_guard_fragment",
	name: "Nest Guard Fragment",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	src: "/boss_nest_guard_fragment",
	sources: ["Anomaly Hunt: \"Nestbound Bird\"", "Material Selection Box",]
}

const colorfulTicketStub: Material = {
	id: "colorful_ticket_stub",
	name: "Colorful Ticket Stub",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	src: "/boss_colorful_ticket_stub",
	sources: ["Anomaly Hunt: \"Swallowtail\"", "Material Selection Box",]
}

/* Talent */
const theOliveBranch: Material = {
	id: "the_olive_branch",
	name: "The Olive Branch",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	src: "/skill_the_olive_branch",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const dovesFlutter: Material = {
	id: "doves_flutter",
	name: "Dove's Flutter",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	src: "/skill_doves_flutter",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const nestlingsLonging: Material = {
	id: "nestlings_longing",
	name: "Nestling's Longing",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	src: "/skill_nestlings_longing",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const whiteRose: Material = {
	id: "white_rose",
	name: "White Rose",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	src: "/skill_white_rose",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const co: Material = {
	id: "co",
	name: "CO",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	src: "/skill_co",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const fng: Material = {
	id: "fng",
	name: "FNG",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	src: "/skill_fng",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const blackHat: Material = {
	id: "black_hat",
	name: "Black Hat",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	src: "/skill_black_hat",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const knownWeariness: Material = {
	id: "known_weariness",
	name: "Known Weariness",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	src: "/skill_known_weariness",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const firstExpectations: Material = {
	id: "first_expectations",
	name: "First Expectations",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	src: "/skill_first_expectations",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const heartRacingNight: Material = {
	id: "heart_racing_night",
	name: "Heart-Racing Night",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	src: "/skill_heart_racing_night",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const resonanceOfFaith: Material = {
	id: "resonance_of_faith",
	name: "Resonance of Faith",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	src: "/skill_resonance_of_faith",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const synchronicityOfThought: Material = {
	id: "synchronicity_of_thought",
	name: "Synchronicity of Thought",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	src: "/skill_synchrnicity_of_thought",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const theSecondSelf: Material = {
	id: "the_second_self",
	name: "The Second Self",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	src: "/skill_the_second_self",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const suspendedWhispers: Material = {
	id: "suspended_whispers",
	name: "Suspended Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	src: "/skill_suspended_whispers",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const hesitationOfTheWaves: Material = {
	id: "hesitation_of_the_waves",
	name: "Hesitation of the Waves",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	src: "/skill_hesitation_of_the_waves",
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const dreamlessSeed: Material = {
	id: "dreamless_seed",
	name: "Dreamless Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	src: "/city_dreamless_seed",
	sources: ["Daily Activity", "Fair Exchange", "Hunter Exchange",]
}

/* Weapon Ascension */
const goldenAppleSeed: Material = {
	id: "golden_apple_seed",
	name: "Golden Apple Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_golden_apple_seed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const silverAppleSeed: Material = {
	id: "silver_apple_seed",
	name: "Silver Apple Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_silver_apple_seed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const ironAppleSeed: Material = {
	id: "iron_apple_seed",
	name: "Iron Apple Seed",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_iron_apple_seed",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const harmony: Material = {
	id: "harmony",
	name: "Harmony",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_harmony",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const versey: Material = {
	id: "versey",
	name: "Versey",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_versey",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const beaty: Material = {
	id: "beaty",
	name: "Beaty",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_beaty",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const liquidDreamCan: Material = {
	id: "liquid_dream_can",
	name: "Liquid Dream Can",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_liquid_dream_can",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const liquidDreamTravelKit: Material = {
	id: "liquid_dream_travel_kit",
	name: "Liquid Dream Travel Kit",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_liquid_dream_travel_kit",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const liquidDreamTrialKit: Material = {
	id: "liquid_dream_trial_kit",
	name: "Liquid Dream Trial Kit",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_liquid_dream_trial_kit",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const specialColdDessert: Material = {
	id: "special_cold_dessert",
	name: "Special Cold Dessert",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_special_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const plainColdDessert: Material = {
	id: "plain_cold_dessert",
	name: "Plain Cold Dessert",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_plain_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const flavorlessColdDessert: Material = {
	id: "flavorless_cold_dessert",
	name: "Flavorless Cold Dessert",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_flavorless_cold_dessert",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const collectorsDramaCore: Material = {
	id: "collectors_drama_core",
	name: "Collector's Drama Core",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_collectors_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const masterDramaCore: Material = {
	id: "master_drama_core",
	name: "Master Drama Core",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_master_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const beginnerDramaCore: Material = {
	id: "beginner_drama_core",
	name: "Beginner Drama Core",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	src: "/wpascension_beginner_drama_core",
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

/* Weapon Experience */
const chaoticDye: Material = {
	id: "chaotic_dye",
	name: "Chaotic Dye",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponExp,
	src: "/wpexp_chaotic_dye",
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const colorlessDye: Material = {
	id: "colorless_dye",
	name: "Colorless Dye",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponExp,
	src: "/wpexp_colorless_dye",
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const lightDye: Material = {
	id: "light_dye",
	name: "Light Dye",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponExp,
	src: "/wpexp_light_dye",
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

export default function getAllMaterials(): {[key: string]: Material} { return {

	/* epic */
	"good_boy_stamp": goodBoyStamp,
	"dress_sleeves_of_vanity": dressSleevesOfVanity,
	"eternal_memory": eternalMemory,

	/* rare */
	"elite_hunter_guide": eliteHunterGuide,

	"paradoxical_whispers": paradoxicalWhispers,
	"chaos_silhouette": chaosSilhouette,
	"distorted_numeral": distortedNumeral,
	"transcendent_delusions": transcendentDelusions,

	"water_moon_pick": waterMoonPick,
	"charging_knight_spark_plug": chargingKnightSparkPlug,
	"confessional_flower_seed": ConfessionalFLowerSeed,
	"a_page_from_delusions_shore": aPageFromDelusionsShore,
	"tear_of_the_sea": tearOfTheSea,
	"nest_guard_fragment": nestGuardFragment,
	"colorful_ticket_stub": colorfulTicketStub,

	"the_olive_branch": theOliveBranch,
	"white_rose": whiteRose,
	"black_hat": blackHat,
	"heart_racing_night": heartRacingNight,
	"the_second_self": theSecondSelf,

	"golden_apple_seed": goldenAppleSeed,
	"harmony": harmony,
	"liquid_dream_can": liquidDreamCan,
	"special_cold_dessert": specialColdDessert,
	"collectors_drama_core": collectorsDramaCore,

	"chaotic_dye": chaoticDye,


	/* uncommon */
	"senior_hunter_guide": seniorHunterGuide,

	"obscure_whispers": obscureWhispers,
	"blurred_silhouette": blurredSilhouette,
	"unsolved_numeral": unsolvedNumeral,
	"yearning_delusions": yearningDelusions,

	"doves_flutter": dovesFlutter,
	"co": co,
	"known_weariness": knownWeariness,
	"resonance_of_faith": resonanceOfFaith,
	"suspended_whispers": suspendedWhispers,

	"silver_apple_seed": silverAppleSeed,
	"versey": versey,
	"liquid_dream_travel_kit": liquidDreamTravelKit,
	"plain_cold_dessert": plainColdDessert,
	"master_drama_core": masterDramaCore,

	"colorless_dye": colorlessDye,
	
	/* common  */
	"rising_hunter_guide": risingHunterGuide,

	"lost_whispers": lostWhispers,
	"fading_silhouette": fadingSilhouette,
	"blurred_numeral": blurredNumeral,
	"suspended_delusions": suspendedDelusions,

	"nestlings_longing": nestlingsLonging,
	"fng": fng,
	"first_expectations": firstExpectations,
	"synchronicity_of_thought": synchronicityOfThought,
	"hesitation_of_the_waves": hesitationOfTheWaves,

	"iron_apple_seed": ironAppleSeed,
	"beaty": beaty,
	"liquid_dream_trial_kit": liquidDreamTrialKit,
	"flavorless_cold_dessert": flavorlessColdDessert,
	"beginner_drama_core": beginnerDramaCore,

	"light_dye": lightDye,
}}

export async function setDefaultInventory() {
	const inventory = JSON.stringify(Object.keys(getAllMaterials()).reduce((acc, key) => {
		acc[key] = 0;
		return acc;
	}, {} as {[key: string]: number}));

	await navigator.clipboard.writeText(inventory);
}

export {beetleCoin, fons, goodBoyStamp, dressSleevesOfVanity, eternalMemory, eliteHunterGuide, seniorHunterGuide, risingHunterGuide, paradoxicalWhispers, obscureWhispers, lostWhispers, chaosSilhouette, blurredSilhouette, fadingSilhouette, distortedNumeral, unsolvedNumeral, blurredNumeral, transcendentDelusions, yearningDelusions, suspendedDelusions, waterMoonPick, chargingKnightSparkPlug, ConfessionalFLowerSeed, aPageFromDelusionsShore, tearOfTheSea, nestGuardFragment, colorfulTicketStub, theOliveBranch, dovesFlutter, nestlingsLonging, whiteRose, co, fng, blackHat, knownWeariness, firstExpectations, heartRacingNight, resonanceOfFaith, synchronicityOfThought, theSecondSelf, suspendedWhispers, hesitationOfTheWaves, dreamlessSeed, goldenAppleSeed, silverAppleSeed, ironAppleSeed, harmony, versey, beaty, liquidDreamCan, liquidDreamTravelKit, liquidDreamTrialKit, specialColdDessert, plainColdDessert, flavorlessColdDessert, collectorsDramaCore, masterDramaCore, beginnerDramaCore, chaoticDye, colorlessDye, lightDye};
