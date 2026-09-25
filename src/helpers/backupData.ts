import type { PlannerRecord, StoredPlannerItem } from "@/types/planner"
import { BackupData, MainBackupData, GachaBackupData } from "@/types/settings"
import { SERVER_FALLBACK as CHECKLIST_FALLBACK } from "@/hooks/useChecklistStore"
import {
	getCachedPlanner,
	replacePlanner,
	clearPlanner,
} from "@/hooks/usePlannerStore"
import {
	SERVER_FALLBACK as PLANNER_ORDER_FALLBACK,
	applyOrder,
} from "@/hooks/usePlannerOrderStore"
import {
	SERVER_FALLBACK as INVENTORY_FALLBACK,
	getCachedInventory,
	replaceInventory,
	clearInventory,
} from "@/hooks/useInventoryStore"
import { SERVER_FALLBACK as SETTINGS_FALLBACK } from "@/hooks/useSettingsStore"
import {
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

// Characters and arcs merged into one list, in the same order the hybrid
// planner view renders them (unordered ids first, then explicitly-ordered
// ids - see applyOrder()) - matches the shape backupSetImport() below splits
// back apart.
function getOrderedPlannerItems(): StoredPlannerItem[] {
	const planner = getCachedPlanner()
	const plannerOrder = memoryStorage.getItem("plannerOrder", PLANNER_ORDER_FALLBACK)

	const combinedIds = [
		...Object.keys(planner.characters),
		...Object.keys(planner.arcs),
	]

	return applyOrder(plannerOrder.hybrid, combinedIds).map(
		(refId): StoredPlannerItem =>
			refId in planner.characters
				? { itemType: "character", refId, data: planner.characters[refId] }
				: { itemType: "weapon", refId, data: planner.arcs[refId] }
	)
}

// Builds the decoupled main cloud sync payload (everything except gacha pulls)
export function buildMainPayload(): MainBackupData {
	const lastUpdated = memoryStorage.getItem<number>("lastUpdated", Date.now())

	return {
		lastUpdated,
		checklist: memoryStorage.getItem("checklist", CHECKLIST_FALLBACK),
		inventory: getCachedInventory(),
		planner: getOrderedPlannerItems(),
		settings: memoryStorage.getItem("settings", SETTINGS_FALLBACK),
	}
}

// Builds the decoupled gacha cloud sync payload
export function buildGachaPayload(): GachaBackupData {
	const gachaLastUpdated = memoryStorage.getItem<number>(
		"gachaLastUpdated",
		Date.now()
	)

	return {
		gachaLastUpdated,
		gachaPulls: getCachedPulls(),
	}
}

// Combined payload for manual file export
export function buildBackupPayload(): BackupData {
	const main = buildMainPayload()
	const gacha = buildGachaPayload()

	return {
		...main,
		gachaPulls: gacha.gachaPulls,
		gachaLastUpdated: gacha.gachaLastUpdated,
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStoredPlannerItem(value: unknown): value is StoredPlannerItem {
	return (
		isPlainObject(value) &&
		(value.itemType === "character" || value.itemType === "weapon") &&
		typeof value.refId === "string" &&
		isPlainObject(value.data)
	)
}

// Only the current export shape is accepted - JSON.parse gives no runtime
// guarantee an imported file matches BackupData, and older chiz-pink export
// formats aren't supported. gachaPulls is optional since the main cloud
// payload (MainBackupData) goes through backupImport() too.
function isCurrentBackup(data: unknown): data is BackupData {
	return (
		isPlainObject(data) &&
		typeof data.lastUpdated === "number" &&
		isPlainObject(data.checklist) &&
		isPlainObject(data.checklist.activities) &&
		isPlainObject(data.inventory) &&
		Array.isArray(data.planner) &&
		data.planner.every(isStoredPlannerItem) &&
		isPlainObject(data.settings) &&
		(data.gachaPulls === undefined || isPlainObject(data.gachaPulls))
	)
}

export function backupImport(json: string) {
	let data: BackupData | null = null

	try {
		const parsed: unknown = JSON.parse(json)
		if (isCurrentBackup(parsed)) {
			data = parsed
		} else {
			console.error("Unsupported backup format")
		}
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

	// Cloud sync treats this like "synced" (true LWW - a strictly-ahead local
	// just gets pushed up); manual file import uses it to confirm before an
	// older file overwrites newer local data.
	if (lastUpdated && remoteLastUpdated < lastUpdated) {
		return { status: "older", data }
	}

	// The one remaining conflict: first-ever sync on this device, with
	// pre-existing local data that would otherwise be silently discarded.
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
	"gachaLastUpdated",
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

export function backupSetMainImport({
	lastUpdated,
	checklist,
	planner,
	inventory,
	settings,
}: MainBackupData) {
	memoryStorage.setItem("checklist", checklist ?? CHECKLIST_FALLBACK)
	replaceInventory(inventory ?? INVENTORY_FALLBACK)

	const plannerItems = planner ?? []
	const plannerRecord: PlannerRecord = { arcs: {}, characters: {} }
	for (const item of plannerItems) {
		if (item.itemType === "character") {
			plannerRecord.characters[item.refId] = item.data
		} else {
			plannerRecord.arcs[item.refId] = item.data
		}
	}
	replacePlanner(plannerRecord)

	// The imported list's own order IS the hybrid order; characters/arcs are
	// that same order filtered down to one type - matches how a hybrid-mode
	// reorder already keeps all three in sync (see usePlannerItems.tsx).
	memoryStorage.setItem("plannerOrder", {
		hybrid: plannerItems.map((item) => item.refId),
		characters: plannerItems
			.filter((item) => item.itemType === "character")
			.map((item) => item.refId),
		arcs: plannerItems
			.filter((item) => item.itemType === "weapon")
			.map((item) => item.refId),
	})

	memoryStorage.setItem("lastUpdated", lastUpdated)
	memoryStorage.setItem("settings", settings ?? SETTINGS_FALLBACK)
}

export function backupSetImport(data: BackupData) {
	backupSetMainImport(data)
	if (data.gachaPulls) {
		replaceAllPulls(data.gachaPulls)
		if (data.gachaLastUpdated) {
			memoryStorage.setItem("gachaLastUpdated", data.gachaLastUpdated)
		}
	}
}
