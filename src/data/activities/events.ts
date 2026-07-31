import { Material } from "@/types/item"
import { SettingsRecord } from "@/types/settings"

import { annulith, porsche918Spyder, regaliaDraco } from "@/data/items/materials"

import { getServerTimestamp, getUtcTimestamp } from "@/helpers/serverTime"

export type EventData = {
	name: string
	type: "Patch" | "Event" | "Circle Gift" | "Gacha" | "Mystery Box" | "BTR"
	getStartDate:
		| ((server: SettingsRecord["userdata"]["server"]) => number)
		| (() => number)
	getEndDate:
		| ((server: SettingsRecord["userdata"]["server"]) => number)
		| (() => number)
	rewards?: Material[]
	eventImage?: string
	themeColor?: string
	yOffset?: string
}

const serverSOD = (
	server: SettingsRecord["userdata"]["server"],
	day: number,
	month: number,
	year: number
) =>
	getServerTimestamp(server, {
		year,
		month,
		day,
		hour: 5,
	})

const serverEOD = (
	server: SettingsRecord["userdata"]["server"],
	day: number,
	month: number,
	year: number
) =>
	getServerTimestamp(server, {
		year,
		month,
		day,
		hour: 4,
		minute: 59,
	})

const globalPatchStart = (
	day: number,
	month: number,
	year: number,
	hourOffset?: number,
	minuteOffset?: number
) =>
	getUtcTimestamp({
		year,
		month,
		day,
		hour: 3 + (hourOffset || 0),
		minute: minuteOffset || 0,
	})

const globalPatchEnd = (day: number, month: number, year: number) =>
	getUtcTimestamp({
		year,
		month,
		day,
		hour: 21,
		minute: 59,
	})

const patchTimings = {
	version1_0: {
		phase1Start: () => globalPatchStart(29, 4, 2026),
		phase1End: () => globalPatchEnd(12, 5, 2026),
		phase2Start: () => globalPatchStart(13, 5, 2026),
		phase2End: () => globalPatchEnd(2, 6, 2026),
	},
	version1_1: {
		phase1Start: () => globalPatchStart(3, 6, 2026),
		phase1End: () => globalPatchEnd(23, 6, 2026),
		phase2Start: () => globalPatchStart(24, 6, 2026),
		phase2End: () => globalPatchEnd(7, 7, 2026),
	},
	version1_2: {
		phase1Start: () => globalPatchStart(8, 7, 2026),
		phase1End: () => globalPatchEnd(28, 7, 2026),
		phase2Start: () => globalPatchStart(29, 7, 2026, -2),
		phase2End: () => globalPatchEnd(18, 8, 2026),
	},
	version1_3: {
		phase1Start: () => globalPatchStart(19, 8, 2026),
		phase1End: () => globalPatchEnd(8, 9, 2026),
		phase2Start: () => globalPatchStart(9, 9, 2026),
		phase2End: () => globalPatchEnd(29, 9, 2026),
	},
}

function getPhase1Start(version: keyof typeof patchTimings) {
	return patchTimings[version].phase1Start
}
function getPhase1End(version: keyof typeof patchTimings) {
	return patchTimings[version].phase1End
}
function getPhase2Start(version: keyof typeof patchTimings) {
	return patchTimings[version].phase2Start
}
function getPhase2End(version: keyof typeof patchTimings) {
	return patchTimings[version].phase2End
}

