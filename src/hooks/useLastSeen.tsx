"use client"

import { useSyncExternalStore } from "react"

const timeCheckCache: Record<string, boolean> = {}

const key = "lastSeen"

const subscribe = (callback: () => void) => {
	if (typeof window === "undefined") return () => {}
	window.addEventListener("storage", callback)
	return () => window.removeEventListener("storage", callback)
}

const getServerSnapshot = (): boolean => false

export function useLastSeen(time?: number) {
	const getSnapshot = (): boolean => {
		if (typeof window === "undefined") return false

		if (key in timeCheckCache) {
			return timeCheckCache[key]
		}

		const currentTime = time ?? Date.now()
		const lastSeen = localStorage.getItem(key)
		const isNewer = !lastSeen || currentTime > Number(lastSeen)

		localStorage.setItem(key, currentTime.toString())
		timeCheckCache[key] = isNewer

		return isNewer
	}

	const isLastSeenOld = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return isLastSeenOld
}
