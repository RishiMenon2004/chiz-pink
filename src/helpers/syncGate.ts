"use client"

import { useSyncExternalStore } from "react"

// Shared flag consulted by the *Store hooks (settings, planner, inventory,
// checklist, plannerOrder, gachaPulls) before they write. Combines two
// independent "don't trust local state yet" windows into one gate, so every
// store's existing `if (isInitialSyncPending()) return` check covers both
// without each call site needing to know which one applies:
//
// - Cloud sync: while the initial Convex pull is still in flight, a local
//   write could race the incoming pull - either getting clobbered by it or
//   bumping lastUpdated so local looks newer than a backup it hasn't
//   actually seen yet. CloudSyncProvider is the only writer of this half.
// - Local bootstrap: memoryStorage's IndexedDB hydration (plus the one-time
//   localStorage migration and the pulls cache) is asynchronous, so on
//   every load there's a window where getSnapshot() is still returning each
//   store's empty SERVER_FALLBACK. A write during that window would persist
//   stale defaults right before the real data lands and get clobbered by
//   it - the same race as the cloud-sync one, just against IndexedDB
//   instead of Convex. AppStorageInitializer is the only writer of this
//   half; see docs/plans/localstorage-to-indexeddb-migration.md Phase 4.
type Listener = () => void

let cloudSyncPending = false
// Starts true: every load has an unhydrated window before
// AppStorageInitializer's effect resolves.
let localBootstrapPending = true
const listeners = new Set<Listener>()

function notify() {
	listeners.forEach((listener) => listener())
}

export function setInitialSyncPending(value: boolean) {
	if (cloudSyncPending === value) return
	cloudSyncPending = value
	notify()
}

export function setLocalBootstrapPending(value: boolean) {
	if (localBootstrapPending === value) return
	localBootstrapPending = value
	notify()
}

export function isInitialSyncPending() {
	return cloudSyncPending || localBootstrapPending
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
