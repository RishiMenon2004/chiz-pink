"use client"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { createKeyvalStore } from "@/helpers/storage/keyvalStore"

import type { HybridPlannerRecord } from "@/types/planner"

export const SERVER_FALLBACK: HybridPlannerRecord = { order: [] }

const store = createKeyvalStore("hybridPlanner", SERVER_FALLBACK)

export const hybridPlannerActions = {
	setOrder(order: string[]) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		store.write({ order })
	},
}

export function useHybridPlannerStore() {
	const hybridPlanner = store.useValue()

	return {
		hybridPlanner,
		actions: {
			setOrder: hybridPlannerActions.setOrder,
		},
	}
}
