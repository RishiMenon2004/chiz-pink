"use client"

import { useSyncExternalStore } from "react"

export type Inventory = Record<string, number>

let cachedInventory: Inventory = {}
let lastRawValue: string | null = null

const SERVER_FALLBACK: Inventory = {}

function updateInventory(newInventory: Inventory) {
	if (typeof window === 'undefined') return

	const value = localStorage.getItem("inventory")
	const jsonInventory = { ...JSON.parse(value || "{}"), ...newInventory }

	try {
		localStorage.setItem("inventory", JSON.stringify(jsonInventory))
		window.dispatchEvent(new Event("local-storage-update"));
	} catch (err) {
		console.error("Local Storage Error:", err);
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
	if (typeof window === 'undefined') return SERVER_FALLBACK

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

export default function useInventoryStore() {
	const inventory = useSyncExternalStore<Inventory>(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	)

	return { inventory, updateInventory }
}