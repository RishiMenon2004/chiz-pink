"use client"

import { useSyncExternalStore } from "react"

import * as memoryStorage from "@/helpers/storage/memoryStorage"

const timeCheckCache: Record<string, boolean> = {}

const key = "lastSeen"

const getServerSnapshot = (): boolean => false

export function useLastSeen(time?: number) {
	const getSnapshot = (): boolean => {
		if (typeof window === "undefined") return false

		if (key in timeCheckCache) {
			return timeCheckCache[key]
		}

		const currentTime = time ?? Date.now()
		const lastSeen = memoryStorage.getItem<number | null>(key, null)
		const isNewer = !lastSeen || currentTime > lastSeen

		memoryStorage.setItem(key, currentTime)
		timeCheckCache[key] = isNewer

		return isNewer
	}

	const isLastSeenOld = useSyncExternalStore(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return isLastSeenOld
}
