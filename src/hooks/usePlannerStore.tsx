"use client"

import { useSyncExternalStore } from "react"
import { v4 as uuidv4 } from "uuid"

import type {
	AgregateMaterialsType,
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
import { findArc } from "@/data/arcs"

import { calcuateWeaponCosts } from "@/helpers"
import { calculateCharacterCosts } from "@/helpers"
import { findCharacter } from "@/data/characters/characterList"

let cachedPlanner: PlannerRecord = { arcs: {}, characters: {} }

let lastRawValue: string | null = null

const SERVER_FALLBACK: PlannerRecord = { arcs: {}, characters: {} }

function getWeaponRequiredMaterials(
	weapon:
		| WeaponRecord
		| Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
) {
	const arc = findArc(weapon.id)
	const materialValues = calcuateWeaponCosts(
		arc.rarity,
		weapon.currentLvl,
		weapon.targetLvl
	)

	return [
		{ id: beetleCoin.id, amount: materialValues.beetleCoin },

		{ id: expDyeSet[0].id, amount: materialValues.exp.lightDye },
		{ id: expDyeSet[1].id, amount: materialValues.exp.colorlessDye },
		{ id: expDyeSet[2].id, amount: materialValues.exp.chaoticDye },

		{
			id: arc.ascensionMaterial1[0].id,
			amount: materialValues.ascMaterial1.common,
		},
		{
			id: arc.ascensionMaterial1[1].id,
			amount: materialValues.ascMaterial1.uncommon,
		},
		{
			id: arc.ascensionMaterial1[2].id,
			amount: materialValues.ascMaterial1.rare,
		},

		{
			id: arc.ascensionMaterial2[0].id,
			amount: materialValues.ascMaterial2.common,
		},
		{
			id: arc.ascensionMaterial2[1].id,
			amount: materialValues.ascMaterial2.uncommon,
		},
		{
			id: arc.ascensionMaterial2[2].id,
			amount: materialValues.ascMaterial2.rare,
		},
	]
}
function getCharRequiredMaterials(
	character:
		| CharacterRecord
		| Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
) {
	const char = findCharacter(character.id)
	const materialValues = calculateCharacterCosts(character)

	return [
		{ id: beetleCoin.id, amount: materialValues.beetleCoin },

		{ id: fons.id, amount: materialValues.fons },
		{ id: dreamlessSeed.id, amount: materialValues.dreamlessSeed },

		{ id: char.talentBossMaterial.id, amount: materialValues.bossMaterial },

		{ id: expHunterGuideSet[0].id, amount: materialValues.exp.common },
		{ id: expHunterGuideSet[1].id, amount: materialValues.exp.uncommon },
		{ id: expHunterGuideSet[2].id, amount: materialValues.exp.rare },

		{
			id: char.ascensionMaterialSet[0].id,
			amount: materialValues.ascMaterial.common,
		},
		{
			id: char.ascensionMaterialSet[1].id,
			amount: materialValues.ascMaterial.uncommon,
		},
		{
			id: char.ascensionMaterialSet[2].id,
			amount: materialValues.ascMaterial.rare,
		},

		{
			id: char.talentMaterialSet[0].id,
			amount: materialValues.talentMaterial.common,
		},
		{
			id: char.talentMaterialSet[1].id,
			amount: materialValues.talentMaterial.uncommon,
		},
		{
			id: char.talentMaterialSet[2].id,
			amount: materialValues.talentMaterial.rare,
		},
	]
}

export const plannerActions = {
	updatePlanner(data: Partial<PlannerRecord>) {
		if (typeof window === "undefined") return

		const value = localStorage.getItem("planner")
		const plannerData = JSON.parse(
			value || JSON.stringify(SERVER_FALLBACK)
		) as PlannerRecord
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
		plannerData: PlannerRecord,
		char: Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
	) {
		this.updatePlanner({
			characters: {
				...plannerData.characters,
				[char.id]: {
					...char,
					requiredMaterials: getCharRequiredMaterials(char),
					isDisabled: false,
				},
			},
		})
	},

	updateCharacter(plannerData: PlannerRecord, char: CharacterRecord) {
		this.updatePlanner({
			characters: {
				...plannerData.characters,
				[char.id]: {
					...char,
					requiredMaterials: getCharRequiredMaterials(char),
				},
			},
		})
	},

	deleteCharacter(plannerData: PlannerRecord, char: CharacterRecord) {
		delete plannerData.characters[char.id]
		this.updatePlanner({ ...plannerData })
	},

	addWeapon(
		plannerData: PlannerRecord,
		weapon: Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
	) {
		const newUID = uuidv4()

		this.updatePlanner({
			arcs: {
				[newUID]: {
					...weapon,
					uid: newUID,
					requiredMaterials: getWeaponRequiredMaterials(weapon),
					isDisabled: false,
				},
				...plannerData.arcs,
			},
		})
	},

	updateWeapon(plannerData: PlannerRecord, weapon: WeaponRecord) {
		this.updatePlanner({
			arcs: {
				...plannerData.arcs,
				[weapon.uid]: {
					...weapon,
					requiredMaterials: getWeaponRequiredMaterials(weapon),
				},
			},
		})
	},

	deleteWeapon(plannerData: PlannerRecord, weapon: WeaponRecord) {
		delete plannerData.arcs[weapon.uid]

		this.updatePlanner({ ...plannerData })
	},
}

export function getAggregatedMaterials(
	plannerData: PlannerRecord,
	type: "arc" | "char" | "both" = "both"
) {
	if (typeof window === "undefined") return {} as AgregateMaterialsType

	const agregatedMaterials: AgregateMaterialsType = {}

	const { arcs, characters } = plannerData

	function addToAggregate(itemRecord: CharacterRecord | WeaponRecord) {
		itemRecord.requiredMaterials.forEach((material) => {
			const currentAgrMaterial = agregatedMaterials[material.id] || {}
			const sources = currentAgrMaterial.sources || []
			const amount = currentAgrMaterial.amount || 0

			const itemName =
				"uid" in itemRecord
					? findArc(itemRecord.id).name
					: findCharacter(itemRecord.id).name
			const sourceName = sources.find((name) => name.includes(itemName))

			if (typeof sourceName === "undefined") {
				sources.push(itemName)
			} else if (sourceName === itemName) {
				const sourceIndex = sources.indexOf(itemName)
				sources[sourceIndex] = `${itemName} ×2`
			} else {
				const sourceIndex = sources.indexOf(sourceName)
				if (sourceIndex !== -1) {
					const sourceName = sources[sourceIndex]
					const [name, number] = sourceName.split("×")
					const count = Number(number) + 1
					sources[sourceIndex] = [name, count].join("×")
				}
			}

			const agregateAmount = amount + material.amount

			if (agregateAmount > 0) {
				agregatedMaterials[material.id] = {
					amount: agregateAmount,
					sources: [...sources],
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

	return agregatedMaterials
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
			addWeapon: (
				weapon: Omit<
					WeaponRecord,
					"uid" | "requiredMaterials" | "isDisabled"
				>
			) => plannerActions.addWeapon(plannerData, weapon),
			updateWeapon: (weapon: WeaponRecord) =>
				plannerActions.updateWeapon(plannerData, weapon),
			deleteWeapon: (weapon: WeaponRecord) =>
				plannerActions.deleteWeapon(plannerData, weapon),
			addCharacter: (
				char: Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
			) => plannerActions.addCharacter(plannerData, char),
			updateCharacter: (char: CharacterRecord) =>
				plannerActions.updateCharacter(plannerData, char),
			deleteCharacter: (char: CharacterRecord) =>
				plannerActions.deleteCharacter(plannerData, char),
		},
	}
}
