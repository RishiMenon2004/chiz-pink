import type { BannerType, PullsRecord } from "@/types/pulls"

import { SERVER_FALLBACK as CHECKLIST_FALLBACK } from "@/hooks/useChecklistStore"
import { SERVER_FALLBACK as INVENTORY_FALLBACK } from "@/hooks/useInventoryStore"
import { SERVER_FALLBACK as PLANNER_FALLBACK } from "@/hooks/usePlannerStore"
import { SERVER_FALLBACK as HYBRID_PLANNER_FALLBACK } from "@/hooks/useHybridPlannerStore"
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

// gachaPulls is deliberately excluded here - it's unpacked into the
// normalized `pulls` store instead of copied as a single keyval blob (§4).
const BLOB_KEYS = [
	"checklist",
	"inventory",
	"planner",
	"hybridPlanner",
	"settings",
] as const

const BLOB_FALLBACKS = {
	checklist: CHECKLIST_FALLBACK,
	inventory: INVENTORY_FALLBACK,
	planner: PLANNER_FALLBACK,
	hybridPlanner: HYBRID_PLANNER_FALLBACK,
	settings: SETTINGS_FALLBACK,
} satisfies Record<(typeof BLOB_KEYS)[number], unknown>

const PRIMITIVE_KEYS = ["lastUpdated", "lastSynced", "lastSeen"] as const

// Every legacy key from §2's inventory, used to detect whether there's
// anything to migrate at all (a fresh install has none of these).
const ALL_LEGACY_KEYS = [
	...BLOB_KEYS,
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

function migratePulls(): Promise<void> {
	const raw = window.localStorage.getItem("gachaPulls")
	if (raw === null) return Promise.resolve()

	const pullsRecord = safeParse<PullsRecord>(
		raw,
		GACHA_PULL_FALLBACK,
		"gachaPulls"
	)

	return Promise.all(
		BANNER_TYPES.map((bannerType) =>
			idbStorage.putPulls(Object.values(pullsRecord[bannerType]), bannerType)
		)
	).then(() => undefined)
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
		await Promise.all([migrateBlobs(), migratePulls(), migratePrimitives()])
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
