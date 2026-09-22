"use client"

import { useSyncExternalStore } from "react"

import * as memoryStorage from "./memoryStorage"

// Shared read/write/subscribe plumbing for the simple keyval-backed
// *Store hooks (inventory, planner, plannerOrder, settings). Every one of
// them reduces to "read memoryStorage.getItem(key, fallback), write back
// through memoryStorage.setItem, expose it via useSyncExternalStore" - that
// only varied store-to-store back when each one hand-parsed its own
// localStorage JSON string differently. memoryStorage now makes the
// read/write side identical everywhere, so this factory is what each store
// file actually differs on: its key, its fallback shape, and its actions.
//
// Two stores don't use this:
// - useChecklistStore.tsx runs read-time repair logic (backfilling
//   activities added after a save was created) that a plain passthrough
//   getSnapshot can't do, so it keeps its own getSnapshot but still calls
//   store.read()/write() for the plain parts.
// - useGachaStore.tsx keeps its own cache entirely - pulls live in
//   IndexedDB's normalized `pulls` store, not a "gachaPulls" keyval entry,
//   so there's no single key for this factory to wrap.
export function createKeyvalStore<T>(key: string, fallback: T) {
	function read(): T {
		if (typeof window === "undefined") return fallback
		return memoryStorage.getItem(key, fallback)
	}

	// Every store write is expected to bump the shared lastUpdated marker
	// (see docs/plans/localstorage-to-indexeddb-migration.md §2) - pass
	// { silent: true } for a schema-default backfill that isn't a real user
	// edit and shouldn't make local data look newer than an otherwise-
	// identical Drive backup (see useSettingsStore.tsx's SettingsProvider).
	function write(value: T, options?: { silent?: boolean }): void {
		memoryStorage.setItem(key, value)
		if (!options?.silent) {
			memoryStorage.setItem("lastUpdated", Date.now())
		}
	}

	function getSnapshot(): T {
		if (typeof window === "undefined") return fallback
		return memoryStorage.getItem(key, fallback)
	}

	function getServerSnapshot(): T {
		return fallback
	}

	function useValue(): T {
		return useSyncExternalStore(
			memoryStorage.subscribe,
			getSnapshot,
			getServerSnapshot
		)
	}

	return { read, write, useValue }
}
