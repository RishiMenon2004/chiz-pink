"use client"

import { useSyncExternalStore } from "react"

import * as memoryStorage from "@/helpers/storage/memoryStorage"

const key = "hasVisited"

let resolved = false
let isFirstVisit = false

// Locks in the answer the first time it's computed, mirroring the old
// pre-hydration-race version's caching, but only once memoryStorage has
// actually hydrated - see the isHydrated() guard below for why. Null until
// then. Exported so other first-visit checks (useToolIntro) get this
// load's answer instead of reading "hasVisited" after it's been written.
export function getFirstVisit(): boolean | null {
	if (typeof window === "undefined") return null
	if (resolved) return isFirstVisit

	// memoryStorage.hydrate() hasn't finished yet, so cache.has(key) can't
	// tell a genuinely-new visitor from a returning one whose "hasVisited"
	// flag just hasn't loaded from IndexedDB. Report "unknown" until
	// hydration resolves, instead of guessing "first visit" here and then
	// never re-checking - locking in a false positive on every single page
	// load was the bug (the splash reappeared on every reload for every
	// visitor, not just genuinely new ones).
	if (!memoryStorage.isHydrated()) return null

	resolved = true

	if (!memoryStorage.hasItem(key)) {
		memoryStorage.setItem(key, true)
		isFirstVisit = true
	}

	return isFirstVisit
}

// No splash until the answer is known.
const getSnapshot = (): boolean => getFirstVisit() ?? false

const getServerSnapshot = (): boolean => false

export function useFirstVisit() {
	const isFirstVisit = useSyncExternalStore(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return isFirstVisit
}
