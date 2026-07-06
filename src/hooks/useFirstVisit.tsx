"use client"

import { useSyncExternalStore } from "react"

const visitCache: Record<string, boolean> = {}

const key = "hasVisited"

export function useFirstVisit() {
	const subscribe = (callback: () => void) => {
		window.addEventListener("storage", callback)
		return () => window.removeEventListener("storage", callback)
	}

	const getSnapshot = (): boolean => {
		if (typeof window === "undefined") return false

		if (key in visitCache) {
			return visitCache[key]
		}

		const hasVisited = localStorage.getItem(key)

		if (!hasVisited) {
			localStorage.setItem(key, "true")
			visitCache[key] = true
			return true
		}

		visitCache[key] = false
		return false
	}

	const getServerSnapshot = (): boolean => false

	const setVisited = () => {
		if (typeof window === "undefined") return

		localStorage.setItem(key, "true")
		visitCache[key] = true
	}

	const isFirstVisit = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return { isFirstVisit, setVisited }
}
