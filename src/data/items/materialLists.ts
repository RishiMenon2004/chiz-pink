import type { Material } from "@/types/item"

import { EnumMaterialType } from "./materials"
import {
	annulith,
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
	confessionalFLowerSeed,
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
	//rewards
	diceLimited,
	diceStandard,
	lostPiece,
	warpPiece,
	floeCinemeTicket,
	porsche918Spyder,
	regaliaDraco,
	hikariTide,
	phoenixKick,
	pricelessOrchid,
	newMoonLullaby,
	clearSkies,
	studentOfTerrasea,
	archmage,
	autumnVignette,
	surfingAmongStars,
	underboss,
	orchidBreeze,
	tomatoDuo,
	skyrider,
	overcastCanopy,
	sheepcopter,
	scarletSash,
	xiaozhen,
} from "./materials"

const allMaterials: Record<string, Material> = {
	/* currency */
	beetle_coin: beetleCoin,
	fons: fons,
	annulith: annulith,

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

	confessional_flower_seed: confessionalFLowerSeed,
	charging_knight_spark_plug: chargingKnightSparkPlug,
	a_page_from_delusions_shore: aPageFromDelusionsShore,
	water_moon_pick: waterMoonPick,
	nest_guard_fragment: nestGuardFragment,
	colorful_ticket_stub: colorfulTicketStub,
	tear_of_the_sea: tearOfTheSea,

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

	dreamless_seed: dreamlessSeed,

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

const allInventoryMaterials: Record<string, Material> = Object.fromEntries(
	Object.entries(allMaterials).filter(
		([, material]) => material.materialType !== EnumMaterialType.Currency
	)
)

export function getAllMaterials() {
	return allMaterials
}

const allMaterialsList: Material[] = Object.values(allMaterials)

export function getAllMaterialsList() {
	return allMaterialsList
}

export function getInventoryMaterials() {
	return allInventoryMaterials
}

const allInventoryMaterialsList: Material[] = Object.values(allInventoryMaterials)

export function getInventoryMaterialsList() {
	return allInventoryMaterialsList
}

export function findMaterial(materialId: string) {
	return allMaterials[materialId]
}

export function findMaterialByName(materialName: string) {
	return allInventoryMaterialsList.find(
		(material) => material.name === materialName
	)
}

const allRewards: Record<string, Material> = {
	dice_limited: diceLimited,
	dice_standard: diceStandard,

	lost_piece: lostPiece,
	warp_piece: warpPiece,

	floe_cineme_ticket: floeCinemeTicket,

	porsche_918_spyder: porsche918Spyder,
	regalia_draco: regaliaDraco,
	hikari_tide: hikariTide,

	//cosmetics - outfits
	phoenix_kick: phoenixKick,
	priceless_orchid: pricelessOrchid,
	new_moon_lullaby: newMoonLullaby,
	clear_skies: clearSkies,
	student_of_terrasea: studentOfTerrasea,
	archmage: archmage,
	autumn_vignette: autumnVignette,
	surfing_among_stars: surfingAmongStars,

	//cosmetics - gliders
	underboss: underboss,
	orchid_breeze: orchidBreeze,
	tomato_duo: tomatoDuo,
	skyrider: skyrider,
	overcast_canopy: overcastCanopy,
	sheepcopter: sheepcopter,
	scarlet_sash: scarletSash,
	xiaozhen: xiaozhen,
}

export function getAllRewards() {
	return allRewards
}

const allRewardsList: Material[] = Object.values(allRewards)

export function getAllRewardsList() {
	return allRewardsList
}

export function findReward(materialId: string) {
	return allRewards[materialId]
}

export function findRewardByName(rewardName: string) {
	return allRewardsList.find((reward) => reward.name === rewardName)
}
