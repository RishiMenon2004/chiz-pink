"use client"

import { useSyncExternalStore } from "react"
import { v4 as uuidv4 } from "uuid"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { safeParse } from "@/helpers/dataCorruption"
import * as idbStorage from "@/helpers/storage/idbStorage"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

import type { Material } from "@/types/item"
import type {
	AggregateMaterial,
	AggregateMaterialsType,
	CharacterRecord,
	PlannerItemType,
	PlannerRecord,
	StoredPlannerItem,
	WeaponRecord,
} from "@/types/planner"

import {
	beetleCoin,
	dreamlessSeed,
	expDyeSet,
	expHunterGuideSet,
	fons,
} from "@/data/items/materials"
import { findCharacter } from "@/data/characters"
import { findArc } from "@/data/arcs"

import { calculateWeaponCosts } from "@/helpers/calculateWeaponCosts"
import { calculateCharacterCosts } from "@/helpers/calculateCharacterCosts"

import { plannerOrderActions } from "./usePlannerOrderStore"

// Planner lives in IndexedDB's normalized `planner` store (one row per
// character/weapon, keyed by [itemType, refId] - see
// src/types/planner.ts), not memoryStorage's generic keyval cache, so this
// module keeps its own in-memory cache and rides memoryStorage's shared
// subscriber list and BroadcastChannel, the same way useGachaStore.tsx and
// useInventoryStore.tsx do for their own normalized stores.

export const SERVER_FALLBACK: PlannerRecord = { arcs: {}, characters: {} }

const PLANNER_BROADCAST_CHANNEL = "planner"
const LEGACY_KEY = "planner"

let cachedPlanner: PlannerRecord = SERVER_FALLBACK
let hydrated = false

function readLegacyBlob(): PlannerRecord {
	const raw = window.localStorage.getItem(LEGACY_KEY)
	return safeParse(raw, SERVER_FALLBACK, LEGACY_KEY)
}

function writeLegacyBlob(planner: PlannerRecord) {
	try {
		window.localStorage.setItem(LEGACY_KEY, JSON.stringify(planner))
	} catch (error) {
		console.error("localStorage fallback write failed for planner", error)
	}
}

memoryStorage.onCustomBroadcast(PLANNER_BROADCAST_CHANNEL, (payload) => {
	cachedPlanner = payload as PlannerRecord
	memoryStorage.notifyListeners()
})

// Bootstraps the planner cache from IndexedDB. Safe to call more than once -
// only the first call does anything. Mirrors memoryStorage.hydrate() and
// useGachaStore's hydratePullsCache(); AppStorageInitializer (Phase 4) calls
// all three (plus useInventoryStore's) on app start.
export async function hydratePlannerCache(): Promise<void> {
	if (hydrated || typeof window === "undefined") return
	hydrated = true

	if (memoryStorage.isFallbackMode() || !idbStorage.isIndexedDBAvailable()) {
		cachedPlanner = readLegacyBlob()
		memoryStorage.notifyListeners()
		return
	}

	try {
		const rows = await idbStorage.getAllPlannerItems()
		const next: PlannerRecord = { arcs: {}, characters: {} }
		for (const row of rows) {
			if (row.itemType === "character") next.characters[row.refId] = row.data
			else next.arcs[row.refId] = row.data
		}
		cachedPlanner = next
		memoryStorage.notifyListeners()
	} catch (error) {
		console.error("IndexedDB planner hydration failed", error)
	}
}

// Diffs two PlannerRecords by reference (every mutation helper below always
// constructs a new object for a changed row and reuses the old reference
// for untouched ones via spread), so only the rows that actually changed
// turn into a put/delete - the same batching rationale as putPulls().
function diffPlanner(oldState: PlannerRecord, newState: PlannerRecord) {
	const puts: StoredPlannerItem[] = []
	const deletes: [PlannerItemType, string][] = []

	for (const [refId, data] of Object.entries(newState.characters)) {
		if (oldState.characters[refId] !== data) {
			puts.push({ itemType: "character", refId, data })
		}
	}
	for (const refId of Object.keys(oldState.characters)) {
		if (!(refId in newState.characters)) deletes.push(["character", refId])
	}

	for (const [refId, data] of Object.entries(newState.arcs)) {
		if (oldState.arcs[refId] !== data) {
			puts.push({ itemType: "weapon", refId, data })
		}
	}
	for (const refId of Object.keys(oldState.arcs)) {
		if (!(refId in newState.arcs)) deletes.push(["weapon", refId])
	}

	return { puts, deletes }
}

function getWeaponRequiredMaterials(
	weapon:
		| WeaponRecord
		| Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
) {
	const arc = findArc(weapon.id)
	const materialValues = calculateWeaponCosts(weapon)

	const tiers = ["common", "uncommon", "rare"] as const

	return [
		{ id: beetleCoin.id, amount: materialValues.beetleCoin },

		...tiers.map((tier, index) => ({
			id: expDyeSet[index].id,
			amount: materialValues.exp[tier],
		})),

		...tiers.map((tier, index) => ({
			id: arc.ascensionMaterialSet1[index].id,
			amount: materialValues.ascMaterial1[tier],
		})),

		...tiers.map((tier, index) => ({
			id: arc.ascensionMaterialSet2[index].id,
			amount: materialValues.ascMaterial2[tier],
		})),
	]
}

