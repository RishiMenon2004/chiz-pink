"use client"

import { useSyncExternalStore } from "react"

// Tracks which localStorage-backed keys have failed to parse as JSON, so a
// corrupt value degrades to its fallback instead of throwing during render
// (all the *Store hooks read via useSyncExternalStore, and a throw there
// takes down the whole tree. Recovery UI (CloudSyncProvider's corruption
// prompt) subscribes to this to offer the user a resync-from-cloud or
// erase-and-start-fresh choice.
type Listener = () => void

let corruptedKeys: string[] = []
const listeners = new Set<Listener>()

function emit() {
	listeners.forEach((listener) => listener())
}

export function reportCorruption(key: string) {
	if (corruptedKeys.includes(key)) return
	corruptedKeys = [...corruptedKeys, key]
	emit()
}

export function clearCorruption() {
	if (corruptedKeys.length === 0) return
	corruptedKeys = []
	emit()
}

function subscribe(listener: Listener) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

function getSnapshot() {
	return corruptedKeys
}

const EMPTY_CORRUPTED_KEYS: string[] = []

function getServerSnapshot(): string[] {
	return EMPTY_CORRUPTED_KEYS
}

export function useCorruptedKeys() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// Parses a localStorage value, falling back (and flagging the key as
// corrupted) instead of throwing when the stored string isn't valid JSON -
// e.g. a stray "undefined" written by a bug, manual tampering, or a botched
// write that got cut off.
export function safeParse<T>(raw: string | null, fallback: T, key: string): T {
	if (!raw) return fallback

	try {
		return JSON.parse(raw) as T
	} catch (error) {
		console.error(`Corrupted localStorage value for "${key}"`, error)
		reportCorruption(key)
		return fallback
	}
}

// Structural sanity check for a value read back from IndexedDB. Unlike
// safeParse (which guards against malformed JSON strings), IndexedDB stores
// structured-clone objects directly, so there's no parse step to fail -
// what can still go wrong is the value being the wrong *shape* (a stray
// primitive, an array where an object was expected, or vice versa), which
// would otherwise pass straight through and crash deeper in a component
// that assumes the real shape. Reuses the same corruption-reporting channel
// as safeParse so CloudSyncProvider's recovery prompt covers this failure
// mode too.
export function validateShape<T>(value: unknown, fallback: T, key: string): T {
	if (value === undefined) return fallback

	const expectedIsArray = Array.isArray(fallback)
	const expectedType = typeof fallback

	const shapeMatches =
		expectedType === "object" && fallback !== null
			? typeof value === "object" &&
				value !== null &&
				Array.isArray(value) === expectedIsArray
			: typeof value === expectedType

	if (!shapeMatches) {
		console.error(`Unexpected shape for "${key}" in storage`, value)
		reportCorruption(key)
		return fallback
	}

	return value as T
}
