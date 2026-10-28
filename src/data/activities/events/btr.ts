import type { EventData } from "./event"
import { serverEOD, serverSOD } from "./event"
import { patchTimings } from "./patches"

export const BTRTimeline: EventData[] = [
	{
		name: "Prime Circle",
		type: "BTR",
		getStartDate: patchTimings.version1_0.phase1Start,
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
		name: "Waxing Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 13, 8, 2026),
		getEndDate: (server) => serverEOD(server, 27, 8, 2026),
	},
	{
		name: "Incandescent Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 27, 8, 2026),
		getEndDate: (server) => serverEOD(server, 10, 9, 2026),
	},
	{
		name: "Whisper Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 10, 9, 2026),
		getEndDate: (server) => serverEOD(server, 24, 9, 2026),
	},
	{
		name: "Starstream Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 24, 9, 2026),
		getEndDate: (server) => serverEOD(server, 8, 10, 2026),
	},
	{
		name: "Sunset Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 8, 10, 2026),
		getEndDate: (server) => serverEOD(server, 22, 10, 2026),
	},
	{
		name: "Lucent Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 22, 10, 2026),
		getEndDate: (server) => serverEOD(server, 5, 11, 2026),
	},
	{
		name: "Glinting Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 5, 11, 2026),
		getEndDate: (server) => serverEOD(server, 19, 11, 2026),
	},
	{
		name: "Frozen Circle",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 19, 11, 2026),
		getEndDate: (server) => serverEOD(server, 3, 12, 2026),
	},
	{
		name: "TBA",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 3, 12, 2026),
		getEndDate: (server) => serverEOD(server, 17, 12, 2026),
	},
	{
		name: "TBA",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 17, 12, 2026),
		getEndDate: (server) => serverEOD(server, 31, 12, 2026),
	},
	{
		name: "TBA",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 31, 12, 2026),
		getEndDate: (server) => serverEOD(server, 14, 1, 2027),
	},
	{
		name: "TBA",
		type: "BTR",
		getStartDate: (server) => serverSOD(server, 14, 1, 2027),
		getEndDate: (server) => serverEOD(server, 28, 1, 2027),
	},
]
