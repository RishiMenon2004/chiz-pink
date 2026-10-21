import type { EventData } from "./event"
import { serverEOD, serverSOD } from "./event"
import { patchTimings } from "./patches"

const timings = patchTimings.version1_2

export const events: EventData[] = [
	{
		name: 'Version 1.2 ("999 Nights")',
		type: "Patch",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.2/version_1.2.webp",
		themeColor: "#c8eec7",
		yOffset: "50%",
	},
	{
		name: "Neon Rift Mystery Box: Regalia Draco",
		type: "Mystery Box",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
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
		getEndDate: timings.phase2End,
		eventImage: "version1.2/event_shadow_seek.webp",
		themeColor: "#875b3e",
	},
	{
		name: "Going, Going, Gone!",
		type: "Event",
		getStartDate: timings.phase2Start,
		getEndDate: timings.phase2End,
		eventImage: "version1.2/event_going_gone.webp",
		themeColor: "#559c68",
	},
	{
		name: "Fishing Frenzy",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 3, 8, 2026),
		getEndDate: timings.phase2End,
		eventImage: "version1.2/event_fishing_frenzy.webp",
		themeColor: "#309f96",
	},
	{
		name: "Warren Lucky Flip",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 5, 8, 2026),
		getEndDate: timings.phase2End,
		eventImage: "version1.2/event_warren_flip.webp",
		themeColor: "#714065",
	},
]
