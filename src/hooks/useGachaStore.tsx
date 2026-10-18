"use client"

import { useSyncExternalStore } from "react"
import { isInitialSyncPending } from "@/helpers/syncGate"

import { safeParse } from "@/helpers/dataCorruption"
import * as idbStorage from "@/helpers/storage/idbStorage"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import {
	BannerType,
	ImportMessage,
	MiracleBoxPull,
	Pull,
	PullsRecord,
	ScarboroughFairPull,
	StoredPull,
} from "@/types/pulls"

// Pulls live in IndexedDB's normalized `pulls` store (one row per pull,
// indexed by uid - see docs/plans/localstorage-to-indexeddb-migration.md
// §4), not in memoryStorage's generic records cache, so this module keeps its
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

// Deterministic signature representing the physical roll event.
// Disambiguates duplicate pulls even if uids differ across imports/devices.
export function getPullSignature(
	pull: Pull & { bannerType?: BannerType }
): string {
	const diceRoll = "diceRoll" in pull ? pull.diceRoll : ""
	const quantity = "quantity" in pull ? pull.quantity : 1
	const banner = pull.bannerType ?? ""
	return `${banner}:${pull.timestamp}:${pull.rewardId}:${diceRoll}:${quantity}`
}

function isSamePull(a: Pull, b: Pull): boolean {
	const fields = new Set([...Object.keys(a), ...Object.keys(b)])
	fields.delete("seq")
	fields.delete("bannerType")
	for (const field of fields) {
		if (
			(a as Record<string, unknown>)[field] !==
			(b as Record<string, unknown>)[field]
		) {
			return false
		}
	}
	return true
}

// Returns the incoming pulls of one banner that aren't already stored.
// Signatures are counted rather than just checked for presence: one
// 10-pull can legitimately hold several identical pulls (e.g. two copies
// of the same B-rank arc), so a pull is only a duplicate once `existing`
// holds as many copies of its signature as `incoming` does.
//
// With `overwrite`, an incoming pull whose uid is already stored is
// returned too (when it differs) so it can replace the stored copy - an
// import is authoritative for its own uids, which lets re-importing repair
// pulls saved by an older, buggier parser (including ones a cloud merge
// brought back after a local clear).
function filterNewPulls<T extends Pull>(
	existing: Pull[],
	incoming: T[],
	bannerType: BannerType,
	overwrite = false
): T[] {
	const existingByUid = new Map(existing.map((pull) => [pull.uid, pull]))
	const incomingByUid = new Map(incoming.map((pull) => [pull.uid, pull]))
	const signatureOf = (pull: Pull) => getPullSignature({ ...pull, bannerType })

	// A stored pull that's about to be replaced counts under its incoming
	// (corrected) signature, not its stale one
	const existingCounts = new Map<string, number>()
	for (const pull of existing) {
		const signature = signatureOf(
			(overwrite && incomingByUid.get(pull.uid)) || pull
		)
		existingCounts.set(signature, (existingCounts.get(signature) ?? 0) + 1)
	}
	const incomingCounts = new Map<string, number>()
	for (const pull of incoming) {
		const signature = signatureOf(pull)
		incomingCounts.set(signature, (incomingCounts.get(signature) ?? 0) + 1)
	}

	return incoming.filter((pull) => {
		const stored = existingByUid.get(pull.uid)
		if (stored) return overwrite && !isSamePull(stored, pull)

		const signature = signatureOf(pull)
		const count = existingCounts.get(signature) ?? 0
		if (count >= (incomingCounts.get(signature) ?? 0)) return false
		existingByUid.set(pull.uid, pull)
		existingCounts.set(signature, count + 1)
		return true
	})
}

// Object key order = display order (see RenderPulls.tsx's Object.values()
// and calculatePity.ts's newest-first iteration), so cachedPulls[banner]
// must always be built newest-first.
//
// `timestamp` alone can't break ties: a multi-pull session shares one
// timestamp at second granularity, and IndexedDB's bannerType_timestamp
// index has no secondary key, so tied rows come back in uid order instead.
// `seq` (see StoredPull) fixes that - it's assigned from an
// already-correctly-ordered source, but only within a shared timestamp;
// it's fresh per write, so it can't order across separate imports. Rows
// from before `seq` existed just keep their existing relative order.
function comparePulls(a: Pull & { seq?: number }, b: Pull & { seq?: number }): number {
	if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp
	if (a.seq !== undefined && b.seq !== undefined) return a.seq - b.seq
	return 0
}

