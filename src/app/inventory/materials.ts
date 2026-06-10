export type Material = {
	name: string;
	quantity?: number;
	description?: string;
	rarity: EnumRarity;
	materialType: EnumMaterialType;
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
	name: "Beetle Coin",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Currency,
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const fons: Material = {
	name: "Fons",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Currency,
	sources: ["Hethereau Hobbies", "Fair Exchange",]
}

/* Boss Drops - Talent*/
const goodBoyStamp: Material = {
	name: "Good Boy Stamp",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Pilgrimage: \"Morphix\"",]
}

const dressSleevesOfVanity: Material = {
	name: "Dress Sleeves of Vanity",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Pilgrimage: \"The Never-ending Arachne\"",]
}

const eternalMemory: Material = {
	name: "Eternal Memory",
	rarity: EnumRarity.Epic,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Pilgrimage: \"Debt Collector\"",]
}

/* Character Experience */
const eliteHunterGuide: Material = {
	name: "Elite Hunter Guide",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterExp,
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const seniorHunterGuide: Material = {
	name: "Senior Hunter Guide",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterExp,
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const risingHunterGuide: Material = {
	name: "Rising Hunter Guide",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterExp,
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

/* Character Ascension */
const paradoxicalWhispers: Material = {
	name: "Paradoxical Whispers",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const obscureWhispers: Material = {
	name: "Obscure Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const lostWhispers: Material = {
	name: "Lost Whispers",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const chaosSilhouette: Material = {
	name: "Chaos Silhouette",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const blurredSilhouette: Material = {
	name: "Blurred Silhouette",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const fadingSilhouette: Material = {
	name: "Fading Silhouette",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const distortedNumeral: Material = {
	name: "Distorted Numeral",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const unsolvedNumeral: Material = {
	name: "Unsolved Numeral",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const blurredNumeral: Material = {
	name: "Blurred Numeral",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const transcendentDelusions: Material = {
	name: "Transcendent Delusions",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const yearningDelusions: Material = {
	name: "Yearning Delusions",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

const suspendedDelusions: Material = {
	name: "Suspended Delusions",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.CharacterAscension,
	sources: ["Anomaly Drop", "Crafting", "Hunter Exchange",]
}

/* Boss Drops - Character Ascension */
const waterMoonPick: Material = {
	name: "Water Moon Pick",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Hunt: \"Beat King\"", "Material Selection Box",]
}

const chargingKnightSparkPlug: Material = {
	name: "Charging Knight Spark Plug",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Hunt: \"Headless Rider\"", "Material Selection Box",]
}

const ConfessionalFLowerSeed: Material = {
	name: "Confessional Flower Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Hunt: \"Serenetti\"", "Material Selection Box",]
}

const aPageFromDelusionsShore: Material = {
	name: "A Page from Delusion's Shore",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Hunt: \"Black Tome\"", "Material Selection Box",]
}

const tearOfTheSea: Material = {
	name: "Tear of The Sea",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Hunt: \"Sea Prisoner\"", "Material Selection Box",]
}

const nestGuardFragment: Material = {
	name: "Nest Guard Fragment",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Hunt: \"Nestbound Bird\"", "Material Selection Box",]
}

const colorfulTicketStub: Material = {
	name: "Colorful Ticket Stub",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.BossDrop,
	sources: ["Anomaly Hunt: \"Swallowtail\"", "Material Selection Box",]
}

/* Talent */
const theOliveBranch: Material = {
	name: "The Olive Branch",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const dovesFlutter: Material = {
	name: "Dove's Flutter",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const nestlingsLonging: Material = {
	name: "Nestling's Longing",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const whiteRose: Material = {
	name: "White Rose",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const co: Material = {
	name: "CO",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const fng: Material = {
	name: "FNG",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const blackHat: Material = {
	name: "Black Hat",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const knownWeariness: Material = {
	name: "Known Weariness",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const firstExpectations: Material = {
	name: "First Expectations",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const heartRacingNight: Material = {
	name: "Heart-Racing Night",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const resonanceOfFaith: Material = {
	name: "Resonance of Faith",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const synchronicityOfThought: Material = {
	name: "Synchronicity of Thought",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const theSecondSelf: Material = {
	name: "The Second Self",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const suspendedWhispers: Material = {
	name: "Suspended Whispers",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const hesitationOfTheWaves: Material = {
	name: "Hesitation of the Waves",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	sources: ["Houdinii's Schemes", "Hunter Exchange", "Material Selection Box",]
}

const dreamlessSeed: Material = {
	name: "Dreamless Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.Talent,
	sources: ["Daily Activity", "Fair Exchange", "Hunter Exchange",]
}

/* Weapon Ascension */
const goldenAppleSeed: Material = {
	name: "Golden Apple Seed",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const silverAppleSeed: Material = {
	name: "Silver Apple Seed",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const ironAppleSeed: Material = {
	name: "Iron Apple Seed",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const harmony: Material = {
	name: "Harmony",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const versey: Material = {
	name: "Versey",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const beaty: Material = {
	name: "Beaty",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const liquidDreamCan: Material = {
	name: "Liquid Dream Can",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const liquidDreamTravelKit: Material = {
	name: "Liquid Dream Travel Kit",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const liquidDreamTrialKit: Material = {
	name: "Liquid Dream Trial Kit",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const specialColdDessert: Material = {
	name: "Special Cold Dessert",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const plainColdDessert: Material = {
	name: "Plain Cold Dessert",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const flavorlessColdDessert: Material = {
	name: "Flavorless Cold Dessert",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const collectorsDramaCore: Material = {
	name: "Collector's Drama Core",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const masterDramaCore: Material = {
	name: "Master Drama Core",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

const beginnerDramaCore: Material = {
	name: "Beginner Drama Core",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponAscension,
	sources: ["Bubble Can Factory", "Hunter Exchange", "Material Selection Box",]
}

/* Weapon Experience */
const chaoticDye: Material = {
	name: "Chaotic Dye",
	rarity: EnumRarity.Rare,
	materialType: EnumMaterialType.WeaponExp,
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const colorlessDye: Material = {
	name: "Colorless Dye",
	rarity: EnumRarity.Uncommon,
	materialType: EnumMaterialType.WeaponExp,
	sources: ["Houdinii's Magic Stage", "Hunter Exchange", "Material Selection Box",]
}

const lightDye: Material = {
	name: "Light Dye",
	rarity: EnumRarity.Common,
	materialType: EnumMaterialType.WeaponExp,
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
