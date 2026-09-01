"use client"

import {
	createContext,
	Dispatch,
	MouseEvent,
	SetStateAction,
	useContext,
} from "react"

import type { KeyMouseEventType } from "@/types"
import type {
	CumulativeInventory,
	FilterByType,
	FilterRarityType,
	GroupByType,
	SortByType,
} from "@/types/inventory"
import type { CharacterRecord, WeaponRecord } from "@/types/planner"
import { SettingsRecord } from "@/types/settings"
import { PullsRecord } from "@/types/pulls"
import { EventData } from "@/data/activities/events"

export const PlannerMaterialsContext = createContext<CumulativeInventory[]>([])
export function usePlannerMaterialsContext() {
	return useContext(PlannerMaterialsContext)
}

export const PlannerBoxContext = createContext<{
	itemRecord: CharacterRecord | WeaponRecord
	entryIndex: number
	allMaterialsAcquired: () => boolean
	toggleDisable: (e: MouseEvent<HTMLElement>) => void
	handleEnhancement: (e: MouseEvent<HTMLElement>) => void
	handleDelete: (e: MouseEvent<HTMLElement>) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	changeHandlers: Array<(...args: any[]) => void>
	dragRef: (element: Element | null) => void
}>(null!)
export function usePlannerBoxContext() {
	return useContext(PlannerBoxContext)
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
	addCharacter: (e: KeyMouseEventType, charId: string) => void
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

export const CloudSyncContext = createContext<{
	status: "idle" | "syncing" | "synced" | "error"
	lastSyncedAt: number | null
	latestBackupUpdatedAt: number | null
	syncNow: () => void
}>(null!)
export function useCloudSyncContext() {
	return useContext(CloudSyncContext)
}

export const SettingsConfigContext = createContext<SettingsRecord>(null!)
export function useSettingsConfigContext() {
	return useContext(SettingsConfigContext)
}

export const PullTrackerContext = createContext<{
	selectedBanner: keyof PullsRecord
	setSelectedBanner: Dispatch<SetStateAction<keyof PullsRecord>>
	gachaBanners: EventData[]
}>(null!)
export function usePullTrackerContext() {
	return useContext(PullTrackerContext)
}
