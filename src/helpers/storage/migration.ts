import type { BannerType, PullsRecord } from "@/types/pulls"
import type { Inventory, StoredInventoryItem } from "@/types/inventory"
import type {
	PlannerOrderRecord,
	PlannerRecord,
	StoredPlannerItem,
} from "@/types/planner"

import { SERVER_FALLBACK as CHECKLIST_FALLBACK } from "@/hooks/useChecklistStore"
import { SERVER_FALLBACK as INVENTORY_FALLBACK } from "@/hooks/useInventoryStore"
import { SERVER_FALLBACK as PLANNER_FALLBACK } from "@/hooks/usePlannerStore"
import { SERVER_FALLBACK as SETTINGS_FALLBACK } from "@/hooks/useSettingsStore"
import { SERVER_FALLBACK as GACHA_PULL_FALLBACK } from "@/hooks/useGachaStore"

import { safeParse } from "@/helpers/dataCorruption"

import * as idbStorage from "./idbStorage"

// One-time importer that copies existing localStorage data into IndexedDB.
// See docs/plans/localstorage-to-indexeddb-migration.md (§2, §5 Phase 2).
//
// This module only talks to idbStorage directly - it doesn't touch
// memoryStorage's cache. memoryStorage.hydrate() (Phase 1) is what reads the
// migrated rows back into the in-memory cache; AppStorageInitializer
// (Phase 4) is responsible for calling migrateFromLocalStorage() before
// hydrate() so hydration sees the migrated data. Not yet wired into app
// startup - that's Phase 4.

const MIGRATION_FLAG_KEY = "_migratedFromLocalStorage"

const BANNER_TYPES: BannerType[] = [
	"arcsBanner",
	"limitedBanner",
	"permanentBanner",
]

// gachaPulls, inventory, planner, and hybridPlanner are deliberately
// excluded here - each is unpacked into its own normalized IndexedDB store
// (or, for hybridPlanner, reshaped into the combined `plannerOrder` key)
// instead of copied as a single keyval blob (§4-style rationale; see
// migratePulls(), migrateInventory(), migratePlanner(),
// migrateHybridPlanner() below).
const BLOB_KEYS = ["checklist", "settings"] as const

const BLOB_FALLBACKS = {
	checklist: CHECKLIST_FALLBACK,
	settings: SETTINGS_FALLBACK,
} satisfies Record<(typeof BLOB_KEYS)[number], unknown>

const PRIMITIVE_KEYS = ["lastUpdated", "lastSynced", "lastSeen"] as const

// Every legacy key from §2's inventory, used to detect whether there's
// anything to migrate at all (a fresh install has none of these).
const ALL_LEGACY_KEYS = [
	...BLOB_KEYS,
	"inventory",
	"planner",
	"hybridPlanner",
	"gachaPulls",
	"hasVisited",
	...PRIMITIVE_KEYS,
] as const

// Retained in localStorage as a safety-net backup until a successful cloud
// sync confirms the migrated data made it to Drive - see
// purgeLegacyLocalStorageIfSynced() below. hasVisited is deliberately
// excluded: it's a one-time splash flag, not user data worth gating on sync.
const LEGACY_BACKUP_KEYS = [
	...BLOB_KEYS,
	"inventory",
	"planner",
	"hybridPlanner",
	"gachaPulls",
	"lastUpdated",
	"lastSeen",
] as const

function hasAnyLegacyData(): boolean {
	return ALL_LEGACY_KEYS.some(
		(key) => window.localStorage.getItem(key) !== null
	)
}

function migrateBlobs(): Promise<void> {
	return Promise.all(
		BLOB_KEYS.map((key) => {
			const raw = window.localStorage.getItem(key)
			if (raw === null) return Promise.resolve()

			const value = safeParse(raw, BLOB_FALLBACKS[key], key)
			return idbStorage.set(key, value)
		})
	).then(() => undefined)
}

function migrateInventory(): Promise<void> {
	const raw = window.localStorage.getItem("inventory")
	if (raw === null) return Promise.resolve()

	const inventory = safeParse<Inventory>(raw, INVENTORY_FALLBACK, "inventory")
	const rows: StoredInventoryItem[] = Object.entries(inventory).map(
		([id, amount]) => ({ id, amount })
	)

	return idbStorage.putInventoryItems(rows)
}

