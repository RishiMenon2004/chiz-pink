"use client"

import { safeParse, validateShape } from "@/helpers/dataCorruption"

import * as idbStorage from "./idbStorage"

// Synchronous in-memory cache backing the *Store hooks' getSnapshot(), with
// async write-through to IndexedDB. See
// docs/plans/localstorage-to-indexeddb-migration.md (§3, §4, Phase 1 & 3).
//
// - getItem() is synchronous and returns the same cached reference until the
//   key changes - required for useSyncExternalStore, whose bailout depends on
//   getSnapshot() returning a stable reference when nothing changed.
// - setItem() updates the cache and notifies subscribers in the same tick
//   (optimistic write), then queues a debounced, per-key async write to
//   IndexedDB so rapid successive writes to one key can't land out of order.
//   It also dispatches the same `local-storage-update` DOM event the old
//   localStorage-backed stores used to dispatch themselves - centralized
//   here so CloudSyncProvider's auto-sync listener (and anything else on
//   that event) didn't need to change when the stores were ported to this
//   module in Phase 3.
// - hydrate() bootstraps the cache from IndexedDB on app start. If IndexedDB
//   is unavailable (e.g. blocked in private browsing), falls back to
//   synchronous localStorage read/write instead of losing writes.
// - Cross-tab sync rides a BroadcastChannel: the writing tab posts the
//   already-computed value, so other tabs update instantly without a round
//   trip back through IndexedDB. The channel carries a `kind` discriminant
//   so the normalized `pulls` store (useGachaStore.tsx), which isn't part of
//   this module's records cache, can piggyback on the same channel instead of
//   opening a second one - see broadcastCustom()/onCustomBroadcast().

type Listener = () => void

const CHANNEL_NAME = "chiz-pink-storage"
const WRITE_DEBOUNCE_MS = 150

type WriteState = {
	timer: ReturnType<typeof setTimeout> | null
	writing: boolean
	dirty: boolean
}

type BroadcastEnvelope =
	| { kind: "record"; key: string; value: unknown }
	| { kind: "custom"; channel: string; payload: unknown }

const cache = new Map<string, unknown>()
const listeners = new Set<Listener>()
const writeState = new Map<string, WriteState>()
const customBroadcastHandlers = new Map<string, (payload: unknown) => void>()

let fallbackMode = false
let hydrationStarted = false
let hydrated = false
let channel: BroadcastChannel | null = null

function notify() {
	listeners.forEach((listener) => listener())
}

// Exposed for storage modules that keep their own cache outside this one
// (currently just useGachaStore.tsx's normalized pulls cache) but still
// need to wake the same useSyncExternalStore subscribers - every store
// already re-runs its own getSnapshot() on any notify and bails out via
// referential equality when its own key didn't change, so piggybacking on
// this single global signal is consistent with how every other store
// already behaves, not a new pattern.
export function notifyListeners() {
	notify()
}

export function subscribe(listener: Listener) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

export function isFallbackMode() {
	return fallbackMode
}

export function isHydrated() {
	return hydrated
}

function getChannel(): BroadcastChannel | null {
	if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
		return null
	}

	if (!channel) {
		channel = new BroadcastChannel(CHANNEL_NAME)
		channel.onmessage = (event: MessageEvent<BroadcastEnvelope>) => {
			const message = event.data
			if (!message) return

			if (message.kind === "record") {
				if (typeof message.key !== "string") return
				if (message.value === undefined) {
					cache.delete(message.key)
				} else {
					cache.set(message.key, message.value)
				}
				notify()
				return
			}

			if (message.kind === "custom") {
				customBroadcastHandlers.get(message.channel)?.(message.payload)
			}
		}
	}

	return channel
}

function broadcast(key: string, value: unknown) {
	getChannel()?.postMessage({ kind: "record", key, value } satisfies BroadcastEnvelope)
}

