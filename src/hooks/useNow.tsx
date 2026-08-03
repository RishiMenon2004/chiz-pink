"use client"

import { useSyncExternalStore } from "react"

// Cached and only advanced once per tick (not read fresh on every call) -
// useSyncExternalStore re-invokes getSnapshot to check for tearing, and a
// getSnapshot that returns a bare Date.now() differs on every single call
// (down to the millisecond), which never stabilizes and throws "Maximum
// update depth exceeded".
let cachedNow = Date.now()

function subscribeToClock(callback: () => void) {
	const interval = setInterval(() => {
		cachedNow = Date.now()
		callback()
	}, 1000)
	return () => clearInterval(interval)
}

function getClockSnapshot(): number | null {
	return cachedNow
}

function getServerClockSnapshot(): number | null {
	return null
}

// Null on the server and on the first client render (so they match and
// hydration doesn't see a Date.now() mismatch), then flips to the real,
// ticking wall-clock time via useSyncExternalStore's own post-hydrate
// resync - the sanctioned way to surface a live external value without
// calling setState from inside an effect.
export function useNow(): number | null {
	return useSyncExternalStore(
		subscribeToClock,
		getClockSnapshot,
		getServerClockSnapshot
	)
}
