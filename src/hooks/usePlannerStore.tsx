"use client"

import { findArc } from "@/database/arcs"
import { Item, EnumItemLvls } from "@/database/items"
import {
	beetleCoin,
	chaoticDye,
	colorlessDye,
	lightDye,
} from "@/database/items/materials"
import { useSyncExternalStore } from "react"
import { v4 as uuidv4 } from "uuid"

type SkillLvl = {
	currentLvl: number
	targetLvl: number
}

export interface CharacterRecord extends Pick<Item, "id"> {
	currentLvl: EnumItemLvls
	targetLvl: EnumItemLvls
	abilitySet: {
		basicAttack: SkillLvl
		skill: SkillLvl
		ultimate: SkillLvl
		support: SkillLvl
		passive1: SkillLvl
		passive2?: SkillLvl
		passive3?: SkillLvl
		lifeSkill1: SkillLvl
		lifeSkill2?: SkillLvl
	}
	awakening: number
	requiredMaterials: {
		id: string
		amount: number
	}[]
}
export interface WeaponRecord extends Pick<Item, "id"> {
	uid: string
	currentLvl: EnumItemLvls
	targetLvl: EnumItemLvls
	requiredMaterials: {
		id: string
		amount: number
	}[]
}
export type PlannerRecord = {
	arcs: Record<string, WeaponRecord>
	characters: Record<string, CharacterRecord>
}

let cachedPlanner: PlannerRecord = {
	arcs: {},
	characters: {},
}

let lastRawValue: string | null = null

export type AgregateMaterialsType = Record<
	string,
	{
		amount: number
		sources: string[]
	}
>

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
}

function addCharacter() {}
function updateCharacter() {}
function deleteCharacter(char: CharacterRecord) {
	const plannerData = JSON.parse(lastRawValue || "{}") as PlannerRecord
	delete plannerData.characters[char.id]
	updatePlanner({ ...plannerData })
}