// Lets a sibling storage module (e.g. the pulls cache) ship its own
// cross-tab messages over this same BroadcastChannel instead of opening a
// second one. Only one handler per channel name - fine since each such
// module is a singleton registered once at module init.
export function broadcastCustom(channelName: string, payload: unknown) {
	getChannel()?.postMessage({
		kind: "custom",
		channel: channelName,
		payload,
	} satisfies BroadcastEnvelope)
}

export function onCustomBroadcast(
	channelName: string,
	handler: (payload: unknown) => void
) {
	customBroadcastHandlers.set(channelName, handler)
	return () => customBroadcastHandlers.delete(channelName)
}

// Debounces + coalesces per-key writes so an in-flight IndexedDB write is
// never raced by a newer one for the same key: while a write is in flight,
// further calls just mark the key dirty, and the in-flight write re-flushes
// itself with the latest cached value once it settles.
function scheduleWrite(key: string) {
	let state = writeState.get(key)
	if (!state) {
		state = { timer: null, writing: false, dirty: false }
		writeState.set(key, state)
	}

	if (state.writing) {
		state.dirty = true
		return
	}

	if (state.timer) clearTimeout(state.timer)
	state.timer = setTimeout(() => flushWrite(key), WRITE_DEBOUNCE_MS)
}

async function flushWrite(key: string) {
	const state = writeState.get(key)
	if (!state) return

	state.timer = null
	state.writing = true
	state.dirty = false

	try {
		await idbStorage.set(key, cache.get(key))
	} catch (error) {
		console.error(`IndexedDB write-through failed for "${key}"`, error)
	} finally {
		state.writing = false
		if (state.dirty) {
			state.dirty = false
			void flushWrite(key)
		}
	}
}

export function hasItem(key: string): boolean {
	if (typeof window === "undefined") return false
	if (fallbackMode) return window.localStorage.getItem(key) !== null
	return cache.has(key)
}

export function getItem<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback

	if (fallbackMode) {
		if (!cache.has(key)) {
			const raw = window.localStorage.getItem(key)
			cache.set(key, raw !== null ? safeParse(raw, fallback, key) : fallback)
		}
		return cache.get(key) as T
	}

	if (!cache.has(key)) return fallback
	return validateShape(cache.get(key), fallback, key)
}

export function setItem<T>(key: string, value: T): void {
	if (typeof window === "undefined") return

	cache.set(key, value)
	broadcast(key, value)
	notify()
	window.dispatchEvent(new Event("local-storage-update"))

	if (fallbackMode) {
		try {
			window.localStorage.setItem(key, JSON.stringify(value))
		} catch (error) {
			console.error(`localStorage fallback write failed for "${key}"`, error)
		}
		return
	}

	scheduleWrite(key)
}

export function removeItem(key: string): void {
	if (typeof window === "undefined") return

	cache.delete(key)
	broadcast(key, undefined)
	notify()
	window.dispatchEvent(new Event("local-storage-update"))

	if (fallbackMode) {
		window.localStorage.removeItem(key)
		return
	}

	idbStorage.del(key).catch((error) => {
		console.error(`IndexedDB delete failed for "${key}"`, error)
	})
}

// Bootstraps the cache from IndexedDB. Safe to call more than once - only
// the first call does anything. AppStorageInitializer (Phase 4) is
// responsible for calling this once on app start, before any writes.
export async function hydrate(): Promise<void> {
	if (hydrationStarted || typeof window === "undefined") return
	hydrationStarted = true

	// `hydrated` only flips once the cache is actually populated (or fallback
	// mode is on) - isHydrated() callers like useFirstVisit treat a missing
	// key as "genuinely absent", which isn't true while getAll() is in flight.
	if (!idbStorage.isIndexedDBAvailable()) {
		fallbackMode = true
		hydrated = true
		notify()
		return
	}

	try {
		const all = await idbStorage.getAll()
		for (const [key, value] of Object.entries(all)) {
			cache.set(key, value)
		}
		getChannel()
	} catch (error) {
		console.error("IndexedDB hydration failed, falling back to localStorage", error)
		fallbackMode = true
	}

	hydrated = true
	notify()
}
