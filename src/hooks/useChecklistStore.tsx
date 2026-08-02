"use client"

import { useSyncExternalStore } from "react"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { safeParse } from "@/helpers/dataCorruption"

import type { ChecklistRecord } from "@/types/checklist"

let lastRawValue: string | null = null

export const SERVER_FALLBACK: ChecklistRecord = {
	activities: {},
	events: {},
	lastDailyReset: 0,
}

let cachedChecklist: ChecklistRecord = { ...SERVER_FALLBACK }

function readChecklist(): ChecklistRecord {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const value = localStorage.getItem("checklist")
	return safeParse(value, SERVER_FALLBACK, "checklist")
}

export const checklistActions = {
	setChecklist<K extends keyof Omit<ChecklistRecord, "lastDailyReset">>(
		key: K,
		updater:
			| Partial<ChecklistRecord[K]>
			| ((current: ChecklistRecord[K]) => Partial<ChecklistRecord[K]>)
	) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		const current = readChecklist()
		const updated: ChecklistRecord = {
			...current,
			[key]: {
				...current[key],
				...(typeof updater === "function"
					? updater(current[key])
					: updater),
			},
		}

		try {
			localStorage.setItem("checklist", JSON.stringify(updated))
			localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
			window.dispatchEvent(new Event("local-storage-update"))
		} catch (err) {
			console.error("Local Storage Error:", err)
		}
	},

	// Clears every activity entry tracked under activities.daily and records
	// the reset boundary that triggered it, so the periodic check (see
	// SettingsProvider) doesn't fire again until the next one.
	resetDaily(resetAt: number) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		const current = readChecklist()
		const updated: ChecklistRecord = {
			...current,
			activities: { ...current.activities, daily: {} },
			lastDailyReset: resetAt,
		}

		try {
			localStorage.setItem("checklist", JSON.stringify(updated))
			localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
			window.dispatchEvent(new Event("local-storage-update"))
		} catch (err) {
			console.error("Local Storage Error:", err)
		}
	},
}

const subscribe = (callback: () => void) => {
	window.addEventListener("storage", callback)
	window.addEventListener("local-storage-update", callback)

	return () => {
		window.removeEventListener("storage", callback)
		window.removeEventListener("local-storage-update", callback)
	}
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const rawValue = localStorage.getItem("checklist")

	if (rawValue !== lastRawValue) {
		cachedChecklist = safeParse(rawValue, SERVER_FALLBACK, "checklist")
		lastRawValue = rawValue
	}

	return cachedChecklist
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useChecklistStore() {
	const checklist = useSyncExternalStore<ChecklistRecord>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

	return {
		checklist,
		actions: {
			setChecklist: checklistActions.setChecklist,
			resetDaily: checklistActions.resetDaily,
		},
	}
}
