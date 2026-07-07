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
	chaoticDye,
	colorlessDye,
	lightDye,
} from "@/data/items/materials"
import { findArc } from "@/data/arcs"

import { calcuateWeaponCosts } from "@/helpers/calcuateWeaponCosts"

let cachedPlanner: PlannerRecord = {
	arcs: {},
	characters: {},
}

let lastRawValue: string | null = null

const SERVER_FALLBACK: PlannerRecord = {
	arcs: {},
	characters: {},
}

function updatePlanner(
	data: Pick<PlannerRecord, "arcs"> | Pick<PlannerRecord, "characters">
) {
	if (typeof window === "undefined") return

	const value = localStorage.getItem("planner")
	const plannerData = JSON.parse(value || "{}") as PlannerRecord
	const updatedPlanner: PlannerRecord = { ...plannerData, ...data }

	try {
		localStorage.setItem("planner", JSON.stringify(updatedPlanner))
		window.dispatchEvent(new Event("local-storage-update"))
	} catch (err) {
		console.error("Local Storage Error:", err)
	}

	localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
}

function addCharacter(
	char: Omit<CharacterRecord, "requiredMaterials" | "isDisabled">
) {}
function updateCharacter() {}
function deleteCharacter(char: CharacterRecord) {
	const plannerData = JSON.parse(lastRawValue || "{}") as PlannerRecord
	delete plannerData.characters[char.id]
	updatePlanner({ ...plannerData })
}

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
		{
			id: beetleCoin.id,
			amount: materialValues.beetleCoin,
		},

		{
			id: lightDye.id,
			amount: materialValues.exp.lightDye,
		},
		{
			id: colorlessDye.id,
			amount: materialValues.exp.colorlessDye,
		},
		{
			id: chaoticDye.id,
			amount: materialValues.exp.chaoticDye,
		},

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

function addWeapon(
	weapon: Omit<WeaponRecord, "uid" | "requiredMaterials" | "isDisabled">
) {
	const plannerData = JSON.parse(lastRawValue || "{}") as PlannerRecord
	const newUID = uuidv4()

	updatePlanner({
		arcs: {
			...plannerData.arcs,
			[newUID]: {
				...weapon,
				uid: newUID,
				requiredMaterials: getWeaponRequiredMaterials(weapon),
				isDisabled: false,
			},
		},
	})
}

function updateWeapon(weapon: WeaponRecord) {
	const plannerData = JSON.parse(lastRawValue || "{}") as PlannerRecord
	updatePlanner({
		arcs: {
			...plannerData.arcs,
			[weapon.uid]: {
				...weapon,
				requiredMaterials: getWeaponRequiredMaterials(weapon),
			},
		},
	})
}

function deleteWeapon(weapon: WeaponRecord) {
	const plannerData = JSON.parse(lastRawValue || "{}") as PlannerRecord
	delete plannerData.arcs[weapon.uid]
	updatePlanner({ ...plannerData })
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
		cachedPlanner = JSON.parse(rawValue || "{}") as PlannerRecord
		lastRawValue = rawValue
	}

	return cachedPlanner
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

const getAgregatedMaterials = (
	plannerData: PlannerRecord,
	type: "arc" | "char" | "both" = "both"
) => {
	if (typeof window === "undefined") return {} as AgregateMaterialsType

	const agregatedMaterials: AgregateMaterialsType = {}

	if (plannerData.arcs && (type === "arc" || type == "both")) {
		Object.values(plannerData.arcs).forEach((arc) => {
			if (arc.isDisabled) {
				return
			}

			arc.requiredMaterials.forEach((material) => {
				const currentAgrMaterial = agregatedMaterials[material.id] || {}
				const sources = currentAgrMaterial.sources || []
				const amount = currentAgrMaterial.amount || 0

				const arcName = findArc(arc.id).name
				const sourceName = sources.find((name) => name.includes(arcName))

				if (typeof sourceName === "undefined") {
					sources.push(arcName)
				} else if (sourceName === arcName) {
					const sourceIndex = sources.indexOf(arcName)
					sources[sourceIndex] = `${arcName} x2`
				} else {
					const sourceIndex = sources.indexOf(sourceName)
					if (sourceIndex !== -1) {
						const sourceName = sources[sourceIndex]
						const [name, number] = sourceName.split("x")
						const count = Number(number) + 1
						sources[sourceIndex] = [name, count].join("x")
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
		})
	}

	//TODO: Do the math after finishing the characters page
	if (plannerData.characters && (type === "char" || type == "both")) {
	}

	return agregatedMaterials
}

export function usePlannerStore() {
	const plannerData = useSyncExternalStore<PlannerRecord>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return {
		plannerData,
		updatePlanner,
		getAgregatedMaterials,
		characters: { addCharacter, updateCharacter, deleteCharacter },
		weapons: { addWeapon, updateWeapon, deleteWeapon },
	}
}
