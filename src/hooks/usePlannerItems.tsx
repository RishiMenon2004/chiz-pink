"use client"

import { useMemo } from "react"
import { usePlannerStore } from "./usePlannerStore"
import { usePlannerOrderStore } from "./usePlannerOrderStore"
import { CharacterRecord, PlannerRecord, WeaponRecord } from "@/types/planner"
import { isSortable } from "@dnd-kit/react/sortable"
import type { DragEndEvent } from "@dnd-kit/dom"

// Items without an explicit position (new adds, or a fresh install with no
// saved order yet) sort to the front, ahead of the explicitly-ordered ids -
// matches addCharacter/addWeapon already prepending new entries to the
// planner record itself.
function applyOrder(order: string[], availableIds: string[]): string[] {
	const orderedIds = order.filter((id) => availableIds.includes(id))
	const remainingIds = availableIds.filter((id) => !orderedIds.includes(id))
	return [...remainingIds, ...orderedIds]
}

export function usePlannerItems(plannerType: keyof PlannerRecord | "both") {
	const { plannerData } = usePlannerStore()
	const { plannerOrder, actions: orderActions } = usePlannerOrderStore()

	const combinedIds = useMemo(
		() => [
			...Object.keys(plannerData.characters),
			...Object.keys(plannerData.arcs),
		],
		[plannerData]
	)

	// The hybrid order actually rendered right now, including ids that don't
	// have an explicit position yet - this is what a split-mode reorder needs
	// to anchor into, not the raw (possibly partial) stored order array.
	const displayedHybridOrder = useMemo(
		() => applyOrder(plannerOrder.hybrid, combinedIds),
		[plannerOrder, combinedIds]
	)

	const items: Record<string, CharacterRecord | WeaponRecord> = useMemo(() => {
		if (plannerType !== "both") {
			const source = plannerData[plannerType]
			const order = applyOrder(plannerOrder[plannerType], Object.keys(source))

			const ordered: Record<string, CharacterRecord | WeaponRecord> = {}
			order.forEach((id) => {
				ordered[id] = source[id]
			})
			return ordered
		}

		const combined: Record<string, CharacterRecord | WeaponRecord> = {
			...plannerData.characters,
			...plannerData.arcs,
		}

		const ordered: Record<string, CharacterRecord | WeaponRecord> = {}
		displayedHybridOrder.forEach((id) => {
			ordered[id] = combined[id]
		})
		return ordered
	}, [plannerType, plannerData, plannerOrder, displayedHybridOrder])

	const itemsList = useMemo(() => Object.values(items), [items])

	const reorderItems = (initialIndex: number, index: number) => {
		if (initialIndex === index) return

		const list = [...itemsList]
		const [removed] = list.splice(initialIndex, 1)
		list.splice(index, 0, removed)
		const movedId = "uid" in removed ? removed.uid : removed.id

		if (plannerType === "both") {
			const newHybridOrder = list.map((item) =>
				"uid" in item ? item.uid : item.id
			)
			orderActions.setHybridOrder(newHybridOrder)

			// Split order becomes "the new hybrid order, filtered to that type" -
			// the moved item only belongs to one type, but recomputing both keeps
			// them trivially in sync with the new interleaving.
			orderActions.setSplitOrder(
				"characters",
				newHybridOrder.filter((id) => id in plannerData.characters)
			)
			orderActions.setSplitOrder(
				"arcs",
				newHybridOrder.filter((id) => id in plannerData.arcs)
			)
			return
		}

		const newSplitOrder = list.map((item) =>
			"uid" in item ? item.uid : item.id
		)
		orderActions.setSplitOrder(plannerType, newSplitOrder)

		// Ripple into the hybrid order: anchor the moved item next to its new
		// split-order neighbor instead of recomputing hybrid order from
		// scratch, so the *other* item type's interleaved positions are left
		// untouched.
		const idxInSplit = newSplitOrder.indexOf(movedId)
		const neighborAfter = newSplitOrder[idxInSplit + 1]
		const neighborBefore = newSplitOrder[idxInSplit - 1]

		const withoutMoved = displayedHybridOrder.filter((id) => id !== movedId)

		let insertAt =
			neighborAfter !== undefined ? withoutMoved.indexOf(neighborAfter) : -1

		if (insertAt === -1 && neighborBefore !== undefined) {
			const beforeIdx = withoutMoved.indexOf(neighborBefore)
			insertAt = beforeIdx === -1 ? -1 : beforeIdx + 1
		}

		if (insertAt === -1) insertAt = withoutMoved.length

		orderActions.setHybridOrder([
			...withoutMoved.slice(0, insertAt),
			movedId,
			...withoutMoved.slice(insertAt),
		])
	}

	const handleDragEnd = (e: DragEndEvent) => {
		if (e.canceled) return

		const { source } = e.operation
		if (!isSortable(source)) return

		const { initialIndex, index } = source
		reorderItems(initialIndex, index)
	}

	return {
		items,
		itemsList,
		reorderItems,
		handleDragEnd,
	}
}
