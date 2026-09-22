"use client"

import { useSyncExternalStore } from "react"

import { isInitialSyncPending } from "@/helpers/syncGate"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

import type { HybridPlannerRecord } from "@/types/planner"

export const SERVER_FALLBACK: HybridPlannerRecord = { order: [] }

export const hybridPlannerActions = {
	setOrder(order: string[]) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		memoryStorage.setItem("hybridPlanner", { order })
		memoryStorage.setItem("lastUpdated", Date.now())
	},
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK
	return memoryStorage.getItem("hybridPlanner", SERVER_FALLBACK)
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useHybridPlannerStore() {
	const hybridPlanner = useSyncExternalStore<HybridPlannerRecord>(
		memoryStorage.subscribe,
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
