import { SettingsRecord } from "@/types/settings"

const SERVER_UTC_OFFSET_HOURS: Record<
	SettingsRecord["userdata"]["server"],
	number
> = {
	America: -5,
	Europe: 1,
	Asia: 8,
	SEA: 8,
}

// City Stamina resets every Monday 5:00 AM in the selected server's (fixed,
// non-DST) time zone. Boundaries are computed by shifting `now` into the
// server's wall-clock time, finding that week's Monday 5:00 AM there, then
// shifting back to a real UTC instant.
export function getStaminaResetBoundaries(
	server: SettingsRecord["userdata"]["server"],
	now: number
) {
	const offsetMs = SERVER_UTC_OFFSET_HOURS[server] * 60 * 60 * 1000
	const shifted = new Date(now + offsetMs)

	const daysSinceMonday = (shifted.getUTCDay() + 6) % 7

	const candidate = new Date(shifted)
	candidate.setUTCDate(candidate.getUTCDate() - daysSinceMonday)
	candidate.setUTCHours(5, 0, 0, 0)

	if (candidate.getTime() > shifted.getTime()) {
		candidate.setUTCDate(candidate.getUTCDate() - 7)
	}

	const previousReset = candidate.getTime() - offsetMs
	const nextReset = previousReset + 7 * 24 * 60 * 60 * 1000

	return { previousReset, nextReset }
}

export function formatTimeRemaining(ms: number): string {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000))
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	return `${days}d ${hours}h ${minutes}m ${seconds}s`
}
