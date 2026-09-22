import { BannerType, Pull, StoredPull } from "@/types/pulls"
import { StoredInventoryItem } from "@/types/inventory"
import { PlannerItemType, StoredPlannerItem } from "@/types/planner"

// Raw IndexedDB access. No React, no caching - memoryStorage.ts is the
// synchronous layer stores actually talk to; this module only knows how to
// read and write "chiz-pink-db" itself. See docs/plans/localstorage-to-indexeddb-migration.md.
const DB_NAME = "chiz-pink-db"
const DB_VERSION = 2
const KEYVAL_STORE = "keyval"
const PULLS_STORE = "pulls"
const PULLS_BANNER_INDEX = "bannerType"
const PULLS_BANNER_TIMESTAMP_INDEX = "bannerType_timestamp"
const INVENTORY_STORE = "inventory"
const PLANNER_STORE = "planner"

export function isIndexedDBAvailable(): boolean {
	return typeof window !== "undefined" && "indexedDB" in window
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
	if (!isIndexedDBAvailable()) {
		return Promise.reject(new Error("IndexedDB is not available"))
	}

	if (dbPromise) return dbPromise

	dbPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		request.onupgradeneeded = () => {
			const db = request.result

			if (!db.objectStoreNames.contains(KEYVAL_STORE)) {
				db.createObjectStore(KEYVAL_STORE)
			}

			if (!db.objectStoreNames.contains(PULLS_STORE)) {
				const pullsStore = db.createObjectStore(PULLS_STORE, {
					keyPath: "uid",
				})
				pullsStore.createIndex(PULLS_BANNER_INDEX, "bannerType")
				pullsStore.createIndex(PULLS_BANNER_TIMESTAMP_INDEX, [
					"bannerType",
					"timestamp",
				])
			}

			if (!db.objectStoreNames.contains(INVENTORY_STORE)) {
				db.createObjectStore(INVENTORY_STORE, { keyPath: "id" })
			}

			if (!db.objectStoreNames.contains(PLANNER_STORE)) {
				db.createObjectStore(PLANNER_STORE, {
					keyPath: ["itemType", "refId"],
				})
			}
		}

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})

	// A failed open (e.g. blocked in private browsing) shouldn't get cached -
	// let the next caller retry rather than rejecting forever.
	dbPromise.catch(() => {
		dbPromise = null
	})

	return dbPromise
}

function runRequest<T>(
	storeName: string,
	mode: IDBTransactionMode,
	callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	return openDB().then(
		(db) =>
			new Promise<T>((resolve, reject) => {
				const tx = db.transaction(storeName, mode)
				const request = callback(tx.objectStore(storeName))

				request.onsuccess = () => resolve(request.result)
				request.onerror = () => reject(request.error)
			})
	)
}

export async function get<T>(key: string): Promise<T | null> {
	const value = await runRequest<T | undefined>(
		KEYVAL_STORE,
		"readonly",
		(store) => store.get(key)
	)
	return value ?? null
}

export function set<T>(key: string, value: T): Promise<void> {
	return runRequest(KEYVAL_STORE, "readwrite", (store) =>
		store.put(value, key)
	).then(() => undefined)
}

export function del(key: string): Promise<void> {
	return runRequest(KEYVAL_STORE, "readwrite", (store) =>
		store.delete(key)
	).then(() => undefined)
}

export function getAll(): Promise<Record<string, unknown>> {
	return openDB().then(
		(db) =>
			new Promise<Record<string, unknown>>((resolve, reject) => {
				const tx = db.transaction(KEYVAL_STORE, "readonly")
				const store = tx.objectStore(KEYVAL_STORE)
				const keysRequest = store.getAllKeys()
				const valuesRequest = store.getAll()

				tx.oncomplete = () => {
					const keys = keysRequest.result as string[]
					const values = valuesRequest.result
					const result: Record<string, unknown> = {}
					keys.forEach((key, index) => {
						result[key] = values[index]
					})
					resolve(result)
				}
				tx.onerror = () => reject(tx.error)
			})
	)
}

// Batched per-pull writes so importing new pulls only touches the rows that
// changed, instead of rewriting the whole gachaPulls history (see plan §4).
export function putPulls(pulls: Pull[], bannerType: BannerType): Promise<void> {
	if (pulls.length === 0) return Promise.resolve()

	return openDB().then(
		(db) =>
			new Promise<void>((resolve, reject) => {
				const tx = db.transaction(PULLS_STORE, "readwrite")
				const store = tx.objectStore(PULLS_STORE)

				for (const pull of pulls) {
					const record: StoredPull = { ...pull, bannerType }
					store.put(record)
				}

				tx.oncomplete = () => resolve()
				tx.onerror = () => reject(tx.error)
			})
	)
}

