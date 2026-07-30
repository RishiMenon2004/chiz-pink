"use client"

import { useSyncExternalStore } from "react"

import { isInitialSyncPending } from "@/helpers/syncGate"
import type { Inventory } from "@/types/inventory"

let cachedInventory: Inventory = {}
let lastRawValue: string | null = null

const SERVER_FALLBACK: Inventory = {}

export function updateInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	const value = localStorage.getItem("inventory")
	const inventoryData = { ...JSON.parse(value || "{}") } as Inventory
	const newInventory: Inventory = {...inventoryData, ...data}

	try {
		localStorage.setItem("inventory", JSON.stringify(newInventory))
		localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
		window.dispatchEvent(new Event("local-storage-update"))
	} catch (err) {
		console.error("Local Storage Error:", err)
	}

}

export function replaceInventory(data: Inventory) {
	if (typeof window === "undefined") return
	if (isInitialSyncPending()) return

	try {
		localStorage.setItem("inventory", JSON.stringify(data))
		localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
		window.dispatchEvent(new Event("local-storage-update"))
	} catch (err) {
		console.error("Local Storage Error:", err)
	}
}

const subscribe = (callback: () => void) => {
	window.addEventListener("storage", callback)
	window.addEventListener("local-storage-update", callback)

	return () => {
		window.removeEventListener("storage", callback)
		window.removeEventListener("local-storage-update", callback)
	}
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const rawValue = localStorage.getItem("inventory")

	if (rawValue !== lastRawValue) {
		cachedInventory = JSON.parse(rawValue || "{}")
		lastRawValue = rawValue
	}

	return cachedInventory
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useInventoryStore() {
	const inventory = useSyncExternalStore<Inventory>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return { inventory, updateInventory }
}
