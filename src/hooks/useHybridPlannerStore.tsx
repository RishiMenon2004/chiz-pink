"use client"

import { useSyncExternalStore } from "react"

import { isInitialSyncPending } from "@/helpers/syncGate"

import type { HybridPlannerRecord } from "@/types/planner"

let cachedHybridPlanner: HybridPlannerRecord = { order: [] }

let lastRawValue: string | null = null

const SERVER_FALLBACK: HybridPlannerRecord = { order: [] }

export const hybridPlannerActions = {
	setOrder(order: string[]) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		try {
			localStorage.setItem("hybridPlanner", JSON.stringify({ order }))
			localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
			window.dispatchEvent(new Event("local-storage-update"))
		} catch (err) {
			console.error("Local Storage Error:", err)
		}
	},
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

	const rawValue = localStorage.getItem("hybridPlanner")

	if (rawValue !== lastRawValue) {
		cachedHybridPlanner = JSON.parse(
			rawValue || JSON.stringify(SERVER_FALLBACK)
		) as HybridPlannerRecord
		lastRawValue = rawValue
	}

	return cachedHybridPlanner
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useHybridPlannerStore() {
	const hybridPlanner = useSyncExternalStore<HybridPlannerRecord>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return {
		hybridPlanner: hybridPlanner,
		actions: {
			setOrder: hybridPlannerActions.setOrder,
		},
	}
}
