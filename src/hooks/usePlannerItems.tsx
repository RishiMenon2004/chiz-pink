"use client"

import { useMemo } from "react"
import { usePlannerStore } from "./usePlannerStore"
import { useHybridPlannerStore } from "./useHybridPlannerStore"
import { CharacterRecord, PlannerRecord, WeaponRecord } from "@/types/planner"
import { isSortable } from "@dnd-kit/react/sortable"
import type { DragEndEvent } from "@dnd-kit/dom"

export function usePlannerItems(plannerType: keyof PlannerRecord | "both") {
	const { plannerData, actions } = usePlannerStore()
	const { hybridPlanner, actions: hybridActions } = useHybridPlannerStore()

	const items: Record<string, CharacterRecord | WeaponRecord> = useMemo(() => {
		if (plannerType !== "both") return plannerData[plannerType]

		const combined: Record<string, CharacterRecord | WeaponRecord> = {
			...plannerData.characters,
			...plannerData.arcs,
		}

		const orderedIds = hybridPlanner.order.filter((id) => id in combined)
		const remainingIds = Object.keys(combined).filter(
			(id) => !orderedIds.includes(id)
		)

		const ordered: Record<string, CharacterRecord | WeaponRecord> = {}
		;[...remainingIds, ...orderedIds].forEach((id) => {
			ordered[id] = combined[id]
		})
		return ordered
	}, [plannerType, plannerData, hybridPlanner])

	const itemsList = useMemo(() => Object.values(items), [items])

	const reorderItems = (initialIndex: number, index: number) => {
		if (initialIndex === index) return

		const list = [...itemsList]
		const [removed] = list.splice(initialIndex, 1)
		list.splice(index, 0, removed)

		if (plannerType === "both") {
			hybridActions.setOrder(
				list.map((item) => ("uid" in item ? item.uid : item.id))
			)
			return
		}

		const newRecord: typeof items = {}
		list.forEach((item) => {
			newRecord["uid" in item ? item.uid : item.id] = item
		})
		actions.updatePlanner({ [plannerType]: newRecord })
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