function sortedBanner(
	pulls: Record<string, Pull & { seq?: number }>
): Record<string, Pull> {
	const sorted: Record<string, Pull> = {}
	Object.values(pulls)
		.sort(comparePulls)
		.forEach((pull) => {
			sorted[pull.uid] = pull
		})
	return sorted
}

// Merges incoming pulls into the cache and re-sorts every touched banner,
// rather than assuming new pulls are always newer than everything already
// cached - a plain prepend breaks the moment an import backfills older
// history alongside (or instead of) new pulls.
//
// Deduplicates using both unique `uid` and composite event signature
// `(bannerType:timestamp:rewardId:diceRoll:quantity)` so rolls with
// different uids don't duplicate - see filterNewPulls(), including for
// what `overwrite` does.
export function applyPulls(pulls: StoredPull[], overwrite = false) {
	if (pulls.length === 0) return

	const next = cloneCache()
	const touchedBanners = new Set<BannerType>()

	for (const bannerType of BANNER_TYPES) {
		const incoming = pulls.filter((pull) => pull.bannerType === bannerType)
		const newPulls = filterNewPulls(
			Object.values(next[bannerType]),
			incoming,
			bannerType,
			overwrite
		)
		for (const stored of newPulls) {
			const pull: Pull & { bannerType?: BannerType } = { ...stored }
			delete pull.bannerType
			;(next[bannerType] as Record<string, Pull>)[pull.uid] = pull
			touchedBanners.add(bannerType)
		}
	}

	for (const bannerType of touchedBanners) {
		;(next[bannerType] as Record<string, Pull>) = sortedBanner(
			next[bannerType] as Record<string, Pull & { seq?: number }>
		)
	}

	cachedPulls = next
}

// Merges a whole incoming PullsRecord (e.g. from cloud sync) into the current
// local state without overwriting local-only pulls, deduplicating by uid & signature.
export function mergePullsRecord(remotePulls: PullsRecord) {
	const pullsToApply: StoredPull[] = []
	for (const bannerType of BANNER_TYPES) {
		const bannerPulls = Object.values(remotePulls[bannerType] || {})
		for (const pull of bannerPulls) {
			pullsToApply.push({
				...pull,
				bannerType,
			})
		}
	}
	applyPulls(pullsToApply)
	memoryStorage.notifyListeners()

	if (memoryStorage.isFallbackMode()) {
		writeLegacyBlob(cachedPulls)
		return
	}

	idbStorage
		.replaceAllPulls(
			BANNER_TYPES.map((bannerType) => ({
				bannerType,
				pulls: Object.values(cachedPulls[bannerType]).map((pull, seq) => ({
					...pull,
					seq,
				})),
			}))
		)
		.catch((error) => {
			console.error("IndexedDB merge replace failed for pulls", error)
		})
}

memoryStorage.onCustomBroadcast(PULLS_BROADCAST_CHANNEL, (payload) => {
	const message = payload as
		| { kind: "add"; pulls: StoredPull[]; overwrite?: boolean }
		| { kind: "replace"; pullsRecord: PullsRecord }
		| { kind: "clear" }

	if (message.kind === "add") {
		applyPulls(message.pulls, message.overwrite)
	} else if (message.kind === "replace") {
		cachedPulls = message.pullsRecord
	} else {
		cachedPulls = SERVER_FALLBACK
	}
	memoryStorage.notifyListeners()
})

// Bootstraps the pulls cache from IndexedDB. Safe to call more than once -
// only the first call does anything. Mirrors memoryStorage.hydrate();
// AppStorageInitializer calls both on app start.
export async function hydratePullsCache(): Promise<void> {
	if (hydrated || typeof window === "undefined") return
	hydrated = true

	if (memoryStorage.isFallbackMode() || !idbStorage.isIndexedDBAvailable()) {
		cachedPulls = readLegacyBlob()
		memoryStorage.notifyListeners()
		return
	}

	try {
		// Reading getAllPulls() would return rows sorted by uid (the store's
		// primary key), unrelated to pull order; reading per banner through
		// bannerType_timestamp at least narrows it to one banner and gets
		// mostly-newest-first rows. applyPulls() still does the authoritative
		// (timestamp, seq) sort below - see comparePulls()'s comment for why
		// the index alone isn't precise enough (same-timestamp ties).
		const rowsByBanner = await Promise.all(
			BANNER_TYPES.map((bannerType) => idbStorage.getPullsByBanner(bannerType))
		)
		applyPulls(rowsByBanner.flat())
		memoryStorage.notifyListeners()
	} catch (error) {
		console.error("IndexedDB pulls hydration failed", error)
	}
}

