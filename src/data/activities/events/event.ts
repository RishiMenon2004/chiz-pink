import type { Material } from "@/types/item"
import type { SettingsRecord } from "@/types/settings"

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
	rateupItem?: string
}

export type PatchTimings = {
	phase1Start: () => number
	phase1End: () => number
	phase2Start: () => number
	phase2End: () => number
}

export const serverSOD = (
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

export const serverEOD = (
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

export const globalPatchStart = (
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

export const globalPatchEnd = (day: number, month: number, year: number) =>
	getUtcTimestamp({
		year,
		month,
		day,
		hour: 21,
		minute: 59,
	})
