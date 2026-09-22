"use client"

import { useSyncExternalStore } from "react"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { safeParse } from "@/helpers/dataCorruption"
import * as idbStorage from "@/helpers/storage/idbStorage"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import type { Inventory, StoredInventoryItem } from "@/types/inventory"

// Inventory lives in IndexedDB's normalized `inventory` store (one row per
// material - see docs/plans/localstorage-to-indexeddb-migration.md §4-style
// rationale), not memoryStorage's generic keyval cache, so this module
// keeps its own small in-memory cache instead of going through
// memoryStorage.getItem/setItem. It rides memoryStorage's shared subscriber
// list and BroadcastChannel via notifyListeners()/broadcastCustom(), the
// same way useGachaStore.tsx does for the normalized `pulls` store.

export const SERVER_FALLBACK: Inventory = {}

const INVENTORY_BROADCAST_CHANNEL = "inventory"
const LEGACY_KEY = "inventory"

let cachedInventory: Inventory = SERVER_FALLBACK
let hydrated = false

function readLegacyBlob(): Inventory {
	const raw = window.localStorage.getItem(LEGACY_KEY)
	return safeParse(raw, SERVER_FALLBACK, LEGACY_KEY)
}

function writeLegacyBlob(inventory: Inventory) {
	try {
		window.localStorage.setItem(LEGACY_KEY, JSON.stringify(inventory))
	} catch (error) {
		console.error("localStorage fallback write failed for inventory", error)
	}
}

memoryStorage.onCustomBroadcast(INVENTORY_BROADCAST_CHANNEL, (payload) => {
	cachedInventory = payload as Inventory
	memoryStorage.notifyListeners()
})

// Bootstraps the inventory cache from IndexedDB. Safe to call more than
// once - only the first call does anything. Mirrors memoryStorage.hydrate()
// and useGachaStore's hydratePullsCache(); AppStorageInitializer (Phase 4)
// calls all three on app start.
export async function hydrateInventoryCache(): Promise<void> {
	if (hydrated || typeof window === "undefined") return
	hydrated = true

	if (memoryStorage.isFallbackMode() || !idbStorage.isIndexedDBAvailable()) {
		cachedInventory = readLegacyBlob()
		memoryStorage.notifyListeners()
		return
	}

	try {
		const rows = await idbStorage.getAllInventory()
		const next: Inventory = {}
		for (const row of rows) next[row.id] = row.amount
		cachedInventory = next
		memoryStorage.notifyListeners()
	} catch (error) {
		console.error("IndexedDB inventory hydration failed", error)
	}
}

export function updateInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	cachedInventory = { ...cachedInventory, ...data }

	if (memoryStorage.isFallbackMode()) {
		writeLegacyBlob(cachedInventory)
	} else {
		const rows: StoredInventoryItem[] = Object.entries(data).map(
			([id, amount]) => ({ id, amount })
		)
		idbStorage.putInventoryItems(rows).catch((error) => {
			console.error("IndexedDB write-through failed for inventory", error)
		})
		memoryStorage.broadcastCustom(INVENTORY_BROADCAST_CHANNEL, cachedInventory)
	}

	// setItem("lastUpdated", ...) notifies this tab's subscribers - see
	// memoryStorage.notifyListeners()'s doc comment.
	memoryStorage.setItem("lastUpdated", Date.now())
}

export function replaceInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	cachedInventory = data

	if (memoryStorage.isFallbackMode()) {
		writeLegacyBlob(data)
	} else {
		const rows: StoredInventoryItem[] = Object.entries(data).map(
			([id, amount]) => ({ id, amount })
		)
		idbStorage.replaceAllInventory(rows).catch((error) => {
			console.error("IndexedDB replace failed for inventory", error)
		})
		memoryStorage.broadcastCustom(INVENTORY_BROADCAST_CHANNEL, data)
	}

	memoryStorage.setItem("lastUpdated", Date.now())
}

// Used by backupData.ts's eraseLocalData().
export function clearInventory(): void {
	if (typeof window === "undefined") return

	cachedInventory = SERVER_FALLBACK
	memoryStorage.notifyListeners()

	if (memoryStorage.isFallbackMode()) {
		window.localStorage.removeItem(LEGACY_KEY)
		return
	}

	idbStorage.clearInventory().catch((error) => {
		console.error("IndexedDB clear failed for inventory", error)
	})

	memoryStorage.broadcastCustom(INVENTORY_BROADCAST_CHANNEL, SERVER_FALLBACK)
}

// Synchronous read of the current inventory cache for non-hook callers
// (backupData.ts's buildBackupPayload()).
export function getCachedInventory(): Inventory {
	return cachedInventory
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK
	return cachedInventory
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useInventoryStore() {
	const inventory = useSyncExternalStore<Inventory>(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return { inventory, updateInventory }
}
