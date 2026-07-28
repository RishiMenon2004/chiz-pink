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

// Formats a UTC instant as a date/time string in either the server's fixed
// UTC offset or the viewer's local time zone, matching whichever the
// calendar's day-boundary mode is currently set to.
export function formatEventDateTime(
	timestamp: number,
	mode: SettingsRecord["appearance"]["calendar-day-boundary"],
	server: SettingsRecord["userdata"]["server"],
	options: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}
): string {
	if (mode === "local") {
		return new Date(timestamp).toLocaleString("en-US", options)
	}

	const offsetMs = SERVER_UTC_OFFSET_HOURS[server] * 60 * 60 * 1000
	return new Date(timestamp + offsetMs).toLocaleString("en-US", {
		...options,
		timeZone: "UTC",
	})
}
