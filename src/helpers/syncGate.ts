"use client"

import { useSyncExternalStore } from "react"

// Shared flag consulted by the localStorage-backed stores (settings, planner,
// inventory) before they write. While the initial Drive sync check is still
// in flight, a local write could race the incoming pull - either getting
// clobbered by it or bumping lastUpdated so local looks newer than a Drive
// backup it hasn't actually seen yet. DriveSyncProvider is the only writer;
// everything else only reads.
type Listener = () => void

let initialSyncPending = false
const listeners = new Set<Listener>()

export function setInitialSyncPending(value: boolean) {
	if (initialSyncPending === value) return
	initialSyncPending = value
	listeners.forEach((listener) => listener())
}

export function isInitialSyncPending() {
	return initialSyncPending
}

function subscribe(listener: Listener) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

// Reactive read for effects/components that need to re-run once the gate
// opens (e.g. a default-value backfill that only gets one shot on mount).
export function useInitialSyncPending() {
	return useSyncExternalStore(subscribe, isInitialSyncPending, () => false)
}
