import type { EventData } from "./event"
import { patchTimings } from "./patches"

const timings = patchTimings.version1_5

export const events: EventData[] = [
	{
		name: "Version 1.5",
		type: "Patch",
		getStartDate: timings.phase1Start,
		getEndDate: timings.phase2End,
		// eventImage: "version1.4/version_1.4.webp",
		themeColor: "#6a7fe0",
		yOffset: "39%",
	},
]