const weaponPhasesMaterials = {
	1: {
		beetleCoin: 0,
		exp: {
			lightDye: 0,
			colorlessDye: 0,
			chaoticDye: 0,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},

	20: {
		beetleCoin: 10050,
		exp: {
			lightDye: 2,
			colorlessDye: 1,
			chaoticDye: 3,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},

	21: {
		beetleCoin: 20000,
		exp: {
			lightDye: 0,
			colorlessDye: 0,
			chaoticDye: 0,
		},
		ascMaterial1: {
			common: 4,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 4,
			uncommon: 0,
			rare: 0,
		},
	},

	30: {
		beetleCoin: 26400,
		exp: {
			lightDye: 1,
			colorlessDye: 3,
			chaoticDye: 8,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},

	31: {
		beetleCoin: 40000,
		exp: {
			lightDye: 0,
			colorlessDye: 0,
			chaoticDye: 0,
		},
		ascMaterial1: {
			common: 10,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 10,
			uncommon: 0,
			rare: 0,
		},
	},

	40: {
		beetleCoin: 56100,
		exp: {
			lightDye: 4,
			colorlessDye: 2,
			chaoticDye: 18,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},

	41: {
		beetleCoin: 60000,
		exp: {
			lightDye: 0,
			colorlessDye: 0,
			chaoticDye: 0,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 6,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 6,
			rare: 0,
		},
	},

	50: {
		beetleCoin: 98400,
		exp: {
			lightDye: 1,
			colorlessDye: 3,
			chaoticDye: 32,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},

	51: {
		beetleCoin: 80000,
		exp: {
			lightDye: 0,
			colorlessDye: 0,
			chaoticDye: 0,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 12,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 12,
			rare: 0,
		},
	},

	60: {
		beetleCoin: 160350,
		exp: {
			lightDye: 4,
			colorlessDye: 1,
			chaoticDye: 53,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},

	61: {
		beetleCoin: 100000,
		exp: {
			lightDye: 0,
			colorlessDye: 0,
			chaoticDye: 0,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 6,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 6,
		},
	},

	70: {
		beetleCoin: 261000,
		exp: {
			lightDye: 5,
			colorlessDye: 3,
			chaoticDye: 86,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},

	71: {
		beetleCoin: 120000,
		exp: {
			lightDye: 0,
			colorlessDye: 0,
			chaoticDye: 0,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 12,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 12,
		},
	},

	80: {
		beetleCoin: 425250,
		exp: {
			lightDye: 5,
			colorlessDye: 2,
			chaoticDye: 141,
		},
		ascMaterial1: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
		ascMaterial2: {
			common: 0,
			uncommon: 0,
			rare: 0,
		},
	},
}

function calcuateWeaponMaterials(
	currentLvl: EnumItemLvls,
	targetLvl: EnumItemLvls
) {
	const totals = {
		beetleCoin: 0,
		exp: { lightDye: 0, colorlessDye: 0, chaoticDye: 0 },
		ascMaterial1: { common: 0, uncommon: 0, rare: 0 },
		ascMaterial2: { common: 0, uncommon: 0, rare: 0 },
	}

	if (currentLvl >= targetLvl) {
		return totals
	}

	Object.keys(weaponPhasesMaterials)
		.map(Number)
		.filter((lvl) => lvl > currentLvl && lvl <= targetLvl)
		.forEach((lvl) => {
			const phase =
				weaponPhasesMaterials[lvl as keyof typeof weaponPhasesMaterials]

			if (!phase) return

			totals.beetleCoin += phase.beetleCoin

			totals.exp.lightDye += phase.exp.lightDye
			totals.exp.colorlessDye += phase.exp.colorlessDye
			totals.exp.chaoticDye += phase.exp.chaoticDye

			totals.ascMaterial1.common += phase.ascMaterial1.common
			totals.ascMaterial1.uncommon += phase.ascMaterial1.uncommon
			totals.ascMaterial1.rare += phase.ascMaterial1.rare

			totals.ascMaterial2.common += phase.ascMaterial2.common
			totals.ascMaterial2.uncommon += phase.ascMaterial2.uncommon
			totals.ascMaterial2.rare += phase.ascMaterial2.rare
		})

	return totals
}

function createWeaponRequiredMaterialsList(
	weapon:
		| Omit<WeaponRecord, "uid" | "requiredMaterials">
		| Omit<WeaponRecord, "requiredMaterials">
) {
	const arc = findArc(weapon.id)
	const materialValues = calcuateWeaponMaterials(
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

function addWeapon(weapon: Omit<WeaponRecord, "uid" | "requiredMaterials">) {
	const plannerData = JSON.parse(lastRawValue || "{}") as PlannerRecord
	const newUID = uuidv4()

	updatePlanner({
		arcs: {
			...plannerData.arcs,
			[newUID]: {
				...weapon,
				uid: newUID,
				requiredMaterials: createWeaponRequiredMaterialsList(weapon),
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
				requiredMaterials: createWeaponRequiredMaterialsList(weapon),
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

const getAgregatedMaterials = () => {
	if (typeof window === "undefined") return {} as AgregateMaterialsType

	const plannerData = JSON.parse(lastRawValue || "{}") as PlannerRecord

	const agregatedMaterials: AgregateMaterialsType = {}

	if (plannerData.arcs) {
		Object.values(plannerData.arcs).forEach((arc) => {
			arc.requiredMaterials.forEach((material) => {
				const currentAgrMaterial = agregatedMaterials[material.id] || {}
				const sources = currentAgrMaterial.sources || []
				const amount = currentAgrMaterial.amount || 0

				const arcName = findArc(arc.id).name

				if (!sources.includes(arcName)) {
					sources.push(arcName)
				}

				agregatedMaterials[material.id] = {
					amount: amount + material.amount,
					sources: [...sources],
				}
			})
		})
	}

	//TODO: Do the math after finishing the characters page
	if (plannerData.characters) {
	}

	return agregatedMaterials
}

export default function usePlanner() {
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
