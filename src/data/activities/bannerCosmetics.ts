// The outfit and glider each limited banner features, by its rate-up
// character (reruns feature the same). Taken from NTE_Assets'
// DT_ItemConfig: a glider's id is "Fashion_glide_<character id>", and an
// outfit's use text names the character it's for ("Grants the exclusive
// Elyms Outfit: Drifting Petals").
export const bannerCosmetics: Record<string, string[]> = {
	nanally: ["phoenix_kick", "underboss"],
	hotori: ["priceless_orchid", "orchid_breeze"],
	lacrimosa: ["new_moon_lullaby", "tomato_duo"],
	chaos: ["clear_skies", "skyrider"],
	shinku: ["student_of_terrasea", "overcast_canopy"],
	iroi: ["archmage", "sheepcopter"],
	zankou: ["autumn_vignette", "scarlet_sash"],
	linko: ["surfing_among_stars", "super_specter"],
	blackbird: ["rouge_et_noir", "the_harbinger"],
	akane: ["shining_idol", "day_adrift"],
	elyms: ["drifting_petals", "joy_buoy"],
	exe: ["hand_of_y"],
}
