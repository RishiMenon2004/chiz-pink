import type { EventData } from "./event"
import { serverEOD, serverSOD } from "./event"
import { patchTimings } from "./patches"

const timings = patchTimings.version1_1

export const events: EventData[] = [
	{
		name: 'Version 1.1 ("Dreamwalk Corridor")',
		type: "Patch",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.1/version_1.1.webp",
		themeColor: "#6d5acd",
		yOffset: "27%",
	},
	{
		name: "Everdriving Mystery Box: NTE × PORSCHE",
		type: "Mystery Box",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.1/mystery_porsche.webp",
		themeColor: "#6f3fcc",
	},
	{
		name: "What's Baking",
		type: "Event",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.1/event_whats_baking.webp",
		themeColor: "#f0d2c4",
	},
	{
		name: "Underground Circuit",
		type: "Event",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.1/event_underground_circuit.webp",
		themeColor: "#3c01b4",
	},
	{
		name: "The Long Dream",
		type: "Event",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.1/event_the_long_dream.webp",
	},
	{
		name: "Sunward Travalogue",
		type: "Event",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
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
		getEndDate: timings.phase2End,
		eventImage: "version1.1/event_hunters_crucible.webp",
		themeColor: "#ea285d",
	},
	{
		name: "Fight Championship",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 24, 6, 2026),
		getEndDate: timings.phase2End,
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
]
