"use client"

import { useSyncExternalStore } from "react"

import type { ChecklistRecord } from "@/types/checklist"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { safeParse } from "@/helpers/dataCorruption"

let lastRawValue: string | null = null

export const SERVER_FALLBACK: ChecklistRecord = {
	activities: {
		daily: {},
		weekly: {},
		biWeekly: {},
		monthly: {},
		seasonal: {},
	},
	events: {},
	resetTimestamps: {
		lastDailyReset: 0,
		lastWeeklyReset: 0,
		lastBiWeeklyMondayReset: 0,
		lastBiWeeklyWednesdayReset: 0,
		lastMonthlyReset: 0,
		lastSeasonalReset: 0,
	},
}

let cachedChecklist: ChecklistRecord = { ...SERVER_FALLBACK }

function readChecklist(): ChecklistRecord {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const value = localStorage.getItem("checklist")
	return safeParse(value, SERVER_FALLBACK, "checklist")
}

export const checklistActions = {
	setChecklist<K extends keyof Omit<ChecklistRecord, "resetTimestamps">>(
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

	// Clears activities when their reset boundaries triggers it, keeping their
	// their disabled states and records the reset boundary that triggered it,
	// so the periodic check (see SettingsProvider) doesn't fire again until the next one.
	resetChecklist(
		type: keyof ChecklistRecord["activities"],
		resetAt: number,
		timestampKey = ("last" +
			type.charAt(0).toUpperCase() +
			type.slice(1) +
			"Reset") as keyof ChecklistRecord["resetTimestamps"]
	) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		const current = readChecklist()
		const updated: ChecklistRecord = {
			...current,
			activities: { ...current.activities },
			resetTimestamps: {
				...current.resetTimestamps,
				[timestampKey]: resetAt,
			},
		}

		updated.activities[type] ??= {}
		const biWeeklies = current.activities["biWeekly"]

		if (timestampKey === "lastBiWeeklyWednesdayReset") {
			biWeeklies["btr"] = {
				checked: 0,
				disabled: biWeeklies["btr"].disabled ?? false,
			}
		} else if (timestampKey === "lastBiWeeklyMondayReset") {
			biWeeklies["pink_paws_heist"] = {
				checked: 0,
				disabled: biWeeklies["pink_paws_heist"].disabled ?? false,
			}
		} else {
			Object.entries(current.activities[type] ?? {}).forEach(
				([id, task]) => {
					updated.activities[type][id] = {
						checked: 0,
						disabled: task.disabled ?? false,
					}
				}
			)
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
		const parsed = safeParse(rawValue, SERVER_FALLBACK, "checklist")
		cachedChecklist =
			parsed && typeof parsed === "object"
				? (parsed as ChecklistRecord)
				: SERVER_FALLBACK

		// Pre-resetTimestamps records kept lastDailyReset at the top level -
		// fold it into resetTimestamps (creating it first, since old data
		// won't have one) before the missing-key backfill below.
		const legacy = cachedChecklist as Record<string, unknown>
		const hadOldKey = "lastDailyReset" in legacy
		if (hadOldKey) {
			cachedChecklist.resetTimestamps ??= {
				...SERVER_FALLBACK.resetTimestamps,
			}
			cachedChecklist.resetTimestamps.lastDailyReset =
				legacy.lastDailyReset as number
			delete legacy.lastDailyReset
		}

		cachedChecklist.resetTimestamps = {
			...SERVER_FALLBACK.resetTimestamps,
			...cachedChecklist.resetTimestamps,
		}

		if (hadOldKey) {
			try {
				localStorage.setItem("checklist", JSON.stringify(cachedChecklist))
			} catch {}
		}

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
			resetChecklist: checklistActions.resetChecklist,
		},
	}
}
