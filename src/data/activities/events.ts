import { Material } from "@/types/item"
import { SettingsRecord } from "@/types/settings"

import { annulith, EnumMaterialType } from "@/data/items/materials"

import { getServerTimestamp, getUtcTimestamp } from "@/helpers/serverTime"
import { EnumRarity } from "../items"

export type EventData = {
	name: string
	type: "Patch" | "Event" | "Circle Gift" | "Gacha" | "Mystery Box"
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

const globalPatchStart = (day: number, month: number, year: number) =>
	getUtcTimestamp({
		year,
		month,
		day,
		hour: 3,
	})

const globalPatchPhase1End = (day: number, month: number, year: number) =>
	getUtcTimestamp({
		year,
		month,
		day,
		hour: 9,
		minute: 59,
	})

const globalPatchPhase2Start = (day: number, month: number, year: number) =>
	getUtcTimestamp({
		year,
		month,
		day,
		hour: 10,
	})

const globalPatchEnd = (day: number, month: number, year: number) =>
	getUtcTimestamp({
		year,
		month,
		day,
		hour: 21,
		minute: 59,
	})

export const Events: EventData[] = [
	{
		name: "Version 1.0 (Global Launch)",
		type: "Patch",
		getStartDate: () => globalPatchStart(29, 4, 2026),
		getEndDate: () => globalPatchEnd(2, 6, 2026),
		themeColor: "#50f1ff",
		eventImage: "version1.0/version_1.0.jpeg",
	},
	{
		name: "The Ichi-daime: Nanally",
		type: "Gacha",
		getStartDate: () => globalPatchStart(29, 4, 2026),
		getEndDate: () => globalPatchPhase1End(13, 5, 2026),
		eventImage: "version1.0/gacha_nanally.jpeg",
		themeColor: "#fb5793",
		yOffset: "25%",
	},
	{
		name: "Misty Tipsy Style: Hotori",
		type: "Gacha",
		getStartDate: () => globalPatchPhase2Start(13, 5, 2026),
		getEndDate: () => globalPatchEnd(2, 6, 2026),
		eventImage: "version1.0/gacha_hotori.jpeg",
		themeColor: "#e32d4c",
		yOffset: "22%",
	},
	{
		name: "Zero's Companion",
		type: "Event",
		getStartDate: () => globalPatchPhase2Start(13, 5, 2026),
		getEndDate: (server) => serverEOD(server, 27, 5, 2026),
		rewards: [annulith],
		eventImage: "version1.0/event_zeros_companion.jpeg",
		themeColor: "#74e2f5",
	},
	{
		name: "Whisker Patrol",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 27, 5, 2026),
		getEndDate: () => globalPatchEnd(2, 6, 2026),
		rewards: [annulith],
		themeColor: "#2d6db7",
		eventImage: "version1.0/event_whisker_patrol.jpeg",
	},

	//v1.1
	{
		name: 'Version 1.1 ("Dreamwalk Corridor")',
		type: "Patch",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/version_1.1.jpeg",
		themeColor: "#6d5acd",
		yOffset: "27%",
	},
	{
		name: "Fading Reverie: Lacrimosa",
		type: "Gacha",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchPhase1End(24, 6, 2026),
		eventImage: "version1.1/gacha_lacrimosa.jpeg",
		themeColor: "#f35671",
		yOffset: "35%",
	},
	{
		name: "Forsaken Path: Chaos",
		type: "Gacha",
		getStartDate: () => globalPatchPhase2Start(24, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/gacha_chaos.jpeg",
		themeColor: "#6b92e1",
		yOffset: "8%",
	},
	{
		name: "Circle Gifts",
		type: "Circle Gift",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		themeColor: "#f35671",
	},
	{
		name: "Everdriving Mystery Box: NTE × PORSCHE",
		type: "Mystery Box",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		rewards: [
			{
				id: "porsche_918_spyder",
				name: "Porsche 918 Spyder",
				materialType: EnumMaterialType.Reward,
				rarity: EnumRarity.Epic,
				imageSrc: "/rewards/porche_918_spyder",
				sources: ["Everdriving Mystery Box Event"],
			},
		],
		eventImage: "version1.1/mystery_porsche.jpeg",
		themeColor: "#6f3fcc",
	},
	{
		name: "What's Baking",
		type: "Event",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/event_whats_baking.png",
		themeColor: "#f0d2c4",
	},
	{
		name: "Underground Circuit",
		type: "Event",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/event_underground_circuit.png",
		themeColor: "#3c01b4",
	},
	{
		name: "The Long Dream",
		type: "Event",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/event_the_long_dream.png",
	},
	{
		name: "Sunward Travalogue",
		type: "Event",
		getStartDate: () => globalPatchStart(3, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/event_sunward_travalogue.png",
		themeColor: "#3e7ec6",
	},
	{
		name: "Fons Rush",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 8, 6, 2026),
		getEndDate: (server) => serverEOD(server, 15, 6, 2026),
		eventImage: "version1.1/event_fons_rush.png",
		themeColor: "var(--fons-rush)",
	},
	{
		name: "Hunter's Crucible",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 18, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/event_hunters_crucible.png",
		themeColor: "#ea285d",
	},
	{
		name: "Fight Championship",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 24, 6, 2026),
		getEndDate: () => globalPatchEnd(7, 7, 2026),
		eventImage: "version1.1/event_fight_championship.png",
		themeColor: "#d89b3e",
	},
	{
		name: "Pixel Surge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 26, 6, 2026),
		getEndDate: (server) => serverEOD(server, 3, 7, 2026),
		eventImage: "version1.1/event_pixel_surge.png",
		themeColor: "var(--pixel-surge)",
	},

	//v1.2
	{
		name: 'Version 1.2 ("999 Nights")',
		type: "Patch",
		getStartDate: () => globalPatchStart(8, 7, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		eventImage: "version1.2/version_1.2.jpeg",
		themeColor: "#c8eec7",
	},
	{
		name: "Before the Dawn: Shinku",
		type: "Gacha",
		getStartDate: () => globalPatchStart(8, 7, 2026),
		getEndDate: () => globalPatchPhase1End(29, 7, 2026),
		eventImage: "version1.2/gacha_shinku.jpeg",
		themeColor: "#8162a6",
		yOffset: "17%",
	},
	{
		name: "The Lifeline: Iroi",
		type: "Gacha",
		getStartDate: () => globalPatchPhase2Start(29, 7, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		eventImage: "version1.2/gacha_iroi.jpeg",
		themeColor: "#c44a71",
		yOffset: "20%",
	},
	{
		name: "Circle Gifts",
		type: "Circle Gift",
		getStartDate: () => globalPatchStart(8, 7, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		themeColor: "#8162a6",
	},
	{
		name: "Neon Rift Mystery Box: Regalia Draco",
		type: "Mystery Box",
		getStartDate: () => globalPatchStart(8, 7, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		rewards: [
			{
				id: "regalia_draco",
				name: "Regalia Draco",
				materialType: EnumMaterialType.Reward,
				rarity: EnumRarity.Epic,
				imageSrc: "/rewards/regalia_draco",
				sources: ["Everdriving Mystery Box Event"],
			},
		],
		eventImage: "version1.2/mystery_draco.jpeg",
		themeColor: "#a51244",
	},
	{
		name: "Stamina Recharge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 13, 7, 2026),
		getEndDate: (server) => serverEOD(server, 20, 7, 2026),
		eventImage: "version1.2/event_stamina_recharge.png",
		themeColor: "var(--stamina-recharge)",
	},
	{
		name: "Gold Clash",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 20, 7, 2026),
		getEndDate: (server) => serverEOD(server, 3, 8, 2026),
		eventImage: "version1.2/event_gold_clash.png",
		themeColor: "var(--gold-clash)",
	},
	{
		name: "Pixel Surge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 3, 8, 2026),
		getEndDate: (server) => serverEOD(server, 10, 8, 2026),
		eventImage: "version1.2/event_pixel_surge.png",
		themeColor: "var(--pixel-surge)",
	},
	{
		name: "Fons Rush",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 10, 8, 2026),
		getEndDate: (server) => serverEOD(server, 17, 8, 2026),
		eventImage: "version1.2/event_fons_rush.png",
		themeColor: "var(--fons-rush)",
	},
	{
		name: "Shadow & Seek",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 17, 7, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		eventImage: "version1.2/event_shadow_seek.png",
		themeColor: "#875b3e",
	},
	{
		name: "Going, Going, Gone!",
		type: "Event",
		getStartDate: () => globalPatchPhase2Start(29, 7, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		eventImage: "version1.2/event_going_gone.png",
		themeColor: "#559c68",
	},
	{
		name: "Fishin Frenzy",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 3, 8, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		eventImage: "version1.2/event_fishing_frenzy.png",
		themeColor: "#309f96",
	},
	{
		name: "Warren Lucky Flip",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 5, 8, 2026),
		getEndDate: () => globalPatchEnd(18, 8, 2026),
		eventImage: "version1.2/event_warren_flip.png",
		themeColor: "#714065",
	},

	//v1.3
	{
		name: 'Version 1.3 ("Fogden Game")',
		type: "Patch",
		getStartDate: () => globalPatchStart(19, 8, 2026),
		getEndDate: () => globalPatchEnd(29, 9, 2026),
	},
	{
		name: "Zankou Banner",
		type: "Gacha",
		getStartDate: () => globalPatchStart(19, 8, 2026),
		getEndDate: () => globalPatchPhase1End(9, 9, 2026),
		eventImage: "version1.3/gacha_zankou.jpeg",
		themeColor: "#8364a8",
		yOffset: "23%",
	},
	{
		name: "Linko Banner",
		type: "Gacha",
		getStartDate: () => globalPatchPhase2Start(9, 9, 2026),
		getEndDate: () => globalPatchEnd(29, 9, 2026),
		eventImage: "version1.3/gacha_linko.jpeg",
		themeColor: "#78c4c0",
	},
	{
		name: "Circle Gifts",
		type: "Circle Gift",
		getStartDate: () => globalPatchStart(19, 8, 2026),
		getEndDate: () => globalPatchEnd(29, 9, 2026),
		themeColor: "#8364a8",
	},
]
