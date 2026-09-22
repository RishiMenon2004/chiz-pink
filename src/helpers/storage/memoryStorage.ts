"use client"

import { safeParse } from "@/helpers/dataCorruption"

import * as idbStorage from "./idbStorage"

// Synchronous in-memory cache backing the *Store hooks' getSnapshot(), with
// async write-through to IndexedDB. See
// docs/plans/localstorage-to-indexeddb-migration.md (§3, §4, Phase 1).
//
// - getItem() is synchronous and returns the same cached reference until the
//   key changes - required for useSyncExternalStore, whose bailout depends on
//   getSnapshot() returning a stable reference when nothing changed.
// - setItem() updates the cache and notifies subscribers in the same tick
//   (optimistic write), then queues a debounced, per-key async write to
//   IndexedDB so rapid successive writes to one key can't land out of order.
// - hydrate() bootstraps the cache from IndexedDB on app start. If IndexedDB
//   is unavailable (e.g. blocked in private browsing), falls back to
//   synchronous localStorage read/write instead of losing writes.
// - Cross-tab sync rides a BroadcastChannel: the writing tab posts the
//   already-computed value, so other tabs update instantly without a round
//   trip back through IndexedDB.

type Listener = () => void

const CHANNEL_NAME = "chiz-pink-storage"
const WRITE_DEBOUNCE_MS = 150

type WriteState = {
	timer: ReturnType<typeof setTimeout> | null
	writing: boolean
	dirty: boolean
}

const cache = new Map<string, unknown>()
const listeners = new Set<Listener>()
const writeState = new Map<string, WriteState>()

let fallbackMode = false
let hydrated = false
let channel: BroadcastChannel | null = null

function notify() {
	listeners.forEach((listener) => listener())
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
		channel.onmessage = (event: MessageEvent<{ key: string; value: unknown }>) => {
			const { key, value } = event.data ?? {}
			if (typeof key !== "string") return

			cache.set(key, value)
			notify()
		}
	}

	return channel
}

function broadcast(key: string, value: unknown) {
	getChannel()?.postMessage({ key, value })
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

export function getItem<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback

	if (fallbackMode) {
		if (!cache.has(key)) {
			const raw = window.localStorage.getItem(key)
			cache.set(key, raw !== null ? safeParse(raw, fallback, key) : fallback)
		}
		return cache.get(key) as T
	}

	return cache.has(key) ? (cache.get(key) as T) : fallback
}

export function setItem<T>(key: string, value: T): void {
	if (typeof window === "undefined") return

	cache.set(key, value)
	broadcast(key, value)
	notify()

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

// Bootstraps the cache from IndexedDB. Safe to call more than once - only
// the first call does anything. AppStorageInitializer (Phase 4) is
// responsible for calling this once on app start, before any writes.
export async function hydrate(): Promise<void> {
	if (hydrated || typeof window === "undefined") return
	hydrated = true

	if (!idbStorage.isIndexedDBAvailable()) {
		fallbackMode = true
		notify()
		return
	}

	try {
		const all = await idbStorage.getAll()
		for (const [key, value] of Object.entries(all)) {
			cache.set(key, value)
		}
		getChannel()
		notify()
	} catch (error) {
		console.error("IndexedDB hydration failed, falling back to localStorage", error)
		fallbackMode = true
		notify()
	}
}