export const Events: EventData[] = [
	{
		name: "Version 1.0 (Global Launch)",
		type: "Patch",
		getStartDate: getPhase1Start("version1_0"),
		getEndDate: getPhase2End("version1_0"),
		themeColor: "#50f1ff",
		eventImage: "version1.0/version_1.0.webp",
	},
	{
		name: "The Ichi-daime: Nanally",
		type: "Gacha",
		getStartDate: getPhase1Start("version1_0"),
		getEndDate: getPhase1End("version1_0"),
		eventImage: "version1.0/gacha_nanally.webp",
		themeColor: "#fb5793",
		yOffset: "25%",
	},
	{
		name: "Misty Tipsy Style: Hotori",
		type: "Gacha",
		getStartDate: getPhase2Start("version1_0"),
		getEndDate: getPhase2End("version1_0"),
		eventImage: "version1.0/gacha_hotori.webp",
		themeColor: "#e32d4c",
		yOffset: "22%",
	},
	{
		name: "Zero's Companion",
		type: "Event",
		getStartDate: getPhase2Start("version1_0"),
		getEndDate: (server) => serverEOD(server, 27, 5, 2026),
		rewards: [annulith],
		eventImage: "version1.0/event_zeros_companion.webp",
		themeColor: "#74e2f5",
	},
	{
		name: "Whisker Patrol",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 27, 5, 2026),
		getEndDate: getPhase2End("version1_0"),
		rewards: [annulith],
		themeColor: "#2d6db7",
		eventImage: "version1.0/event_whisker_patrol.webp",
	},

	//v1.1
	{
		name: 'Version 1.1 ("Dreamwalk Corridor")',
		type: "Patch",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/version_1.1.webp",
		themeColor: "#6d5acd",
		yOffset: "27%",
	},
	{
		name: "Fading Reverie: Lacrimosa",
		type: "Gacha",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase1End("version1_1"),
		eventImage: "version1.1/gacha_lacrimosa.webp",
		themeColor: "#f35671",
		yOffset: "35%",
	},
	{
		name: "Forsaken Path: Chaos",
		type: "Gacha",
		getStartDate: getPhase2Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/gacha_chaos.webp",
		themeColor: "#6b92e1",
		yOffset: "8%",
	},
	{
		name: "Circle Gift",
		type: "Circle Gift",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		themeColor: "#f35671",
	},
	{
		name: "Everdriving Mystery Box: NTE × PORSCHE",
		type: "Mystery Box",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		rewards: [porsche918Spyder, annulith],
		eventImage: "version1.1/mystery_porsche.webp",
		themeColor: "#6f3fcc",
	},
	{
		name: "What's Baking",
		type: "Event",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/event_whats_baking.webp",
		themeColor: "#f0d2c4",
	},
	{
		name: "Underground Circuit",
		type: "Event",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/event_underground_circuit.webp",
		themeColor: "#3c01b4",
	},
	{
		name: "The Long Dream",
		type: "Event",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/event_the_long_dream.webp",
	},
	{
		name: "Sunward Travalogue",
		type: "Event",
		getStartDate: getPhase1Start("version1_1"),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/event_sunward_travalogue.webp",
		themeColor: "#3e7ec6",
	},
	{
		name: "Fons Rush",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 8, 6, 2026),
		getEndDate: (server) => serverEOD(server, 15, 6, 2026),
		eventImage: "version1.1/event_fons_rush.webp",
		themeColor: "var(--fons-rush)",
	},
	{
		name: "Hunter's Crucible",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 18, 6, 2026),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/event_hunters_crucible.webp",
		themeColor: "#ea285d",
	},
	{
		name: "Fight Championship",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 24, 6, 2026),
		getEndDate: getPhase2End("version1_1"),
		eventImage: "version1.1/event_fight_championship.webp",
		themeColor: "#d89b3e",
	},
	{
		name: "Pixel Surge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 26, 6, 2026),
		getEndDate: (server) => serverEOD(server, 3, 7, 2026),
		eventImage: "version1.1/event_pixel_surge.webp",
		themeColor: "var(--pixel-surge)",
	},

	//v1.2
	{
		name: 'Version 1.2 ("999 Nights")',
		type: "Patch",
		getStartDate: getPhase1Start("version1_2"),
		getEndDate: getPhase2End("version1_2"),
		eventImage: "version1.2/version_1.2.webp",
		themeColor: "#c8eec7",
	},
	{
		name: "Before the Dawn: Shinku",
		type: "Gacha",
		getStartDate: getPhase1Start("version1_2"),
		getEndDate: getPhase1End("version1_2"),
		eventImage: "version1.2/gacha_shinku.webp",
		themeColor: "#8162a6",
		yOffset: "17%",
	},
	{
		name: "The Lifeline: Iroi",
		type: "Gacha",
		getStartDate: getPhase2Start("version1_2"),
		getEndDate: getPhase2End("version1_2"),
		eventImage: "version1.2/gacha_iroi.webp",
		themeColor: "#c44a71",
		yOffset: "20%",
	},
	{
		name: "Circle Gift",
		type: "Circle Gift",
		getStartDate: getPhase1Start("version1_2"),
		getEndDate: getPhase2End("version1_2"),
		themeColor: "#8162a6",
	},
	{
		name: "Neon Rift Mystery Box: Regalia Draco",
		type: "Mystery Box",
		getStartDate: getPhase1Start("version1_2"),
		getEndDate: getPhase2End("version1_2"),
		rewards: [regaliaDraco],
		eventImage: "version1.2/mystery_draco.webp",
		themeColor: "#a51244",
	},
	{
		name: "Stamina Recharge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 13, 7, 2026),
		getEndDate: (server) => serverEOD(server, 20, 7, 2026),
		eventImage: "version1.2/event_stamina_recharge.webp",
		themeColor: "var(--stamina-recharge)",
	},
	{
		name: "Gold Clash",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 20, 7, 2026),
		getEndDate: (server) => serverEOD(server, 3, 8, 2026),
		eventImage: "version1.2/event_gold_clash.webp",
		themeColor: "var(--gold-clash)",
	},
	{
		name: "Pixel Surge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 3, 8, 2026),
		getEndDate: (server) => serverEOD(server, 10, 8, 2026),
		eventImage: "version1.2/event_pixel_surge.webp",
		themeColor: "var(--pixel-surge)",
	},
	{
		name: "Fons Rush",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 10, 8, 2026),
		getEndDate: (server) => serverEOD(server, 17, 8, 2026),
		eventImage: "version1.2/event_fons_rush.webp",
		themeColor: "var(--fons-rush)",
	},
	{
		name: "Shadow & Seek",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 17, 7, 2026),
		getEndDate: getPhase2End("version1_2"),
		eventImage: "version1.2/event_shadow_seek.webp",
		themeColor: "#875b3e",
	},
	{
		name: "Going, Going, Gone!",
		type: "Event",
		getStartDate: getPhase2Start("version1_2"),
		getEndDate: getPhase2End("version1_2"),
		eventImage: "version1.2/event_going_gone.webp",
		themeColor: "#559c68",
	},
	{
		name: "Fishin Frenzy",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 3, 8, 2026),
		getEndDate: getPhase2End("version1_2"),
		eventImage: "version1.2/event_fishing_frenzy.webp",
		themeColor: "#309f96",
	},
	{
		name: "Warren Lucky Flip",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 5, 8, 2026),
		getEndDate: getPhase2End("version1_2"),
		eventImage: "version1.2/event_warren_flip.webp",
		themeColor: "#714065",
	},

	//v1.3
	{
		name: 'Version 1.3 ("Fogden Game")',
		type: "Patch",
		getStartDate: getPhase1Start("version1_3"),
		getEndDate: getPhase2End("version1_3"),
	},
	{
		name: "Zankou Banner",
		type: "Gacha",
		getStartDate: getPhase1Start("version1_3"),
		getEndDate: getPhase1End("version1_3"),
		eventImage: "version1.3/gacha_zankou.webp",
		themeColor: "#8364a8",
		yOffset: "23%",
	},
	{
		name: "Linko Banner",
		type: "Gacha",
		getStartDate: getPhase2Start("version1_3"),
		getEndDate: getPhase2End("version1_3"),
		eventImage: "version1.3/gacha_linko.webp",
		themeColor: "#78c4c0",
	},
	{
		name: "Circle Gift",
		type: "Circle Gift",
		getStartDate: getPhase1Start("version1_3"),
		getEndDate: getPhase2End("version1_3"),
		themeColor: "#8364a8",
	},
]

export const BTRTimeline: EventData[] = [
	{
		name: "Prime Circle",
		type: "BTR",
		getStartDate: getPhase1Start("version1_0"),
		getEndDate: (server) => serverEOD(server, 4, 6, 2026),
	},
	{
		name: "Uncharted Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 4, 6, 2026),
		getEndDate: (server) => serverEOD(server, 18, 6, 2026),
	},
	{
		name: "Howling Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 18, 6, 2026),
		getEndDate: (server) => serverEOD(server, 2, 7, 2026),
	},
	{
		name: "Gloaming Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 2, 7, 2026),
		getEndDate: (server) => serverEOD(server, 16, 7, 2026),
	},
	{
		name: "Blazing Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 16, 7, 2026),
		getEndDate: (server) => serverEOD(server, 30, 7, 2026),
	},
	{
		name: "Cresting Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 30, 7, 2026),
		getEndDate: (server) => serverEOD(server, 13, 8, 2026),
	},
	{
		name: "TBA",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 13, 8, 2026),
		getEndDate: (server) => serverEOD(server, 27, 8, 2026),
	},
	{
		name: "TBA",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 27, 8, 2026),
		getEndDate: (server) => serverEOD(server, 10, 9, 2026),
	},
]
