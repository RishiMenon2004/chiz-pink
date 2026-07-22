"use client"

import { useSyncExternalStore } from "react"
import { v4 as uuidv4 } from "uuid"

import { isInitialSyncPending } from "@/helpers/syncGate"

import type { Material } from "@/types/item"
import type {
	AggregateMaterial,
	AggregateMaterialsType,
	CharacterRecord,
	PlannerRecord,
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

import { calcuateWeaponCosts, calculateCharacterCosts } from "@/helpers"

let cachedPlanner: PlannerRecord = { arcs: {}, characters: {} }

let lastRawValue: string | null = null

const SERVER_FALLBACK: PlannerRecord = { arcs: {}, characters: {} }

function getWeaponRequiredMaterials(
	weapon:
		| WeaponRecord
		| Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
) {
	const arc = findArc(weapon.id)
	const materialValues = calcuateWeaponCosts(weapon)

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

		{ id: char.talentBossMaterial.id, amount: materialValues.bossMaterial },

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

	const value = localStorage.getItem("planner")
	return JSON.parse(value || JSON.stringify(SERVER_FALLBACK)) as PlannerRecord
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

		try {
			localStorage.setItem("planner", JSON.stringify(updatedPlanner))
			localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
			window.dispatchEvent(new Event("local-storage-update"))
		} catch (err) {
			console.error("Local Storage Error:", err)
		}
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
		const material = itemRecord.requiredMaterials.find(
			(mat) => mat.id === materialRef.id
		) ?? {
			id: "",
			amount: 0,
		}

		if (!material.id) return

		const currentAgrMaterial = { ...aggregatedMaterial }
		const sources = currentAgrMaterial.sources
		const amount = currentAgrMaterial.amount

		if (sources[itemRecord.id]) {
			sources[itemRecord.id] += 1
		} else {
			sources[itemRecord.id] = 1
		}

		const aggregateAmount = amount + material.amount

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

	const rawValue = localStorage.getItem("planner")

	if (rawValue !== lastRawValue) {
		cachedPlanner = JSON.parse(
			rawValue || JSON.stringify(SERVER_FALLBACK)
		) as PlannerRecord
		lastRawValue = rawValue
	}

	return cachedPlanner
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function usePlannerStore() {
	const plannerData = useSyncExternalStore<PlannerRecord>(
		subscribe,
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
