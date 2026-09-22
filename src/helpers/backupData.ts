import { BackupData } from "@/types/settings"
import { SERVER_FALLBACK as CHECKLIST_FALLBACK } from "@/hooks/useChecklistStore"
import {
	SERVER_FALLBACK as PLANNER_FALLBACK,
	getCachedPlanner,
	replacePlanner,
	clearPlanner,
} from "@/hooks/usePlannerStore"
import { SERVER_FALLBACK as PLANNER_ORDER_FALLBACK } from "@/hooks/usePlannerOrderStore"
import {
	SERVER_FALLBACK as INVENTORY_FALLBACK,
	getCachedInventory,
	replaceInventory,
	clearInventory,
} from "@/hooks/useInventoryStore"
import { SERVER_FALLBACK as SETTINGS_FALLBACK } from "@/hooks/useSettingsStore"
import {
	SERVER_FALLBACK as GACHA_PULL_FALLBACK,
	getCachedPulls,
	replaceAllPulls,
	clearAllPulls,
} from "@/hooks/useGachaStore"

import * as memoryStorage from "./storage/memoryStorage"

// Marks that this device has completed at least one Drive sync exchange
// (push or pull). Once set, a newer remote timestamp is trusted outright
// instead of prompting to overwrite. Deliberately not set by manual JSON
// file import - that's a separate, one-off action from Drive sync.
export function markSynced() {
	memoryStorage.setItem("lastSynced", Date.now())
}

function getFormattedDate(date = new Date()) {
	const yyyy = date.getFullYear()
	const MM = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-indexed
	const DD = String(date.getDate()).padStart(2, "0")
	const hh = String(date.getHours()).padStart(2, "0")
	const mm = String(date.getMinutes()).padStart(2, "0")
	const ss = String(date.getSeconds()).padStart(2, "0")

	return `${yyyy}_${MM}_${DD}_${hh}_${mm}_${ss}`
}

export function buildBackupPayload(): BackupData {
	const lastUpdated = memoryStorage.getItem<number>("lastUpdated", Date.now())

	return {
		lastUpdated,
		checklist: memoryStorage.getItem("checklist", CHECKLIST_FALLBACK),
		inventory: getCachedInventory(),
		planner: getCachedPlanner(),
		plannerOrder: memoryStorage.getItem(
			"plannerOrder",
			PLANNER_ORDER_FALLBACK
		),
		gachaPulls: getCachedPulls(),
		settings: memoryStorage.getItem("settings", SETTINGS_FALLBACK),
	}
}

export function backupExport() {
	const exportJson = JSON.stringify(buildBackupPayload(), null, 2)

	const blob = new Blob([exportJson], { type: "application/json" })
	const url = window.URL.createObjectURL(blob)
	const link = window.document.createElement("a")
	const currentDate = getFormattedDate(new Date(Date.now()))

	link.href = url
	link.download = `chiz-pink.data_backup_${currentDate}.json`
	link.click()

	window.URL.revokeObjectURL(url)
}

export function backupImport(json: string) {
	let data: BackupData | null = null

	try {
		data = JSON.parse(json) satisfies BackupData
	} catch (error) {
		console.error(error)
	}

	if (data === null) {
		return {
			status: "error",
			data: {} as BackupData,
		}
	}

	const lastUpdated = memoryStorage.getItem<number>("lastUpdated", 0)
	const cachedPlanner = getCachedPlanner()
	const hasLocalData =
		memoryStorage.hasItem("checklist") ||
		memoryStorage.hasItem("settings") ||
		Object.keys(getCachedInventory()).length > 0 ||
		Object.keys(cachedPlanner.characters).length > 0 ||
		Object.keys(cachedPlanner.arcs).length > 0
	const remoteLastUpdated = Number(data.lastUpdated)
	const hasSyncedBefore = Boolean(
		memoryStorage.getItem<number | null>("lastSynced", null)
	)

	if (lastUpdated && remoteLastUpdated === lastUpdated) {
		return { status: "synced", data }
	}

	if (lastUpdated && remoteLastUpdated < lastUpdated) {
		return { status: "older", data }
	}

	if (remoteLastUpdated > Date.now()) {
		return { status: "future", data } //WOW!
	}

	if (!hasSyncedBefore && hasLocalData) {
		return { status: "overwrite", data }
	}

	return { status: "newer", data }
}

const ERASABLE_KEYS = [
	"checklist",
	"plannerOrder",
	"settings",
	"lastUpdated",
	"lastSeen",
] as const

export function eraseLocalData() {
	for (const key of ERASABLE_KEYS) {
		memoryStorage.removeItem(key)
	}
	clearInventory()
	clearPlanner()
	clearAllPulls()
}

export function backupSetImport({
	lastUpdated,
	checklist,
	planner,
	plannerOrder,
	gachaPulls,
	inventory,
	settings,
}: BackupData) {
	memoryStorage.setItem("checklist", checklist ?? CHECKLIST_FALLBACK)
	replaceInventory(inventory ?? INVENTORY_FALLBACK)
	replacePlanner(planner ?? PLANNER_FALLBACK)
	memoryStorage.setItem(
		"plannerOrder",
		plannerOrder ?? PLANNER_ORDER_FALLBACK
	)
	replaceAllPulls(gachaPulls ?? GACHA_PULL_FALLBACK)
	memoryStorage.setItem("lastUpdated", lastUpdated)
	memoryStorage.setItem("settings", settings ?? SETTINGS_FALLBACK)
}
