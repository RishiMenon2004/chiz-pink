import type { EventData } from "./events/event"

import {
	getPhase1End,
	getPhase1Start,
	getPhase2End,
	getPhase2Start,
} from "./events/patches"

type CharacterBannerData = EventData & {
	arcBanner?: { name: string; rateupItem: string }
}

export const characterBanners: CharacterBannerData[] = [
	{
		name: "The Ichi-daime: Nanally",
		type: "Gacha",
		rateupItem: "nanally",
		arcBanner: { name: "Tiger Special", rateupItem: "ready_ready" },
		getStartDate: getPhase1Start("version1_0"),
		getEndDate: getPhase1End("version1_0"),
		eventImage: "version1.0/gacha_nanally.webp",
		themeColor: "#fb5793",
		yOffset: "25%",
	},
	{
		name: "Misty Tipsy Style: Hotori",
		type: "Gacha",
		rateupItem: "hotori",
		arcBanner: { name: "Bright Moon Special", rateupItem: "marching_beyond_time" },
		getStartDate: getPhase2Start("version1_0"),
		getEndDate: getPhase2End("version1_0"),
		eventImage: "version1.0/gacha_hotori.webp",
		themeColor: "#e32d4c",
		yOffset: "22%",
	},

	//v1.1
	{
		name: "Fading Reverie: Lacrimosa",
		type: "Gacha",
		rateupItem: "lacrimosa",
		arcBanner: { name: "Nocturne Special", rateupItem: "the_last_rose" },
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase1End("version1_1"),
		eventImage: "version1.1/gacha_lacrimosa.webp",
		themeColor: "#f35671",
		yOffset: "35%",
	},
	{
		name: "Forsaken Path: Chaos",
		type: "Gacha",
		rateupItem: "chaos",
		arcBanner: { name: "Pursuit Special", rateupItem: "whats_desired" },
		getStartDate: getPhase2Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/gacha_chaos.webp",
		themeColor: "#6b92e1",
		yOffset: "8%",
	},

	//v1.2
	{
		name: "Before the Dawn: Shinku",
		type: "Gacha",
		rateupItem: "shinku",
		arcBanner: { name: "Resolve Special", rateupItem: "blushing_mirage" },
		getStartDate: getPhase1Start("version1_2"),
		getEndDate: getPhase1End("version1_2"),
		eventImage: "version1.2/gacha_shinku.webp",
		themeColor: "#8162a6",
		yOffset: "19%",
	},
	{
		name: "The Lifeline: Iroi",
		type: "Gacha",
		rateupItem: "iroi",
		arcBanner: { name: "Dreamgate Special", rateupItem: "the_wrong_gate" },
		getStartDate: getPhase2Start("version1_2"),
		getEndDate: getPhase2End("version1_2"),
		eventImage: "version1.2/gacha_iroi.webp",
		themeColor: "#c44a71",
		yOffset: "22%",
	},

	//v1.3
	{
		name: "Alluring Shadows: Zankou",
		type: "Gacha",
		rateupItem: "zankou",
		arcBanner: { name: "Spellbound Special", rateupItem: "ravenous_blade" },
		getStartDate: getPhase1Start("version1_3"),
		getEndDate: getPhase1End("version1_3"),
		eventImage: "version1.3/gacha_zankou.webp",
		themeColor: "#f25b5e",
		yOffset: "23%",
	},
	{
		name: "Surfing All Channels: Linko",
		type: "Gacha",
		rateupItem: "linko",
		arcBanner: { name: "Soundscape Special", rateupItem: "voice_of_the_voyager" },
		getStartDate: getPhase2Start("version1_3"),
		getEndDate: getPhase2End("version1_3"),
		eventImage: "version1.3/gacha_linko.webp",
		themeColor: "#7ad1c8",
		yOffset: "54%",
	},
	{
		name: "The Ichi-daime: Nanally (Rerun)",
		type: "Gacha",
		rateupItem: "nanally",
		arcBanner: { name: "Tiger Special", rateupItem: "ready_ready" },
		getStartDate: getPhase1Start("version1_3"),
		getEndDate: getPhase1End("version1_3"),
		eventImage: "version1.3/gacha_nanally.webp",
		themeColor: "#6fddfb",
		yOffset: "30%",
	},
	{
		name: "Misty Tipsy Style: Hotori (Rerun)",
		type: "Gacha",
		rateupItem: "hotori",
		arcBanner: { name: "Bright Moon Special", rateupItem: "marching_beyond_time" },
		getStartDate: getPhase2Start("version1_3"),
		getEndDate: getPhase2End("version1_3"),
		eventImage: "version1.3/gacha_hotori.webp",
		themeColor: "#e32d4c",
		yOffset: "22%",
	},

	//v1.4
	{
		name: "Foretold Finale: Blackbird",
		type: "Gacha",
		rateupItem: "blackbird",
		arcBanner: { name: "Roostfeather Special", rateupItem: "crime_and_punishment" },
		getStartDate: getPhase1Start("version1_4"),
		getEndDate: getPhase1End("version1_4"),
		eventImage: "version1.4/gacha_blackbird.webp",
		themeColor: "#5f7283",
		yOffset: "13%",
	},
	{
		name: "Dazzling Star: Akane Rin",
		type: "Gacha",
		rateupItem: "akane",
		arcBanner: { name: "Celestial Special", rateupItem: "far_side_of_the_moon" },
		getStartDate: getPhase2Start("version1_4"),
		getEndDate: getPhase2End("version1_4"),
		eventImage: "version1.4/gacha_akane.webp",
		themeColor: "#677bcb",
		yOffset: "21%",
	},
	{
		name: "Fading Reverie: Lacrimosa",
		type: "Gacha",
		rateupItem: "lacrimosa",
		arcBanner: { name: "Nocturne Special", rateupItem: "the_last_rose" },
		getStartDate: getPhase1Start("version1_4"),
		getEndDate: getPhase1End("version1_4"),
		eventImage: "version1.4/gacha_lacrimosa.webp",
		themeColor: "#f35671",
		yOffset: "35%",
	},

	//v1.5
	{
		name: "Phase 1: Elyms",
		type: "Gacha",
		rateupItem: "elyms",
		getStartDate: getPhase1Start("version1_5"),
		getEndDate: getPhase1End("version1_5"),
		eventImage: "version1.5/gacha_elyms.webp",
		themeColor: "#6a7fe0",
		yOffset: "21%",
	},
	{
		name: "Phase 2: Exe",
		type: "Gacha",
		rateupItem: "exe",
		getStartDate: getPhase2Start("version1_5"),
		getEndDate: getPhase2End("version1_5"),
		eventImage: "version1.5/gacha_exe.webp",
		themeColor: "#3d4fa8",
		yOffset: "20%",
	},
]

// Arc banners run alongside a character banner and share its dates.
export const arcBanners = characterBanners.flatMap(
	({ arcBanner, getStartDate, getEndDate }) =>
		arcBanner
			? [
					{
						...arcBanner,
						getStartDate: () => getStartDate("Asia"),
						getEndDate: () => getEndDate("Asia"),
					},
				]
			: []
)

export const permanentBanner = {
	name: "Bright Moon Special",
	rateupItems: ["baicang", "daffodill", "fadia", "hathor", "jiuyuan", "sakiri"],
}