function getCharRequiredMaterials(
	character:
		| CharacterRecord
		| Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
) {
	const char = findCharacter(character.id)
	const materialValues = calculateCharacterCosts(character)
	const tiers = ["common", "uncommon", "rare"] as const

	return [
		{ id: beetleCoin.id, amount: materialValues.beetleCoin },

		{ id: fons.id, amount: materialValues.fons },
		{ id: dreamlessSeed.id, amount: materialValues.dreamlessSeed },

		{
			id: char.ascensionBossMaterial.id,
			amount: materialValues.bossMaterial,
		},

		{
			id: char.talentBossMaterial.id,
			amount: materialValues.talentBossMaterial,
		},

		...tiers.map((tier, index) => ({
			id: expHunterGuideSet[index].id,
			amount: materialValues.exp[tier],
		})),

		...tiers.map((tier, index) => ({
			id: char.ascensionMaterialSet[index].id,
			amount: materialValues.ascMaterial[tier],
		})),

		...tiers.map((tier, index) => ({
			id: char.talentMaterialSet[index].id,
			amount: materialValues.talentMaterial[tier],
		})),
	]
}

function readPlanner(): PlannerRecord {
	if (typeof window === "undefined") return SERVER_FALLBACK
	return cachedPlanner
}

export const plannerActions = {
	updatePlanner(
		updater:
			| Partial<PlannerRecord>
			| ((current: PlannerRecord) => Partial<PlannerRecord>)
	) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		const plannerData = readPlanner()
		const data =
			typeof updater === "function" ? updater(plannerData) : updater
		const updatedPlanner: PlannerRecord = { ...plannerData, ...data }

		if (memoryStorage.isFallbackMode()) {
			cachedPlanner = updatedPlanner
			writeLegacyBlob(updatedPlanner)
		} else {
			const { puts, deletes } = diffPlanner(plannerData, updatedPlanner)
			cachedPlanner = updatedPlanner

			idbStorage.writePlannerChanges(puts, deletes).catch((error) => {
				console.error("IndexedDB write-through failed for planner", error)
			})
			memoryStorage.broadcastCustom(PLANNER_BROADCAST_CHANNEL, updatedPlanner)
		}

		// setItem("lastUpdated", ...) notifies this tab's subscribers - see
		// memoryStorage.notifyListeners()'s doc comment.
		memoryStorage.setItem("lastUpdated", Date.now())
	},

	addCharacter(
		char: Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
	) {
		this.updatePlanner((current) => ({
			characters: {
				[char.id]: {
					...char,
					requiredMaterials: getCharRequiredMaterials(char),
					isDisabled: false,
				},
				...current.characters,
			},
		}))
		plannerOrderActions.prependToOrder("characters", char.id)
	},

	updateCharacter(char: CharacterRecord) {
		this.updatePlanner((current) => ({
			characters: {
				...current.characters,
				[char.id]: {
					...char,
					requiredMaterials: getCharRequiredMaterials(char),
				},
			},
		}))
	},

	deleteCharacter(char: CharacterRecord) {
		this.updatePlanner((current) => {
			const characters = { ...current.characters }
			delete characters[char.id]
			return { characters }
		})
	},

	addWeapon(
		weapon: Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	) {
		const newUID = uuidv4()

		this.updatePlanner((current) => ({
			arcs: {
				[newUID]: {
					...weapon,
					uid: newUID,
					requiredMaterials: getWeaponRequiredMaterials(weapon),
					isDisabled: false,
				},
				...current.arcs,
			},
		}))
		plannerOrderActions.prependToOrder("arcs", newUID)
	},

	updateWeapon(weapon: WeaponRecord) {
		this.updatePlanner((current) => ({
			arcs: {
				...current.arcs,
				[weapon.uid]: {
					...weapon,
					requiredMaterials: getWeaponRequiredMaterials(weapon),
				},
			},
		}))
	},

	deleteWeapon(weapon: WeaponRecord) {
		this.updatePlanner((current) => {
			const arcs = { ...current.arcs }
			delete arcs[weapon.uid]
			return { arcs }
		})
	},
}

