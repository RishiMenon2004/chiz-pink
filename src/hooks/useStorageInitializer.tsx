"use client"

import { useEffect } from "react"

import { setLocalBootstrapPending } from "@/helpers/syncGate"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import { hydratePullsCache } from "./useGachaStore"
import { hydrateInventoryCache } from "./useInventoryStore"
import { hydratePlannerCache } from "./usePlannerStore"

// Boots the IndexedDB-backed storage layer once per page load (see
// docs/plans/localstorage-to-indexeddb-migration.md Phase 4):
//
// 1. memoryStorage.hydrate() - loads the records store into the synchronous
//    cache every *Store hook reads from (or flips into localStorage
//    fallback mode if IndexedDB isn't available).
// 2. hydratePullsCache()/hydrateInventoryCache()/hydratePlannerCache() -
//    same idea for the three stores' own caches (pulls, inventory, planner
//    are normalized IndexedDB stores, not part of memoryStorage's generic
//    records store). Run after step 1 since they need
//    memoryStorage.isFallbackMode() to already be accurate.
//
// setLocalBootstrapPending(false) always runs, even if a step throws -
// otherwise every *Store write would stay gated open forever (see
// syncGate.ts) instead of just degrading for that one load.
export function useStorageInitializer() {
	useEffect(() => {
		let cancelled = false

		async function init() {
			try {
				await memoryStorage.hydrate()
				await Promise.all([
					hydratePullsCache(),
					hydrateInventoryCache(),
					hydratePlannerCache(),
				])
			} catch (error) {
				console.error("Storage hydration failed", error)
			} finally {
				if (!cancelled) setLocalBootstrapPending(false)
			}
		}

		init()

		return () => {
			cancelled = true
		}
	}, [])
}
