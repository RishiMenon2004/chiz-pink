"use client"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { createKeyvalStore } from "@/helpers/storage/keyvalStore"
import type { Inventory } from "@/types/inventory"

export const SERVER_FALLBACK: Inventory = {}

const store = createKeyvalStore("inventory", SERVER_FALLBACK)

export function updateInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	const inventoryData = store.read()
	store.write({ ...inventoryData, ...data })
}

export function replaceInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	store.write(data)
}

export function useInventoryStore() {
	const inventory = store.useValue()
	return { inventory, updateInventory }
}
