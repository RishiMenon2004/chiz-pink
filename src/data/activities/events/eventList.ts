import type { EventData } from "./event"

import { characterBanners } from "../banners"

import { patchTimings } from "./patches"
import { events as version1_0 } from "./version1_0"
import { events as version1_1 } from "./version1_1"
import { events as version1_2 } from "./version1_2"
import { events as version1_3 } from "./version1_3"
import { events as version1_4 } from "./version1_4"
import { events as version1_5 } from "./version1_5"

const versions = [
	{ timings: patchTimings.version1_0, events: version1_0 },
	{ timings: patchTimings.version1_1, events: version1_1 },
	{ timings: patchTimings.version1_2, events: version1_2 },
	{ timings: patchTimings.version1_3, events: version1_3 },
	{ timings: patchTimings.version1_4, events: version1_4 },
	{ timings: patchTimings.version1_5, events: version1_5 },
]

// Gacha banners live in banners.ts but sit in the calendar's list right
// after their version's Patch entry, where the calendar's row layout
// expects them.
export const Events: EventData[] = versions.flatMap(({ timings, events }) => {
	const start = timings.phase1Start()
	const end = timings.phase2End()
	const banners = characterBanners.filter((banner) => {
		const bannerStart = banner.getStartDate("Asia")
		return start <= bannerStart && bannerStart < end
	})
	const patchCount = events.filter((event) => event.type === "Patch").length

	return [...events.slice(0, patchCount), ...banners, ...events.slice(patchCount)]
})
