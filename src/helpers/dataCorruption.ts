"use client"

import { useSyncExternalStore } from "react"

// Tracks which localStorage-backed keys have failed to parse as JSON, so a
// corrupt value degrades to its fallback instead of throwing during render
// (all the *Store hooks read via useSyncExternalStore, and a throw there
// takes down the whole tree - SettingsProvider wraps <body> itself). Recovery
// UI (CloudSyncProvider's corruption prompt) subscribes to this to offer the
// user a resync-from-cloud or erase-and-start-fresh choice.
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
