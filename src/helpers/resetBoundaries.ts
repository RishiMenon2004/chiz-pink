import { SettingsRecord } from "@/types/settings"
import { SERVER_UTC_OFFSET_HOURS, getServerTimestamp } from "@/helpers/serverTime"
import { BTRTimeline, patchTimings } from "@/data/activities/events"

// Daily activities (e.g. Daily Tasks) reset every day at 5:00 AM in the
// selected server's (fixed, non-DST) time zone.
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

// Weekly activities (and City Stamina, which shares this schedule - see
// staminaReset.ts) reset every Monday 5:00 AM in the selected server's
// (fixed, non-DST) time zone. Boundaries are computed by shifting `now`
// into the server's wall-clock time, finding that week's Monday 5:00 AM
// there, then shifting back to a real UTC instant.
export function getWeeklyResetBoundaries(
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

// Monthly activities reset on the 1st of the month at 5:00 AM in the
// selected server's (fixed, non-DST) time zone.
export function getMonthlyResetBoundaries(
	server: SettingsRecord["userdata"]["server"],
	now: number
) {
	const offsetMs = SERVER_UTC_OFFSET_HOURS[server] * 60 * 60 * 1000
	const shifted = new Date(now + offsetMs)

	const candidate = new Date(
		Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1, 5, 0, 0, 0)
	)

	if (candidate.getTime() > shifted.getTime()) {
		candidate.setUTCMonth(candidate.getUTCMonth() - 1)
	}

	const previousReset = candidate.getTime() - offsetMs

	const nextCandidate = new Date(candidate)
	nextCandidate.setUTCMonth(nextCandidate.getUTCMonth() + 1)
	const nextReset = nextCandidate.getTime() - offsetMs

	return { previousReset, nextReset }
}

// Bi-weekly reset #1: fires every other Monday at 5:00 AM server time.
// Anchored to the confirmed reset on Monday Aug 17, 2026 so the
// every-other-week parity is fixed rather than inferred from `now`.
const BIWEEKLY_MONDAY_ANCHOR_WALLCLOCK = {
	year: 2026,
	month: 8,
	day: 17,
	hour: 5,
}
const BIWEEKLY_PERIOD_MS = 14 * 24 * 60 * 60 * 1000

export function getBiWeeklyMondayResetBoundaries(
	server: SettingsRecord["userdata"]["server"],
	now: number
) {
	const anchor = getServerTimestamp(server, BIWEEKLY_MONDAY_ANCHOR_WALLCLOCK)
	const elapsedPeriods = Math.floor((now - anchor) / BIWEEKLY_PERIOD_MS)

	const previousReset = anchor + elapsedPeriods * BIWEEKLY_PERIOD_MS
	const nextReset = previousReset + BIWEEKLY_PERIOD_MS

	return { previousReset, nextReset }
}

// Bi-weekly reset #2: shares the exact boundary dates used by the BTR
// (Beyond the Rails) timeline in events.ts. Resets fire when an
// entry starts, so both boundaries come from start times: the current
// entry's start as previousReset and the upcoming entry's start as nextReset.
export function getBiWeeklyWednesdayResetBoundaries(
	server: SettingsRecord["userdata"]["server"],
	now: number
) {
	let previousReset = 0
	let nextReset = BTRTimeline[0].getStartDate(server)

	for (let i = 0; i < BTRTimeline.length; i++) {
		const start = BTRTimeline[i].getStartDate(server)

		if (start > now) break

		previousReset = start
		nextReset = BTRTimeline[i + 1]?.getStartDate(server) ?? start
	}

	return { previousReset, nextReset }
}

// Seasonal activities reset when the next game version goes live, i.e. the
// boundary is the current version's Phase 1 start, and the next reset is
// the *upcoming* version's Phase 1 start.
export function getSeasonalResetBoundaries(now: number) {
	const versionStarts = Object.values(patchTimings)
		.map((version) => version.phase1Start())
		.sort((a, b) => a - b)

	let previousReset = versionStarts[0]
	let nextReset = versionStarts[0]

	for (let i = 0; i < versionStarts.length; i++) {
		if (versionStarts[i] <= now) {
			previousReset = versionStarts[i]
			nextReset = versionStarts[i + 1] ?? versionStarts[i]
		}
	}

	return { previousReset, nextReset }
}
