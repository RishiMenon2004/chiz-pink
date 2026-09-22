"use client"

import { useSyncExternalStore } from "react"

import type { ChecklistRecord, ChecklistEntry } from "@/types/checklist"

import { getAllActivitiesList } from "@/data/activities/activities"

import { isInitialSyncPending } from "@/helpers/syncGate"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

/**
 * Guarantees a valid {@link ChecklistEntry} for any activity id, seeding a
 * sane default when the stored record is missing the key (which happens
 * whenever a new activity ships after a player's save already existed —
 * e.g. `pink_paws_heist`). Without this, any code that reaches into
 * `activities[...][id].disabled` throws `cannot access property ... of
 * undefined` for players upgrading from an older save.
 */
function normalizeTask(
	task: Partial<ChecklistEntry> | undefined
): ChecklistEntry {
	return {
		disabled: task?.disabled ?? false,
		checked: task?.checked ?? 0,
		claimed: task?.claimed,
		claimedAt: task?.claimedAt,
	}
}

/**
 * Ensures every activity declared in the shipped catalog has an entry in its
 * matching bucket, folding in whatever the player already recorded. Unknown /
 * orphaned ids are dropped so stale saves can't leak junk rows.
 *
 * @param record The parsed checklist record (mutated in place).
 * @returns True when any gap/orphan was repaired, signalling the caller to
 *          persist the cleaned shape back to storage.
 */
function reconcileMissingActivities(record: ChecklistRecord): boolean {
	let changed = false

	const bucketForKey: Record<string, keyof ChecklistRecord["activities"]> = {
		Daily: "daily",
		Weekly: "weekly",
		"Bi-Weekly": "biWeekly",
		Monthly: "monthly",
		Seasonal: "seasonal",
	}

	for (const activity of getAllActivitiesList()) {
		const bucket = bucketForKey[activity.type]
		if (!bucket) continue

		const tasks = record.activities[bucket] ?? {}
		const normalized = normalizeTask(tasks[activity.id])

		if (JSON.stringify(tasks[activity.id]) !== JSON.stringify(normalized)) {
			tasks[activity.id] = normalized
			changed = true
		}
	}

	// Drop orphans: ids sitting in a bucket that no longer correspond to a
	// shipped activity of that type.
	for (const [type, bucket] of [
		["Daily", "daily"],
		["Weekly", "weekly"],
		["Bi-Weekly", "biWeekly"],
		["Monthly", "monthly"],
		["Seasonal", "seasonal"],
	] as const) {
		const tasks = record.activities[bucket] ?? {}
		const validIds = new Set(
			getAllActivitiesList()
				.filter((a) => a.type === type)
				.map((a) => a.id)
		)
		for (const id of Object.keys(tasks)) {
			if (!validIds.has(id)) {
				delete tasks[id]
				changed = true
			}
		}
	}

	return changed
}

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

let cachedChecklist: ChecklistRecord = SERVER_FALLBACK
let lastProcessed: ChecklistRecord | null = null

function readChecklist(): ChecklistRecord {
	if (typeof window === "undefined") return SERVER_FALLBACK
	return memoryStorage.getItem("checklist", SERVER_FALLBACK)
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

		memoryStorage.setItem("checklist", updated)
		memoryStorage.setItem("lastUpdated", Date.now())
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
		const biWeeklies = updated.activities["biWeekly"] ?? {}

		if (timestampKey === "lastBiWeeklyWednesdayReset") {
			biWeeklies["btr"] = {
				checked: 0,
				disabled: biWeeklies["btr"]?.disabled ?? false,
			}
		} else if (timestampKey === "lastBiWeeklyMondayReset") {
			biWeeklies["pink_paws_heist"] = {
				checked: 0,
				disabled: biWeeklies["pink_paws_heist"]?.disabled ?? false,
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

		memoryStorage.setItem("checklist", updated)
		memoryStorage.setItem("lastUpdated", Date.now())
	},
}

const getSnapshot = () => {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const current = memoryStorage.getItem("checklist", SERVER_FALLBACK)

	if (current !== lastProcessed) {
		lastProcessed = current
		cachedChecklist = current

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

		// Fill in any activity ids that ship in the catalog but are missing
		// from the stored save (players upgrading from an older version),
		// dropping orphaned ids, and persist the reconciled shape back so the
		// repair sticks. Mirrors the legacy-key rewrite above.
		const repaired = reconcileMissingActivities(cachedChecklist)

		if (hadOldKey || repaired) {
			memoryStorage.setItem("checklist", cachedChecklist)
		}
	}

	return cachedChecklist
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useChecklistStore() {
	const checklist = useSyncExternalStore<ChecklistRecord>(
		memoryStorage.subscribe,
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
