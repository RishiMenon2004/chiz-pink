"use client"

import { useEffect, useSyncExternalStore } from "react"

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

const subscribeLastSeen = (listener: () => void) =>
	memoryStorage.subscribeKey(key, listener)

export function useLastSeen(version: string) {
	const isHydrated = useSyncExternalStore(
		memoryStorage.subscribeHydration,
		memoryStorage.isHydrated,
		() => false
	)

	// Pure snapshot: resolves once after hydration without writing during render.
	const getSnapshot = (): boolean => {
		if (typeof window === "undefined") return false
		if (resolved) return isLastSeenOld
		if (!memoryStorage.isHydrated()) return false

		resolved = true

		// Before 1.1.1 this held a changelog timestamp, which is always older.
		const lastSeen = memoryStorage.getItem<string | number | null>(key, null)
		isLastSeenOld =
			typeof lastSeen !== "string" || compareVersions(version, lastSeen) > 0

		return isLastSeenOld
	}

	const lastSeenOld = useSyncExternalStore(
		subscribeLastSeen,
		getSnapshot,
		getServerSnapshot
	)

	useEffect(() => {
		if (!isHydrated) return
		if (memoryStorage.getItem<string | number | null>(key, null) !== version) {
			memoryStorage.setItem(key, version)
		}
	}, [isHydrated, version])

	return lastSeenOld
}
