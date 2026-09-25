"use client"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { createRecordStore } from "@/helpers/storage/recordStore"

import type { PlannerOrderRecord, PlannerRecord } from "@/types/planner"

export const SERVER_FALLBACK: PlannerOrderRecord = {
	hybrid: [],
	characters: [],
	arcs: [],
}

const store = createRecordStore("plannerOrder", SERVER_FALLBACK)

// Items without an explicit position (new adds, or a fresh install with no
// saved order yet) sort to the front, ahead of the explicitly-ordered ids -
// matches addCharacter/addWeapon already prepending new entries to the
// planner record itself. Shared by usePlannerItems.tsx (live render order)
// and backupData.ts (export order), so both agree on what "the order" is.
export function applyOrder(order: string[], availableIds: string[]): string[] {
	const orderedIds = order.filter((id) => availableIds.includes(id))
	const remainingIds = availableIds.filter((id) => !orderedIds.includes(id))
	return [...remainingIds, ...orderedIds]
}

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

	// Puts a freshly-added character/weapon first in every view - hybrid and
	// its own split list - instead of leaning on the "unordered ids sort to
	// front" fallback in usePlannerItems.tsx's applyOrder(), which only
	// works within a single type: combinedIds concatenates all characters
	// before all arcs, so an unordered arc added after an unordered
	// character would land behind it in the hybrid view despite being the
	// more recent add. Called directly from plannerActions.addCharacter/
	// addWeapon so "new item goes to the top" holds regardless of which
	// view was open when it was added.
	prependToOrder(itemType: keyof PlannerRecord, id: string) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		const current = store.read()
		store.write({
			...current,
			hybrid: [id, ...current.hybrid.filter((x) => x !== id)],
			[itemType]: [id, ...current[itemType].filter((x) => x !== id)],
		})
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