// Full overwrite (backup restore / cloud pull) - unlike updatePlanner(),
// this is a direct replace, not a partial merge. Used by backupData.ts.
export function replacePlanner(data: PlannerRecord): void {
	if (typeof window === "undefined") return

	cachedPlanner = data
	memoryStorage.notifyListeners()

	if (memoryStorage.isFallbackMode()) {
		writeLegacyBlob(data)
		return
	}

	const items: StoredPlannerItem[] = [
		...Object.entries(data.characters).map(
			([refId, itemData]): StoredPlannerItem => ({
				itemType: "character",
				refId,
				data: itemData,
			})
		),
		...Object.entries(data.arcs).map(
			([refId, itemData]): StoredPlannerItem => ({
				itemType: "weapon",
				refId,
				data: itemData,
			})
		),
	]

	idbStorage.replaceAllPlannerItems(items).catch((error) => {
		console.error("IndexedDB replace failed for planner", error)
	})
	memoryStorage.broadcastCustom(PLANNER_BROADCAST_CHANNEL, data)
}

// Used by backupData.ts's eraseLocalData().
export function clearPlanner(): void {
	if (typeof window === "undefined") return

	cachedPlanner = SERVER_FALLBACK
	memoryStorage.notifyListeners()

	if (memoryStorage.isFallbackMode()) {
		window.localStorage.removeItem(LEGACY_KEY)
		return
	}

	idbStorage.clearPlannerItems().catch((error) => {
		console.error("IndexedDB clear failed for planner", error)
	})
	memoryStorage.broadcastCustom(PLANNER_BROADCAST_CHANNEL, SERVER_FALLBACK)
}

// Synchronous read of the current planner cache for non-hook callers
// (backupData.ts's buildBackupPayload()).
export function getCachedPlanner(): PlannerRecord {
	return cachedPlanner
}

export function getAggregatedMaterials(
	plannerData: PlannerRecord,
	type: "arc" | "char" | "both" = "both"
) {
	if (typeof window === "undefined") return {} as AggregateMaterialsType

	const aggregatedMaterials: AggregateMaterialsType = {}

	const { arcs, characters } = plannerData

	function addToAggregate(itemRecord: CharacterRecord | WeaponRecord) {
		itemRecord.requiredMaterials.forEach((material) => {
			const currentAgrMaterial = aggregatedMaterials[material.id] || {
				sources: {},
				amount: 0,
			}
			const sources = currentAgrMaterial.sources
			const amount = currentAgrMaterial.amount

			if (sources[itemRecord.id]) {
				sources[itemRecord.id] += 1
			} else {
				sources[itemRecord.id] = 1
			}

			const aggregateAmount = amount + material.amount

			if (aggregateAmount > 0) {
				aggregatedMaterials[material.id] = {
					amount: aggregateAmount,
					sources: { ...sources },
				}
			}
		})
	}

	if (characters && (type === "char" || type == "both")) {
		Object.values(characters).forEach((char) => {
			if (char.isDisabled) {
				return
			}

			addToAggregate(char)
		})
	}

	if (arcs && (type === "arc" || type == "both")) {
		Object.values(arcs).forEach((arc) => {
			if (arc.isDisabled) {
				return
			}

			addToAggregate(arc)
		})
	}

	return aggregatedMaterials
}

export function getAggregatedMaterial(
	plannerData: PlannerRecord,
	materialRef: Material,
	type: "arc" | "char" | "both" = "both"
) {
	if (typeof window === "undefined") return {} as AggregateMaterial

	let aggregatedMaterial: AggregateMaterial = {
		sources: {},
		amount: 0,
	}

	const { arcs, characters } = plannerData

	function addToAggregate(itemRecord: CharacterRecord | WeaponRecord) {
		const requiredMaterial = itemRecord.requiredMaterials.find(
			(mat) => mat.id === materialRef.id
		) ?? {
			id: "",
			amount: 0,
		}

		if (!requiredMaterial.id) return

		const { sources, amount } = { ...aggregatedMaterial }

		if (requiredMaterial.amount > 0) {
			if (sources[itemRecord.id]) {
				sources[itemRecord.id] += 1
			} else {
				sources[itemRecord.id] = 1
			}
		}

		const aggregateAmount = amount + requiredMaterial.amount

		if (aggregateAmount > 0) {
			aggregatedMaterial = {
				amount: aggregateAmount,
				sources: { ...sources },
			}
		}
	}

	if (characters && (type === "char" || type == "both")) {
		Object.values(characters).forEach((char) => {
			if (char.isDisabled) {
				return
			}

			addToAggregate(char)
		})
	}

	if (arcs && (type === "arc" || type == "both")) {
		Object.values(arcs).forEach((arc) => {
			if (arc.isDisabled) {
				return
			}

			addToAggregate(arc)
		})
	}

	return aggregatedMaterial
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK
	return cachedPlanner
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function usePlannerStore() {
	const plannerData = useSyncExternalStore<PlannerRecord>(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return {
		plannerData,
		actions: {
			updatePlanner: plannerActions.updatePlanner,
			addWeapon: plannerActions.addWeapon,
			updateWeapon: plannerActions.updateWeapon,
			deleteWeapon: plannerActions.deleteWeapon,
			addCharacter: plannerActions.addCharacter,
			updateCharacter: plannerActions.updateCharacter,
			deleteCharacter: plannerActions.deleteCharacter,
		},
	}
}