// Bulk import from NTE-exporter JSON. Expects rows grouped by banner,
// newest-first within each banner.
export function importParsedPulls(rowsByBanner: StoredPull[][]) {
	if (typeof window === "undefined" || isInitialSyncPending()) return

	if (memoryStorage.isFallbackMode()) {
		applyPulls(rowsByBanner.flat())
		writeLegacyBlob(cachedPulls)
		memoryStorage.setItem("gachaLastUpdated", Date.now())
		return
	}

	applyPulls(rowsByBanner.flat())
	memoryStorage.broadcastCustom(PULLS_BROADCAST_CHANNEL, {
		kind: "add",
		pulls: rowsByBanner.flat(),
	})

	for (const rows of rowsByBanner) {
		if (rows.length === 0) continue
		const bannerType = rows[0].bannerType
		idbStorage.putPulls(rows, bannerType).catch((error) => {
			console.error(
				`IndexedDB bulk put failed for pulls (${bannerType})`,
				error
			)
		})
	}

	memoryStorage.setItem("gachaLastUpdated", Date.now())
}

// Degraded-mode read/write, mirroring memoryStorage's own localStorage
// fallback - used when IndexedDB is unavailable.
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

function importSummary(
	total: number,
	written: Pull[],
	existing: Record<string, Pull>
): ImportMessage {
	const updated = written.filter((pull) => pull.uid in existing).length
	const added = written.length - updated
	const skipped = total - written.length
	return {
		message:
			`Imported ${added} pulls.` +
			(updated > 0 ? ` (Updated ${updated} existing pulls.)` : "") +
			(skipped > 0 ? ` (Skipped ${skipped} existing pulls.)` : ""),
		status: "info",
	}
}

// Adds imported pulls. Pulls already stored under the same uid are replaced
// when they differ (see filterNewPulls()), so re-importing repairs pulls
// saved by an older parser; other duplicates are skipped by signature.
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
			const existing = pullsData[bannerType] || {}
			const filteredPulls = filterNewPulls(
				Object.values(existing),
				pulls,
				bannerType,
				true
			)

			const incomingPullsRecord: Record<string, Pull> = {}
			for (const pull of filteredPulls) incomingPullsRecord[pull.uid] = pull

			const updatedPulls: PullsRecord = {
				...pullsData,
				[bannerType]: sortedBanner({ ...existing, ...incomingPullsRecord }),
			}

			writeLegacyBlob(updatedPulls)
			cachedPulls = updatedPulls
			memoryStorage.setItem("gachaLastUpdated", Date.now())

			response.status = "success"
			response.messages.push(
				importSummary(pulls.length, filteredPulls, existing)
			)
			return response
		}

		const existing = cachedPulls[bannerType]
		const filteredPulls = filterNewPulls(
			Object.values(existing),
			pulls,
			bannerType,
			true
		)
		response.messages.push(
			importSummary(pulls.length, filteredPulls, existing)
		)

		if (filteredPulls.length > 0) {
			const storedPulls: StoredPull[] = filteredPulls.map((pull, seq) => ({
				...pull,
				bannerType,
				seq,
			}))

			applyPulls(storedPulls, true)
			memoryStorage.broadcastCustom(PULLS_BROADCAST_CHANNEL, {
				kind: "add",
				pulls: storedPulls,
				overwrite: true,
			})

			idbStorage.putPulls(storedPulls, bannerType).catch((error) => {
				console.error(
					`IndexedDB write-through failed for pulls (${bannerType})`,
					error
				)
			})

			// Bumps gachaLastUpdated instead of lastUpdated, keeping routine
			// edits decoupled from pulls history.
			memoryStorage.setItem("gachaLastUpdated", Date.now())
		}

		response.status = "success"
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
				pulls: Object.values(pullsRecord[bannerType]).map(
					(pull, seq) => ({ ...pull, seq })
				),
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
