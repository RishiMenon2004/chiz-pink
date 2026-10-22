import { getUtcTimestamp } from "@/helpers/serverTime"

import type { EventData } from "./event"
import { serverEOD, serverSOD } from "./event"
import { patchTimings } from "./patches"

const timings = patchTimings.version1_3

export const events: EventData[] = [
	{
		name: 'Version 1.3 ("Rising from the Moonlit Fog")',
		type: "Patch",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.3/version_1.3.webp",
		themeColor: "#d22730",
		yOffset: "51%",
	},
	{
		name: "Lucent Tides Mystery Box: Tide",
		type: "Mystery Box",
		getStartDate: () =>
			getUtcTimestamp({
				year: 2026,
				month: 8,
				day: 19,
				hour: 9,
			}),
		getEndDate: timings.phase2End,
		eventImage: "version1.3/mystery_tide.webp",
		themeColor: "#db061e",
	},
	{
		name: "Hunter's Crucible",
		type: "Event",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.3/event_hunters_crucible.webp",
		themeColor: "#ea285d",
	},
	{
		name: "Surf Breaker",
		type: "Event",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.3/event_surf_breaker.webp",
		themeColor: "#e5f75e",
	},
	{
		name: "Volley Star",
		type: "Event",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.3/event_volley_star.webp",
		themeColor: "#78c0d2",
	},
	{
		name: "Stamina Recharge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 24, 8, 2026),
		getEndDate: (server) => serverEOD(server, 31, 8, 2026),
		eventImage: "version1.3/event_stamina_recharge.webp",
		themeColor: "var(--stamina-recharge)",
	},
	{
		name: "Gold Clash",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 31, 8, 2026),
		getEndDate: (server) => serverEOD(server, 14, 9, 2026),
		eventImage: "version1.3/event_gold_clash.webp",
		themeColor: "var(--gold-clash)",
	},
	{
		name: "Pixel Surge",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 14, 9, 2026),
		getEndDate: (server) => serverEOD(server, 21, 9, 2026),
		eventImage: "version1.3/event_pixel_surge.webp",
		themeColor: "var(--pixel-surge)",
	},
	{
		name: "Fons Rush",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 21, 9, 2026),
		getEndDate: (server) => serverEOD(server, 28, 9, 2026),
		eventImage: "version1.3/event_fons_rush.webp",
		themeColor: "var(--fons-rush)",
	},
	{
		name: "Shipwreck Salvage",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 28, 8, 2026),
		getEndDate: timings.phase2End,
		eventImage: "version1.3/event_shipwreck_salvage.webp",
		themeColor: "#de3216",
	},
	{
		name: "Runaway Echoes",
		type: "Event",
		getStartDate: timings.phase2Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.3/event_runaway_echoes.webp",
		themeColor: "#58628d",
	},
	{
		name: "Breezy Tour",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 17, 9, 2026),
		getEndDate: timings.phase2End,
		eventImage: "version1.3/event_breezy_tour.webp",
		themeColor: "#f5bddd",
	},
]