export function getPullsByBanner(
	bannerType: BannerType,
	options?: { since?: number; limit?: number }
): Promise<StoredPull[]> {
	return openDB().then(
		(db) =>
			new Promise<StoredPull[]>((resolve, reject) => {
				const tx = db.transaction(PULLS_STORE, "readonly")
				const index = tx.objectStore(PULLS_STORE).index(PULLS_BANNER_TIMESTAMP_INDEX)
				const range = IDBKeyRange.bound(
					[bannerType, options?.since ?? -Infinity],
					[bannerType, Infinity]
				)

				const results: StoredPull[] = []
				// "prev" walks newest-first, matching how pull history is consumed.
				const request = index.openCursor(range, "prev")

				request.onsuccess = () => {
					const cursor = request.result
					if (cursor && (!options?.limit || results.length < options.limit)) {
						results.push(cursor.value as StoredPull)
						cursor.continue()
					} else {
						resolve(results)
					}
				}
				request.onerror = () => reject(request.error)
			})
	)
}

// Atomically wipes the pulls store and repopulates it from a full
// PullsRecord-shaped import (backup restore / cloud pull) - a plain put()
// per pull would leave behind rows that no longer exist in the imported
// set, since put() only ever upserts.
export function replaceAllPulls(
	pullsByBanner: { bannerType: BannerType; pulls: Pull[] }[]
): Promise<void> {
	return openDB().then(
		(db) =>
			new Promise<void>((resolve, reject) => {
				const tx = db.transaction(PULLS_STORE, "readwrite")
				const store = tx.objectStore(PULLS_STORE)

				store.clear()
				for (const { bannerType, pulls } of pullsByBanner) {
					for (const pull of pulls) {
						const record: StoredPull = { ...pull, bannerType }
						store.put(record)
					}
				}

				tx.oncomplete = () => resolve()
				tx.onerror = () => reject(tx.error)
			})
	)
}

export function clearAllPulls(): Promise<void> {
	return runRequest(PULLS_STORE, "readwrite", (store) =>
		store.clear()
	).then(() => undefined)
}

// Batched per-material writes, mirroring putPulls() - a stepper click or a
// currency edit only touches the one row that changed.
export function putInventoryItems(items: StoredInventoryItem[]): Promise<void> {
	if (items.length === 0) return Promise.resolve()

	return openDB().then(
		(db) =>
			new Promise<void>((resolve, reject) => {
				const tx = db.transaction(INVENTORY_STORE, "readwrite")
				const store = tx.objectStore(INVENTORY_STORE)

				for (const item of items) store.put(item)

				tx.oncomplete = () => resolve()
				tx.onerror = () => reject(tx.error)
			})
	)
}

export function getAllInventory(): Promise<StoredInventoryItem[]> {
	return runRequest<StoredInventoryItem[]>(INVENTORY_STORE, "readonly", (store) =>
		store.getAll()
	)
}

// Full overwrite (backup restore / cloud pull / bulk external import) -
// unlike putInventoryItems(), this discards any material not present in
// `items`, since put() alone only ever upserts.
export function replaceAllInventory(items: StoredInventoryItem[]): Promise<void> {
	return openDB().then(
		(db) =>
			new Promise<void>((resolve, reject) => {
				const tx = db.transaction(INVENTORY_STORE, "readwrite")
				const store = tx.objectStore(INVENTORY_STORE)

				store.clear()
				for (const item of items) store.put(item)

				tx.oncomplete = () => resolve()
				tx.onerror = () => reject(tx.error)
			})
	)
}

export function clearInventory(): Promise<void> {
	return runRequest(INVENTORY_STORE, "readwrite", (store) =>
		store.clear()
	).then(() => undefined)
}

// Applies a diffed set of planner writes in one transaction - addCharacter/
// updateCharacter/deleteCharacter/addWeapon/updateWeapon/deleteWeapon each
// touch exactly one row, and updatePlanner()'s generic partial-merge path
// (see usePlannerStore.tsx) can touch several across both collections at
// once (e.g. clearing both on an "overwrite" import), so both puts and
// deletes are batched into a single call rather than issuing separate
// transactions per row.
export function writePlannerChanges(
	puts: StoredPlannerItem[],
	deletes: [PlannerItemType, string][]
): Promise<void> {
	if (puts.length === 0 && deletes.length === 0) return Promise.resolve()

	return openDB().then(
		(db) =>
			new Promise<void>((resolve, reject) => {
				const tx = db.transaction(PLANNER_STORE, "readwrite")
				const store = tx.objectStore(PLANNER_STORE)

				for (const item of puts) store.put(item)
				for (const key of deletes) store.delete(key)

				tx.oncomplete = () => resolve()
				tx.onerror = () => reject(tx.error)
			})
	)
}

export function getAllPlannerItems(): Promise<StoredPlannerItem[]> {
	return runRequest<StoredPlannerItem[]>(PLANNER_STORE, "readonly", (store) =>
		store.getAll()
	)
}

export function replaceAllPlannerItems(items: StoredPlannerItem[]): Promise<void> {
	return openDB().then(
		(db) =>
			new Promise<void>((resolve, reject) => {
				const tx = db.transaction(PLANNER_STORE, "readwrite")
				const store = tx.objectStore(PLANNER_STORE)

				store.clear()
				for (const item of items) store.put(item)

				tx.oncomplete = () => resolve()
				tx.onerror = () => reject(tx.error)
			})
	)
}

export function clearPlannerItems(): Promise<void> {
	return runRequest(PLANNER_STORE, "readwrite", (store) =>
		store.clear()
	).then(() => undefined)
}
