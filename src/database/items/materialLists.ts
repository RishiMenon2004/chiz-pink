import {
	beetleCoin,
	fons,
	goodBoyStamp,
	dressSleevesOfVanity,
	eternalMemory,
	eliteHunterGuide,
	seniorHunterGuide,
	risingHunterGuide,
	paradoxicalWhispers,
	obscureWhispers,
	lostWhispers,
	chaosSilhouette,
	blurredSilhouette,
	fadingSilhouette,
	distortedNumeral,
	unsolvedNumeral,
	blurredNumeral,
	transcendentDelusions,
	yearningDelusions,
	suspendedDelusions,
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
	whiteRose,
	co,
	fng,
	blackHat,
	knownWeariness,
	firstExpectations,
	heartRacingNight,
	resonanceOfFaith,
	synchronicityOfThought,
	theSecondSelf,
	suspendedWhispers,
	hesitationOfTheWaves,
	dreamlessSeed,
	goldenAppleSeed,
	silverAppleSeed,
	ironAppleSeed,
	harmony,
	versey,
	beaty,
	liquidDreamCan,
	liquidDreamTravelKit,
	liquidDreamTrialKit,
	specialColdDessert,
	plainColdDessert,
	flavorlessColdDessert,
	collectorsDramaCore,
	masterDramaCore,
	beginnerDramaCore,
	chaoticDye,
	colorlessDye,
	lightDye,
	Material,
} from "./materials"

const allMaterials: Record<string, Material> = {
	/* currency */
	beetle_coin: beetleCoin,
	fons: fons,
	dreamless_seed: dreamlessSeed,

	/* epic */
	good_boy_stamp: goodBoyStamp,
	dress_sleeves_of_vanity: dressSleevesOfVanity,
	eternal_memory: eternalMemory,

	/* rare */
	elite_hunter_guide: eliteHunterGuide,

	paradoxical_whispers: paradoxicalWhispers,
	chaos_silhouette: chaosSilhouette,
	distorted_numeral: distortedNumeral,
	transcendent_delusions: transcendentDelusions,

	water_moon_pick: waterMoonPick,
	charging_knight_spark_plug: chargingKnightSparkPlug,
	confessional_flower_seed: ConfessionalFLowerSeed,
	a_page_from_delusions_shore: aPageFromDelusionsShore,
	tear_of_the_sea: tearOfTheSea,
	nest_guard_fragment: nestGuardFragment,
	colorful_ticket_stub: colorfulTicketStub,

	the_olive_branch: theOliveBranch,
	white_rose: whiteRose,
	black_hat: blackHat,
	heart_racing_night: heartRacingNight,
	the_second_self: theSecondSelf,

	golden_apple_seed: goldenAppleSeed,
	harmony: harmony,
	liquid_dream_can: liquidDreamCan,
	special_cold_dessert: specialColdDessert,
	collectors_drama_core: collectorsDramaCore,

	chaotic_dye: chaoticDye,

	/* uncommon */
	senior_hunter_guide: seniorHunterGuide,

	obscure_whispers: obscureWhispers,
	blurred_silhouette: blurredSilhouette,
	unsolved_numeral: unsolvedNumeral,
	yearning_delusions: yearningDelusions,

	doves_flutter: dovesFlutter,
	co: co,
	known_weariness: knownWeariness,
	resonance_of_faith: resonanceOfFaith,
	suspended_whispers: suspendedWhispers,

	silver_apple_seed: silverAppleSeed,
	versey: versey,
	liquid_dream_travel_kit: liquidDreamTravelKit,
	plain_cold_dessert: plainColdDessert,
	master_drama_core: masterDramaCore,

	colorless_dye: colorlessDye,

	/* common  */
	rising_hunter_guide: risingHunterGuide,

	lost_whispers: lostWhispers,
	fading_silhouette: fadingSilhouette,
	blurred_numeral: blurredNumeral,
	suspended_delusions: suspendedDelusions,

	nestlings_longing: nestlingsLonging,
	fng: fng,
	first_expectations: firstExpectations,
	synchronicity_of_thought: synchronicityOfThought,
	hesitation_of_the_waves: hesitationOfTheWaves,

	iron_apple_seed: ironAppleSeed,
	beaty: beaty,
	liquid_dream_trial_kit: liquidDreamTrialKit,
	flavorless_cold_dessert: flavorlessColdDessert,
	beginner_drama_core: beginnerDramaCore,

	light_dye: lightDye,
}

const allInventoryMaterials: Record<string, Material> = {
	/* epic */
	good_boy_stamp: goodBoyStamp,
	dress_sleeves_of_vanity: dressSleevesOfVanity,
	eternal_memory: eternalMemory,

	/* rare */
	elite_hunter_guide: eliteHunterGuide,

	paradoxical_whispers: paradoxicalWhispers,
	chaos_silhouette: chaosSilhouette,
	distorted_numeral: distortedNumeral,
	transcendent_delusions: transcendentDelusions,

	water_moon_pick: waterMoonPick,
	charging_knight_spark_plug: chargingKnightSparkPlug,
	confessional_flower_seed: ConfessionalFLowerSeed,
	a_page_from_delusions_shore: aPageFromDelusionsShore,
	tear_of_the_sea: tearOfTheSea,
	nest_guard_fragment: nestGuardFragment,
	colorful_ticket_stub: colorfulTicketStub,

	the_olive_branch: theOliveBranch,
	white_rose: whiteRose,
	black_hat: blackHat,
	heart_racing_night: heartRacingNight,
	the_second_self: theSecondSelf,

	golden_apple_seed: goldenAppleSeed,
	harmony: harmony,
	liquid_dream_can: liquidDreamCan,
	special_cold_dessert: specialColdDessert,
	collectors_drama_core: collectorsDramaCore,

	chaotic_dye: chaoticDye,

	/* uncommon */
	senior_hunter_guide: seniorHunterGuide,

	obscure_whispers: obscureWhispers,
	blurred_silhouette: blurredSilhouette,
	unsolved_numeral: unsolvedNumeral,
	yearning_delusions: yearningDelusions,

	doves_flutter: dovesFlutter,
	co: co,
	known_weariness: knownWeariness,
	resonance_of_faith: resonanceOfFaith,
	suspended_whispers: suspendedWhispers,

	silver_apple_seed: silverAppleSeed,
	versey: versey,
	liquid_dream_travel_kit: liquidDreamTravelKit,
	plain_cold_dessert: plainColdDessert,
	master_drama_core: masterDramaCore,

	colorless_dye: colorlessDye,

	/* common  */
	rising_hunter_guide: risingHunterGuide,

	lost_whispers: lostWhispers,
	fading_silhouette: fadingSilhouette,
	blurred_numeral: blurredNumeral,
	suspended_delusions: suspendedDelusions,

	nestlings_longing: nestlingsLonging,
	fng: fng,
	first_expectations: firstExpectations,
	synchronicity_of_thought: synchronicityOfThought,
	hesitation_of_the_waves: hesitationOfTheWaves,

	iron_apple_seed: ironAppleSeed,
	beaty: beaty,
	liquid_dream_trial_kit: liquidDreamTrialKit,
	flavorless_cold_dessert: flavorlessColdDessert,
	beginner_drama_core: beginnerDramaCore,

	light_dye: lightDye,
}

export function getAllMaterials() {
	return allMaterials
}

export function getInventoryMaterials() {
	return allInventoryMaterials
}

export function findMaterial(materialId: string) {
	return allMaterials[materialId]
}
