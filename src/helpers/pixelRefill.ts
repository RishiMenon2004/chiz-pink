const REFILL_INTERVAL_MS = 6 * 60 * 1000

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

	return lastEdited + pixelsNeeded * REFILL_INTERVAL_MS
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
		Math.max(now - lastEdited, 0) / REFILL_INTERVAL_MS
	)
	if (intervalsElapsed >= pixelsNeeded) return null

	return lastEdited + (intervalsElapsed + 1) * REFILL_INTERVAL_MS
}
