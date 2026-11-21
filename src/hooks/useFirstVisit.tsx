"use client"

import { useEffect, useSyncExternalStore } from "react"

import * as memoryStorage from "@/helpers/storage/memoryStorage"

const key = "hasVisited"

let resolved = false
let isFirstVisit = false

// Pure read: locks in the answer once storage hydrates without writing during render.
export function getFirstVisit(): boolean | null {
	if (typeof window === "undefined") return null
	if (resolved) return isFirstVisit
	if (!memoryStorage.isHydrated()) return null

	resolved = true
	isFirstVisit = !memoryStorage.hasItem(key)
	return isFirstVisit
}

// Persists the visited flag outside render (called post-hydration and in useFirstVisit).
export function markVisited(): void {
	if (typeof window === "undefined" || !memoryStorage.isHydrated()) return
	if (!memoryStorage.hasItem(key)) {
		memoryStorage.setItem(key, true)
	}
}

// No splash until the answer is known.
const getSnapshot = (): boolean => getFirstVisit() ?? false

const getServerSnapshot = (): boolean => false

const subscribeFirstVisit = (listener: () => void) =>
	memoryStorage.subscribeKey(key, listener)

export function useFirstVisit() {
	const firstVisit = useSyncExternalStore(
		subscribeFirstVisit,
		getSnapshot,
		getServerSnapshot
	)

	useEffect(() => {
		if (firstVisit) markVisited()
	}, [firstVisit])

	return firstVisit
}
