"use client"

import { useSyncExternalStore } from "react"

import * as memoryStorage from "@/helpers/storage/memoryStorage"

const key = "lastSeen"

let resolved = false
let isLastSeenOld = false

const getServerSnapshot = (): boolean => false

export function useLastSeen(time?: number) {
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

		const currentTime = time ?? Date.now()
		const lastSeen = memoryStorage.getItem<number | null>(key, null)
		isLastSeenOld = !lastSeen || currentTime > lastSeen

		memoryStorage.setItem(key, currentTime)
		return isLastSeenOld
	}

	const lastSeenOld = useSyncExternalStore(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return lastSeenOld
}
