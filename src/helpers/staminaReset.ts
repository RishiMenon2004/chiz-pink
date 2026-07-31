import { SettingsRecord } from "@/types/settings"
import { SERVER_UTC_OFFSET_HOURS } from "@/helpers/serverTime"

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

// Daily activities (e.g. Daily Tasks) reset every day at 5:00 AM in the
// selected server's (fixed, non-DST) time zone - the same 5 AM anchor as the
// weekly stamina reset, just without the Monday alignment.
export function getDailyResetBoundaries(
	server: SettingsRecord["userdata"]["server"],
	now: number
) {
	const offsetMs = SERVER_UTC_OFFSET_HOURS[server] * 60 * 60 * 1000
	const shifted = new Date(now + offsetMs)

	const candidate = new Date(shifted)
	candidate.setUTCHours(5, 0, 0, 0)

	if (candidate.getTime() > shifted.getTime()) {
		candidate.setUTCDate(candidate.getUTCDate() - 1)
	}

	const previousReset = candidate.getTime() - offsetMs
	const nextReset = previousReset + 24 * 60 * 60 * 1000

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

const PIXEL_REFILL_INTERVAL_MS = 6 * 60 * 1000

// Returns the epoch ms at which `current` reaches `max`, given the fixed
// refill rate and a baseline timestamp for when `current` was last accurate.
// Returns null when already at (or above) max - there's nothing to refill to.
export function getPixelsRefillTime({
	current,
	max,
	lastEdited,
}: {
	current: number
	max: number
	lastEdited: number
}): number | null {
	const pixelsNeeded = max - current
	if (pixelsNeeded <= 0) return null

	return lastEdited + pixelsNeeded * PIXEL_REFILL_INTERVAL_MS
}

// Returns the epoch ms at which the very next single pixel arrives.
// Returns null once `now` has already caught up to (or passed) full.
export function getNextPixelRecoveryTime({
	current,
	max,
	lastEdited,
	now,
}: {
	current: number
	max: number
	lastEdited: number
	now: number
}): number | null {
	const pixelsNeeded = max - current
	if (pixelsNeeded <= 0) return null

	const intervalsElapsed = Math.floor(
		Math.max(now - lastEdited, 0) / PIXEL_REFILL_INTERVAL_MS
	)
	if (intervalsElapsed >= pixelsNeeded) return null

	return lastEdited + (intervalsElapsed + 1) * PIXEL_REFILL_INTERVAL_MS
}
