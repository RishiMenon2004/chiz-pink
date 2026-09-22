"use client"

import { useSyncExternalStore } from "react"

import * as memoryStorage from "@/helpers/storage/memoryStorage"

const key = "hasVisited"

let resolved = false
let isFirstVisit = false

// Locks in the answer the first time it's computed, mirroring the old
// pre-hydration-race version's caching, but only once memoryStorage has
// actually hydrated - see the isHydrated() guard below for why.
const getSnapshot = (): boolean => {
	if (typeof window === "undefined") return false
	if (resolved) return isFirstVisit

	// memoryStorage.hydrate() hasn't finished yet, so cache.has(key) can't
	// tell a genuinely-new visitor from a returning one whose "hasVisited"
	// flag just hasn't loaded from IndexedDB. Report "not first visit" (no
	// splash) until hydration resolves, instead of guessing "first visit"
	// here and then never re-checking - locking in a false positive on
	// every single page load was the bug (the splash reappeared on every
	// reload for every visitor, not just genuinely new ones).
	if (!memoryStorage.isHydrated()) return false

	resolved = true

	if (!memoryStorage.hasItem(key)) {
		memoryStorage.setItem(key, true)
		isFirstVisit = true
	}

	return isFirstVisit
}

const getServerSnapshot = (): boolean => false

export function useFirstVisit() {
	const isFirstVisit = useSyncExternalStore(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return isFirstVisit
}
