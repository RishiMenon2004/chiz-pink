"use client"

import { useSyncExternalStore } from "react"

import type { ChecklistRecord, ChecklistEntry } from "@/types/checklist"

import { getAllActivitiesList } from "@/data/activities/activities"

import { isInitialSyncPending } from "@/helpers/syncGate"
import { createRecordStore } from "@/helpers/storage/recordStore"
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

	record.activities ??= { ...SERVER_FALLBACK.activities }

	for (const activity of getAllActivitiesList()) {
		const bucket = bucketForKey[activity.type]
		if (!bucket) continue

		const tasks = (record.activities[bucket] ??= {})
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

const store = createRecordStore("checklist", SERVER_FALLBACK)

let cachedChecklist: ChecklistRecord = SERVER_FALLBACK
let lastProcessed: ChecklistRecord | null = null

// Reads through getSnapshot() so edits build on the repaired record, not the
// raw stored one.
function readChecklist(): ChecklistRecord {
	return getSnapshot()
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

		store.write(updated)
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
			activities: {
				...current.activities,
				[type]: { ...current.activities[type] },
				biWeekly: { ...current.activities.biWeekly },
			},
			resetTimestamps: {
				...current.resetTimestamps,
				[timestampKey]: resetAt,
			},
		}

		const biWeeklies = updated.activities["biWeekly"]

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

		// Deterministically re-derivable from the elapsed reset boundary, not a
		// real user edit - shouldn't make local data look newer than an
		// otherwise-identical Drive backup (see useSettingsStore.tsx's
		// updateSettings options param doc comment).
		store.write(updated, { silent: true })
	},
}

function getSnapshot(): ChecklistRecord {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const current = store.read()
	if (current === lastProcessed) return cachedChecklist

	// Repair a deep copy - the stored object may be SERVER_FALLBACK itself
	// (before hydration), which must never be mutated.
	const next = structuredClone(current)

	// Pre-resetTimestamps records kept lastDailyReset at the top level -
	// fold it into resetTimestamps (creating it first, since old data
	// won't have one) before the missing-key backfill below.
	const legacy = next as Record<string, unknown>
	const hadOldKey = "lastDailyReset" in legacy
	if (hadOldKey) {
		next.resetTimestamps ??= { ...SERVER_FALLBACK.resetTimestamps }
		next.resetTimestamps.lastDailyReset = legacy.lastDailyReset as number
		delete legacy.lastDailyReset
	}

	next.resetTimestamps = {
		...SERVER_FALLBACK.resetTimestamps,
		...next.resetTimestamps,
	}

	// Fill in any activity ids that ship in the catalog but are missing
	// from the stored save (players upgrading from an older version),
	// dropping orphaned ids.
	const repaired = reconcileMissingActivities(next)

	lastProcessed = current
	cachedChecklist = next

	// Only persist the repair once local data has actually loaded - before
	// hydration store.read() returns SERVER_FALLBACK, and writing that back
	// would queue an IndexedDB write that overwrites the real save.
	if ((hadOldKey || repaired) && !isInitialSyncPending()) {
		// Set before writing: store.write() notifies synchronously, which
		// re-enters getSnapshot() and must hit the early return above now
		// that the store holds `next`.
		lastProcessed = next
		store.write(next, { silent: true })
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
