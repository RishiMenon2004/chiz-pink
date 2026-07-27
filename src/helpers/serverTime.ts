import { SettingsRecord } from "@/types/settings"

export const SERVER_UTC_OFFSET_HOURS: Record<
	SettingsRecord["userdata"]["server"],
	number
> = {
	America: -5,
	Europe: 1,
	Asia: 8,
	SEA: 8,
}

// Converts a wall-clock date/time in a server's (fixed, non-DST) time zone
// into the real UTC instant it refers to.
export function getServerTimestamp(
	server: SettingsRecord["userdata"]["server"],
	wallClock: {
		year: number
		month: number
		day: number
		hour?: number
		minute?: number
	}
): number {
	const offsetMs = SERVER_UTC_OFFSET_HOURS[server] * 60 * 60 * 1000

	return getUtcTimestamp(wallClock) - offsetMs
}

export function getUtcTimestamp(wallClock: {
	year: number
	month: number
	day: number
	hour?: number
	minute?: number
}): number {
	const { year, month, day, hour = 0, minute = 0 } = wallClock
	return Date.UTC(year, month - 1, day, hour, minute)
}

function formatUtcOffset(offsetHours: number): string {
	const sign = offsetHours >= 0 ? "+" : "-"
	const abs = Math.abs(offsetHours)
	const hours = Math.floor(abs)
	const minutes = Math.round((abs - hours) * 60)
	return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`
}

// Describes the current calendar day-boundary mode for display in UI labels,
// e.g. "Server Time (UTC+8)" or "Local Time (UTC+5:30)".
export function getDayBoundaryLabel(
	mode: SettingsRecord["appearance"]["calendar-day-boundary"],
	server: SettingsRecord["userdata"]["server"]
): string {
	if (mode === "local") {
		const localOffsetHours = -new Date().getTimezoneOffset() / 60
		return `Local Time (${formatUtcOffset(localOffsetHours)})`
	}

	return `Server Time (${formatUtcOffset(SERVER_UTC_OFFSET_HOURS[server])})`
}
