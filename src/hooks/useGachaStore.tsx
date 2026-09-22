"use client"

import { useSyncExternalStore } from "react"
import { isInitialSyncPending } from "@/helpers/syncGate"

import { safeParse } from "@/helpers/dataCorruption"
import * as idbStorage from "@/helpers/storage/idbStorage"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import {
	MiracleBoxPull,
	ScarboroughFairPull,
	PullsRecord,
	ImportMessage,
	BannerType,
	Pull,
	StoredPull,
} from "@/types/pulls"

// Pulls live in IndexedDB's normalized `pulls` store (one row per pull,
// indexed by uid - see docs/plans/localstorage-to-indexeddb-migration.md
// §4), not in memoryStorage's generic keyval cache, so this module keeps its
// own small in-memory cache instead of going through memoryStorage.getItem/
// setItem. It still rides memoryStorage's shared subscriber list (via
// memoryStorage.notifyListeners()) and BroadcastChannel (via
// broadcastCustom/onCustomBroadcast) so it doesn't need to duplicate that
// plumbing - see memoryStorage.ts's module comment.

export const SERVER_FALLBACK: PullsRecord = {
	arcsBanner: {},
	limitedBanner: {},
	permanentBanner: {},
}

const BANNER_TYPES: BannerType[] = [
	"arcsBanner",
	"limitedBanner",
	"permanentBanner",
]

const PULLS_BROADCAST_CHANNEL = "pulls"
const LEGACY_KEY = "gachaPulls"

let cachedPulls: PullsRecord = SERVER_FALLBACK
let hydrated = false

function cloneCache(): PullsRecord {
	return {
		arcsBanner: { ...cachedPulls.arcsBanner },
		limitedBanner: { ...cachedPulls.limitedBanner },
		permanentBanner: { ...cachedPulls.permanentBanner },
	}
}

function applyPulls(pulls: StoredPull[]) {
	if (pulls.length === 0) return

	const next = cloneCache()
	for (const { bannerType, ...pull } of pulls) {
		;(next[bannerType] as Record<string, Pull>)[pull.uid] = pull
	}
	cachedPulls = next
}

memoryStorage.onCustomBroadcast(PULLS_BROADCAST_CHANNEL, (payload) => {
	const message = payload as
		| { kind: "add"; pulls: StoredPull[] }
		| { kind: "replace"; pullsRecord: PullsRecord }
		| { kind: "clear" }

	if (message.kind === "add") {
		applyPulls(message.pulls)
	} else if (message.kind === "replace") {
		cachedPulls = message.pullsRecord
	} else {
		cachedPulls = SERVER_FALLBACK
	}
	memoryStorage.notifyListeners()
})

// Bootstraps the pulls cache from IndexedDB. Safe to call more than once -
// only the first call does anything. Mirrors memoryStorage.hydrate();
// AppStorageInitializer (Phase 4) calls both on app start.
export async function hydratePullsCache(): Promise<void> {
	if (hydrated || typeof window === "undefined") return
	hydrated = true

	if (memoryStorage.isFallbackMode() || !idbStorage.isIndexedDBAvailable()) {
		cachedPulls = readLegacyBlob()
		memoryStorage.notifyListeners()
		return
	}

	try {
		const rows = await idbStorage.getAllPulls()
		applyPulls(rows)
		memoryStorage.notifyListeners()
	} catch (error) {
		console.error("IndexedDB pulls hydration failed", error)
	}
}

// Degraded-mode read/write, mirroring memoryStorage's own localStorage
// fallback (Phase 1 item 4) - used when IndexedDB is unavailable.
function readLegacyBlob(): PullsRecord {
	const raw = window.localStorage.getItem(LEGACY_KEY)
	return safeParse(raw, SERVER_FALLBACK, LEGACY_KEY)
}

function writeLegacyBlob(pullsRecord: PullsRecord) {
	try {
		window.localStorage.setItem(LEGACY_KEY, JSON.stringify(pullsRecord))
	} catch (error) {
		console.error("localStorage fallback write failed for pulls", error)
	}
}

