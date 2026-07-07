import { createContext, Dispatch, SetStateAction, useContext } from "react"

import type {
	CumulativeInventory,
	FilterByType,
	FilterRarityType,
	GroupByType,
	SortByType,
} from "@/types/inventory"
import type { CharacterRecord, WeaponRecord } from "@/types/planner"

export const ArcPlannerUsableMaterialsContext = createContext<{
	cumulativeInventory: CumulativeInventory[]
}>(null!)

export function useArcPlannerUsableMaterialsContext() {
	return useContext(ArcPlannerUsableMaterialsContext)
}

export const AddNewArcContext = createContext<{
	newArcRecord: Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	setNewArcRecord: Dispatch<
		SetStateAction<
			Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
		>
	>
}>(null!)

export function useAddArcContext() {
	return useContext(AddNewArcContext)
}

export const AddNewCharContext = createContext<{
	newCharRecord: Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
	setNewCharRecord: Dispatch<
		SetStateAction<Omit<CharacterRecord, "requiredMaterials" | "isDisabled">>
	>
}>(null!)

export function useAddCharContext() {
	return useContext(AddNewCharContext)
}

export const InventoryFilterContext = createContext<{
	filter: FilterByType
	setFilter: Dispatch<SetStateAction<FilterByType>>
	rarityFilter: FilterRarityType
	setRarityFilter: Dispatch<SetStateAction<FilterRarityType>>
	group: GroupByType
	setGroup: Dispatch<SetStateAction<GroupByType>>
	sort: SortByType
	setSort: Dispatch<SetStateAction<SortByType>>
	sortReverse: boolean
	setSortReverse: Dispatch<SetStateAction<boolean>>
}>(null!)

export function useInventoryFilterContext() {
	return useContext(InventoryFilterContext)
}

export const MatAdjustmentContext = createContext<{
	registerAdjustmentAmount: (id: string, callback: () => void) => void
	unregisterAdjustmentAmount: (id: string) => void
}>(null!)

export function useMaterialAdjustmentContext() {
	return useContext(MatAdjustmentContext)
}
