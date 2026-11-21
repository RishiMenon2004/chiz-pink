"use client"

import { useSyncExternalStore } from "react"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { dismissToolIntro } from "@/helpers/toolIntro"
import { safeParse } from "@/helpers/dataCorruption"
import * as idbStorage from "@/helpers/storage/idbStorage"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import type { Inventory, StoredInventoryItem } from "@/types/inventory"

// Inventory lives in IndexedDB's normalized `inventory` store (one row per
// material - see docs/plans/localstorage-to-indexeddb-migration.md §4-style
// rationale), not memoryStorage's generic records cache, so this module
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
	memoryStorage.notifyListeners(INVENTORY_BROADCAST_CHANNEL)
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
		memoryStorage.notifyListeners(INVENTORY_BROADCAST_CHANNEL)
		return
	}

	try {
		const rows = await idbStorage.getAllInventory()
		const next: Inventory = {}
		for (const row of rows) next[row.id] = row.amount
		cachedInventory = next
		memoryStorage.notifyListeners(INVENTORY_BROADCAST_CHANNEL)
	} catch (error) {
		console.error("IndexedDB inventory hydration failed", error)
	}
}

export function updateInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return
	dismissToolIntro("inventory")

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

	memoryStorage.notifyListeners(INVENTORY_BROADCAST_CHANNEL)
	memoryStorage.setItem("lastUpdated", Date.now())
}

// Not gated on isInitialSyncPending() - CloudSyncProvider applies the
// initial cloud pull through this (via backupSetMainImport) while the gate is
// still closed, same as replacePlanner()/replaceAllPulls().
export function replaceInventory(data: Inventory) {
	if (typeof window === "undefined") return

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

	memoryStorage.notifyListeners(INVENTORY_BROADCAST_CHANNEL)
	memoryStorage.setItem("lastUpdated", Date.now())
}

// Used by backupData.ts's eraseLocalData().
export function clearInventory(): void {
	if (typeof window === "undefined") return

	cachedInventory = SERVER_FALLBACK
	memoryStorage.notifyListeners(INVENTORY_BROADCAST_CHANNEL)

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

const subscribeInventory = (listener: () => void) =>
	memoryStorage.subscribeKey(INVENTORY_BROADCAST_CHANNEL, listener)

export function useInventoryStore() {
	const inventory = useSyncExternalStore<Inventory>(
		subscribeInventory,
		getSnapshot,
		getServerSnapshot
	)

	return { inventory, updateInventory }
}

// Subscribes to a single material's count so edits don't wake unrelated tiles.
export function useInventoryAmount(materialId: string): number {
	return useSyncExternalStore(
		subscribeInventory,
		() =>
			typeof window === "undefined"
				? 0
				: cachedInventory[materialId] || 0,
		() => 0
	)
}

// Reads the full inventory only while enabled; returns a stable empty object otherwise.
export function useInventoryWhen(enabled: boolean): Inventory {
	return useSyncExternalStore(
		subscribeInventory,
		() =>
			enabled && typeof window !== "undefined"
				? cachedInventory
				: SERVER_FALLBACK,
		getServerSnapshot
	)
}