//Add new pulls and skip over existing ones using the timestamp and uid as descriminators
export const gachaPullsActions = {
	addPulls(pulls: MiracleBoxPull[] | ScarboroughFairPull[], bannerType: BannerType) {
		const response: {
			status: "pending" | "error" | "success"
			messages: ImportMessage[]
		} = {
			status: "pending",
			messages: [],
		}

		if (typeof window === "undefined" || isInitialSyncPending())
			return response

		if (memoryStorage.isFallbackMode()) {
			const pullsData = readLegacyBlob()
			const existingUids = new Set(Object.keys(pullsData[bannerType] || {}))
			const filteredPulls = pulls.filter((pull) => !existingUids.has(pull.uid))

			const incomingPullsRecord: Record<string, Pull> = {}
			for (const pull of filteredPulls) incomingPullsRecord[pull.uid] = pull

			const updatedPulls: PullsRecord = {
				...pullsData,
				[bannerType]: { ...incomingPullsRecord, ...pullsData[bannerType] },
			}

			writeLegacyBlob(updatedPulls)
			cachedPulls = updatedPulls
			// setItem("lastUpdated", ...) notifies this tab's subscribers - see
			// memoryStorage.notifyListeners()'s doc comment.
			memoryStorage.setItem("lastUpdated", Date.now())

			response.status = "success"
			const skippedLength = pulls.length - filteredPulls.length
			response.messages.push({
				message: `Imported ${filteredPulls.length} pulls.${(skippedLength > 0 && ` (Skipped ${skippedLength} existing pulls.)`) || ""}`,
				status: "info",
			})
			return response
		}

		const existingUids = new Set(Object.keys(cachedPulls[bannerType]))
		const filteredPulls = pulls.filter((pull) => !existingUids.has(pull.uid))

		if (filteredPulls.length > 0) {
			const storedPulls: StoredPull[] = filteredPulls.map((pull) => ({
				...pull,
				bannerType,
			}))

			applyPulls(storedPulls)
			memoryStorage.broadcastCustom(PULLS_BROADCAST_CHANNEL, {
				kind: "add",
				pulls: storedPulls,
			})

			idbStorage.putPulls(filteredPulls, bannerType).catch((error) => {
				console.error(
					`IndexedDB write-through failed for pulls (${bannerType})`,
					error
				)
			})

			// Bumps lastUpdated and (via memoryStorage.setItem) notifies this
			// tab's own useSyncExternalStore subscribers - see
			// memoryStorage.notifyListeners()'s doc comment.
			memoryStorage.setItem("lastUpdated", Date.now())
		}

		response.status = "success"
		const skippedLength = pulls.length - filteredPulls.length
		response.messages.push({
			message: `Imported ${filteredPulls.length} pulls.${(skippedLength > 0 && ` (Skipped ${skippedLength} existing pulls.)`) || ""}`,
			status: "info",
		})

		return response
	},
}

// Full overwrite (backup restore / cloud pull) - unlike addPulls, this
// discards any pull not present in `pullsRecord`. Used by backupData.ts.
export function replaceAllPulls(pullsRecord: PullsRecord): void {
	if (typeof window === "undefined") return

	cachedPulls = pullsRecord
	memoryStorage.notifyListeners()

	if (memoryStorage.isFallbackMode()) {
		writeLegacyBlob(pullsRecord)
		return
	}

	idbStorage
		.replaceAllPulls(
			BANNER_TYPES.map((bannerType) => ({
				bannerType,
				pulls: Object.values(pullsRecord[bannerType]),
			}))
		)
		.catch((error) => {
			console.error("IndexedDB replace failed for pulls", error)
		})

	memoryStorage.broadcastCustom(PULLS_BROADCAST_CHANNEL, {
		kind: "replace",
		pullsRecord,
	})
}

// Used by backupData.ts's eraseLocalData().
export function clearAllPulls(): void {
	if (typeof window === "undefined") return

	cachedPulls = SERVER_FALLBACK
	memoryStorage.notifyListeners()

	if (memoryStorage.isFallbackMode()) {
		window.localStorage.removeItem(LEGACY_KEY)
		return
	}

	idbStorage.clearAllPulls().catch((error) => {
		console.error("IndexedDB clear failed for pulls", error)
	})

	memoryStorage.broadcastCustom(PULLS_BROADCAST_CHANNEL, { kind: "clear" })
}

// Synchronous read of the current pulls cache for non-hook callers (e.g.
// backupData.ts's buildBackupPayload(), which can't use a React hook).
export function getCachedPulls(): PullsRecord {
	return cachedPulls
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK
	return cachedPulls
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useGachaStore() {
	const gachaPulls = useSyncExternalStore<PullsRecord>(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return {
		gachaPulls,
		actions: {
			addPulls: gachaPullsActions.addPulls,
		},
	}
}
