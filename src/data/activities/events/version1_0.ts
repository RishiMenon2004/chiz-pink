import { annulith } from "@/data/items/materials"

import type { EventData } from "./event"
import { serverEOD, serverSOD } from "./event"
import { patchTimings } from "./patches"

const timings = patchTimings.version1_0

export const events: EventData[] = [
	{
		name: "Version 1.0 (Global Launch)",
		type: "Patch",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		themeColor: "#50f1ff",
		eventImage: "version1.0/version_1.0.webp",
	},
	{
		name: "Zero's Companion",
		type: "Event",
		getStartDate: timings.phase2Start,
		getEndDate: (server) => serverEOD(server, 27, 5, 2026),
		rewards: [annulith],
		eventImage: "version1.0/event_zeros_companion.webp",
		themeColor: "#74e2f5",
	},
	{
		name: "Whisker Patrol",
		type: "Event",
		getStartDate: (server) => serverSOD(server, 27, 5, 2026),
		getEndDate: timings.phase2End,
		rewards: [annulith],
		themeColor: "#2d6db7",
		eventImage: "version1.0/event_whisker_patrol.webp",
	},
]