function migratePlanner(): Promise<void> {
	const raw = window.localStorage.getItem("planner")
	if (raw === null) return Promise.resolve()

	const planner = safeParse<PlannerRecord>(raw, PLANNER_FALLBACK, "planner")
	const rows: StoredPlannerItem[] = [
		...Object.entries(planner.characters).map(
			([refId, data]): StoredPlannerItem => ({
				itemType: "character",
				refId,
				data,
			})
		),
		...Object.entries(planner.arcs).map(
			([refId, data]): StoredPlannerItem => ({
				itemType: "weapon",
				refId,
				data,
			})
		),
	]

	return idbStorage.writePlannerChanges(rows, [])
}

// Legacy shape was just { order: string[] } - reshaped into the combined
// PlannerOrderRecord's `hybrid` field, with `characters`/`arcs` starting
// empty (split-mode order didn't exist as a persisted concept pre-migration;
// see usePlannerOrderStore.tsx).
function migrateHybridPlanner(): Promise<void> {
	const raw = window.localStorage.getItem("hybridPlanner")
	if (raw === null) return Promise.resolve()

	const legacy = safeParse<{ order: string[] }>(
		raw,
		{ order: [] },
		"hybridPlanner"
	)

	return idbStorage.set<PlannerOrderRecord>("plannerOrder", {
		hybrid: legacy.order,
		characters: [],
		arcs: [],
	})
}

function migratePulls(): Promise<void> {
	const raw = window.localStorage.getItem("gachaPulls")
	if (raw === null) return Promise.resolve()

	const pullsRecord = safeParse<PullsRecord>(
		raw,
		GACHA_PULL_FALLBACK,
		"gachaPulls"
	)

	// Object.values(pullsRecord[bannerType]) is already newest-first - every
	// historical addPulls() call (see useGachaStore.tsx) has always spread
	// new pulls before existing ones when building this blob. That order is
	// about to be discarded by writing rows into a uid-keyed store, so seq
	// captures it explicitly: one counter shared across all three banners
	// (arcsBanner, then limitedBanner, then permanentBanner), 0 for the
	// very first pull walked. See StoredPull's comment for why this exists.
	let seq = 0
	const writes = BANNER_TYPES.map((bannerType) => {
		const pulls = Object.values(pullsRecord[bannerType]).map((pull) => ({
			...pull,
			seq: seq++,
		}))
		return idbStorage.putPulls(pulls, bannerType)
	})

	return Promise.all(writes).then(() => undefined)
}

function migratePrimitives(): Promise<void> {
	const writes: Promise<void>[] = []

	for (const key of PRIMITIVE_KEYS) {
		const raw = window.localStorage.getItem(key)
		if (raw === null) continue

		const numeric = Number(raw)
		writes.push(idbStorage.set(key, Number.isNaN(numeric) ? raw : numeric))
	}

	const hasVisited = window.localStorage.getItem("hasVisited")
	if (hasVisited !== null) {
		writes.push(idbStorage.set("hasVisited", hasVisited === "true"))
	}

	return Promise.all(writes).then(() => undefined)
}

// Copies legacy localStorage data into IndexedDB exactly once per browser
// profile. Safe to call on every app start - subsequent calls resolve
// immediately once the migration flag is set, and a fresh install (no
// legacy keys present) just sets the flag without writing anything.
export async function migrateFromLocalStorage(): Promise<void> {
	if (typeof window === "undefined") return
	if (!idbStorage.isIndexedDBAvailable()) return

	const alreadyMigrated = await idbStorage.get<boolean>(MIGRATION_FLAG_KEY)
	if (alreadyMigrated) return

	if (hasAnyLegacyData()) {
		await Promise.all([
			migrateBlobs(),
			migrateInventory(),
			migratePlanner(),
			migrateHybridPlanner(),
			migratePulls(),
			migratePrimitives(),
		])
	}

	await idbStorage.set(MIGRATION_FLAG_KEY, true)
}

// Purges the legacy localStorage backup once a cloud sync has confirmed the
// migrated data reached Drive (§5 Phase 2). Not yet called anywhere -
// wiring this to backupData.markSynced() (or an equivalent sync-completion
// signal) is Phase 3's job, since that touches CloudSyncProvider/
// backupData.ts directly.
export function purgeLegacyLocalStorageIfSynced(): void {
	if (typeof window === "undefined") return
	if (!window.localStorage.getItem("lastSynced")) return

	for (const key of LEGACY_BACKUP_KEYS) {
		window.localStorage.removeItem(key)
	}
}
