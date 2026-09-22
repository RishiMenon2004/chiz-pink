import type { PlannerRecord, StoredPlannerItem } from "@/types/planner"
import { BackupData } from "@/types/settings"
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

export function buildBackupPayload(): BackupData {
	const lastUpdated = memoryStorage.getItem<number>("lastUpdated", Date.now())

	return {
		lastUpdated,
		checklist: memoryStorage.getItem("checklist", CHECKLIST_FALLBACK),
		inventory: getCachedInventory(),
		planner: getOrderedPlannerItems(),
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

// Backward compatible with backup files exported before planner became a
// single ordered list (previously two separately-keyed { characters, arcs }
// collections, ordered via a separate top-level plannerOrder field) -
// JSON.parse gives no runtime guarantee an imported file actually matches
// the current BackupData shape. legacyHybridOrder (that old file's
// plannerOrder.hybrid, if present) is applied the same way
// getOrderedPlannerItems() applies the live order, so importing an old
// export doesn't collapse its interleaving into "all characters then all
// arcs".
function normalizePlannerItems(
	planner: unknown,
	legacyHybridOrder?: string[]
): StoredPlannerItem[] {
	if (!planner) return []
	if (Array.isArray(planner)) return planner as StoredPlannerItem[]

	const legacy = planner as PlannerRecord
	const characters = legacy.characters ?? {}
	const arcs = legacy.arcs ?? {}
	const combinedIds = [...Object.keys(characters), ...Object.keys(arcs)]
	const order = legacyHybridOrder
		? applyOrder(legacyHybridOrder, combinedIds)
		: combinedIds

	return order.map((refId): StoredPlannerItem =>
		refId in characters
			? { itemType: "character", refId, data: characters[refId] }
			: { itemType: "weapon", refId, data: arcs[refId] }
	)
}

// plannerOrder is accepted only for the legacy-format branch above - current
// exports don't include it (see BackupData's planner field comment).
type ImportedBackupData = BackupData & { plannerOrder?: { hybrid?: string[] } }

export function backupSetImport({
	lastUpdated,
	checklist,
	planner,
	plannerOrder,
	gachaPulls,
	inventory,
	settings,
}: ImportedBackupData) {
	memoryStorage.setItem("checklist", checklist ?? CHECKLIST_FALLBACK)
	replaceInventory(inventory ?? INVENTORY_FALLBACK)

	const plannerItems = normalizePlannerItems(planner, plannerOrder?.hybrid)
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

	replaceAllPulls(gachaPulls ?? GACHA_PULL_FALLBACK)
	memoryStorage.setItem("lastUpdated", lastUpdated)
	memoryStorage.setItem("settings", settings ?? SETTINGS_FALLBACK)
}
