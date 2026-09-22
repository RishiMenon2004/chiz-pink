"use client"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { createKeyvalStore } from "@/helpers/storage/keyvalStore"

import type { PlannerOrderRecord, PlannerRecord } from "@/types/planner"

export const SERVER_FALLBACK: PlannerOrderRecord = {
	hybrid: [],
	characters: [],
	arcs: [],
}

const store = createKeyvalStore("plannerOrder", SERVER_FALLBACK)

export const plannerOrderActions = {
	setHybridOrder(order: string[]) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		store.write({ ...store.read(), hybrid: order })
	},

	setSplitOrder(itemType: keyof PlannerRecord, order: string[]) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		store.write({ ...store.read(), [itemType]: order })
	},
}

export function usePlannerOrderStore() {
	const plannerOrder = store.useValue()

	return {
		plannerOrder,
		actions: {
			setHybridOrder: plannerOrderActions.setHybridOrder,
			setSplitOrder: plannerOrderActions.setSplitOrder,
		},
	}
}
