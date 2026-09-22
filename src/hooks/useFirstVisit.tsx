"use client"

import { useSyncExternalStore } from "react"

import * as memoryStorage from "@/helpers/storage/memoryStorage"

const visitCache: Record<string, boolean> = {}

const key = "hasVisited"

const getSnapshot = (): boolean => {
	if (typeof window === "undefined") return false

	if (key in visitCache) {
		return visitCache[key]
	}

	const hasVisited = memoryStorage.hasItem(key)

	if (!hasVisited) {
		memoryStorage.setItem(key, true)
		visitCache[key] = true
		return true
	}

	visitCache[key] = false
	return false
}

const getServerSnapshot = (): boolean => false

const setVisited = () => {
	if (typeof window === "undefined") return

	memoryStorage.setItem(key, true)
	visitCache[key] = true
}

export function useFirstVisit() {
	const isFirstVisit = useSyncExternalStore(
		memoryStorage.subscribe,
		getSnapshot,
		getServerSnapshot
	)
	return isFirstVisit
}
