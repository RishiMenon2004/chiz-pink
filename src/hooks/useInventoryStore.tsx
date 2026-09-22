"use client"

import { useSyncExternalStore } from "react"

import { isInitialSyncPending } from "@/helpers/syncGate"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import type { Inventory } from "@/types/inventory"

export const SERVER_FALLBACK: Inventory = {}

export function updateInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	const inventoryData = memoryStorage.getItem("inventory", SERVER_FALLBACK)
	const newInventory: Inventory = { ...inventoryData, ...data }

	memoryStorage.setItem("inventory", newInventory)
	memoryStorage.setItem("lastUpdated", Date.now())
}

export function replaceInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	memoryStorage.setItem("inventory", data)
	memoryStorage.setItem("lastUpdated", Date.now())
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK
	return memoryStorage.getItem("inventory", SERVER_FALLBACK)
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
