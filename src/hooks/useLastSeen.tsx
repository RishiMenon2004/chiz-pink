"use client"

import { useSyncExternalStore } from "react"

import * as memoryStorage from "@/helpers/storage/memoryStorage"

const key = "lastSeen"

let resolved = false
let isLastSeenOld = false

const getServerSnapshot = (): boolean => false

// "1.10.0" is newer than "1.9.0", so compare part by part, not as text.
function compareVersions(a: string, b: string) {
	const aParts = a.split(".").map(Number)
	const bParts = b.split(".").map(Number)
	for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
		const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0)
		if (diff !== 0) return diff
	}
	return 0
}

export function useLastSeen(version: string) {
	const getSnapshot = (): boolean => {
		if (typeof window === "undefined") return false
		if (resolved) return isLastSeenOld

		// Same pre-hydration race as useFirstVisit.tsx: memoryStorage hasn't
		// loaded "lastSeen" from IndexedDB yet, so treating a missing cache
		// entry as "never seen" here (and then never re-checking) meant the
		// update splash reappeared on every reload for every visitor, not
		// just when there was genuinely a new changelog entry.
		if (!memoryStorage.isHydrated()) return false

		resolved = true

		// Before 1.1.1 this held a changelog timestamp, which always means an
		// older version than any that stores a version string.
		const lastSeen = memoryStorage.getItem<string | number | null>(key, null)
		isLastSeenOld =
			typeof lastSeen !== "string" || compareVersions(version, lastSeen) > 0

		memoryStorage.setItem(key, version)
		return isLastSeenOld
	}

	const lastSeenOld = useSyncExternalStore(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return lastSeenOld
}
