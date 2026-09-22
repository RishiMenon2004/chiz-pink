"use client"

import { SettingsConfigContext } from "@/contexts"
import { isInitialSyncPending, useInitialSyncPending } from "@/helpers/syncGate"
import { createKeyvalStore } from "@/helpers/storage/keyvalStore"
import {
	getBiWeeklyMondayResetBoundaries,
	getBiWeeklyWednesdayResetBoundaries,
	getDailyResetBoundaries,
	getMonthlyResetBoundaries,
	getSeasonalResetBoundaries,
	getWeeklyResetBoundaries,
} from "@/helpers/resetBoundaries"
import { getRefilledPixelsState } from "@/helpers/staminaReset"
import { SettingsRecord } from "@/types/settings"
import { ReactNode, useEffect } from "react"
import { checklistActions, useChecklistStore } from "./useChecklistStore"

export const SERVER_FALLBACK: SettingsRecord = {
	appearance: {
		"use-cursors": true,
		"use-hybrid-planner": true,
	},
	behaviour: {
		"auto-claim": true,
		"calendar-day-boundary": "server",
	},
	userdata: {
		nickname: "Appraiser",
		server: "SEA",
		"current-pixels": 240,
		"max-pixels": 240,
		"pixels-last-edited": Date.now(),
		"current-stamina": 500,
		"max-stamina": 500,
		"last-stamina-reset": 0,
	},
}

const store = createKeyvalStore("settings", SERVER_FALLBACK)

export function readSettings() {
	return store.read()
}

export const settingsActions = {
	updateSettings(
		updater:
			| Partial<SettingsRecord>
			| ((current: SettingsRecord) => Partial<SettingsRecord>),
		// Schema-default backfills (e.g. SettingsProvider filling in a newly
		// added setting key) aren't real user edits and shouldn't bump
		// lastUpdated - doing so makes local data look newer than a Drive
		// backup that's otherwise identical, forcing a false "BACKUP is
		// older" conflict prompt on every fresh load.
		options?: { silent?: boolean }
	) {
		if (typeof window === "undefined") return
		if (isInitialSyncPending()) return

		const settingsData = readSettings()
		const data =
			typeof updater === "function" ? updater(settingsData) : updater
		const updatedSettings = { ...settingsData, ...data }

		store.write(updatedSettings, options)
	},

	setConfig<K extends keyof SettingsRecord>(
		key: K,
		updater:
			| Partial<SettingsRecord[K]>
			| ((current: SettingsRecord[K]) => Partial<SettingsRecord[K]>),
		// See updateSettings' options param - passed through as-is so an
		// auto-applied reset/refill (not a real user edit) can opt out of
		// bumping lastUpdated.
		options?: { silent?: boolean }
	) {
		this.updateSettings((current) => ({
			...current,
			[key]: {
				...current[key],
				...(typeof updater === "function"
					? updater(current[key])
					: updater),
			},
		}), options)
	},
}

export function useSettingsStore() {
	const settings = store.useValue()

	return {
		settings,
		actions: {
			updateSettings: settingsActions.updateSettings,
			setConfig: settingsActions.setConfig,
		},
	}
}

export function SettingsProvider({ children }: { children: ReactNode }) {
	const { settings, actions } = useSettingsStore()
	const { checklist } = useChecklistStore()

	// Depends on syncPending so this retries once the initial Drive check
	// resolves - the backfill is a no-op while sync is pending, and without
	// this dependency it would only ever get the one shot on mount.
	const syncPending = useInitialSyncPending()

	useEffect(() => {
		if (syncPending) return

		if (
			!settings?.appearance ||
			!settings?.behaviour ||
			!settings?.userdata
		) {
			actions.updateSettings(
				{
					...SERVER_FALLBACK,
				},
				{ silent: true }
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [syncPending])

	const useCustomCursor = settings.appearance?.["use-cursors"]

	useEffect(() => {
		document.body.classList.toggle("custom-cursors", Boolean(useCustomCursor))
	}, [useCustomCursor])

	const server = settings.userdata?.server
	const maxStamina = settings.userdata?.["max-stamina"]
	const lastStaminaReset = settings.userdata?.["last-stamina-reset"]

	useEffect(() => {
		if (syncPending || !server || maxStamina === undefined) return

		const checkStaminaReset = () => {
			const { previousReset } = getWeeklyResetBoundaries(server, Date.now())

			if (previousReset > (lastStaminaReset ?? 0)) {
				// Deterministically re-derivable from the elapsed reset boundary,
				// not a real user edit - shouldn't make local data look newer than
				// an otherwise-identical Drive backup (see updateSettings' options
				// param doc comment).
				actions.setConfig(
					"userdata",
					{
						"current-stamina": maxStamina,
						"last-stamina-reset": previousReset,
					},
					{ silent: true }
				)
			}
		}

		checkStaminaReset()
		const interval = setInterval(checkStaminaReset, 30_000)
		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [syncPending, server, maxStamina, lastStaminaReset])

	useEffect(() => {
		if (syncPending || !server) return

		const checkResets = () => {
			const { previousReset: previousDailyReset } =
				getDailyResetBoundaries(server, Date.now())
			const { previousReset: previousWeeklyReset } =
				getWeeklyResetBoundaries(server, Date.now())
			const { previousReset: previousBiWeeklyMonReset } =
				getBiWeeklyMondayResetBoundaries(server, Date.now())
			const { previousReset: previousBiWeeklyWedReset } =
				getBiWeeklyWednesdayResetBoundaries(server, Date.now())
			const { previousReset: previousMonthlyReset } =
				getMonthlyResetBoundaries(server, Date.now())
			const { previousReset: previousSeasonalReset } =
				getSeasonalResetBoundaries(Date.now())

			const resets = checklist.resetTimestamps ?? {}

			const resetChecks = [
				["lastDailyReset", "daily", previousDailyReset],
				["lastWeeklyReset", "weekly", previousWeeklyReset],
				["lastBiWeeklyMondayReset", "biWeekly", previousBiWeeklyMonReset],
				["lastBiWeeklyWednesdayReset", "biWeekly", previousBiWeeklyWedReset],
				["lastMonthlyReset", "monthly", previousMonthlyReset],
				["lastSeasonalReset", "seasonal", previousSeasonalReset],
			] as const

			for (const [key, type, timestamp] of resetChecks) {
				if (timestamp > (resets[key] ?? 0)) {
					checklistActions.resetChecklist(type, timestamp, key)
				}
			}
		}
		checkResets()
		const interval = setInterval(checkResets, 30_000)
		return () => clearInterval(interval)
	}, [syncPending, server, checklist.resetTimestamps])

	const currentPixels = settings.userdata?.["current-pixels"]
	const maxPixels = settings.userdata?.["max-pixels"]
	const pixelsLastEdited = settings.userdata?.["pixels-last-edited"]

	useEffect(() => {
		if (
			syncPending ||
			currentPixels === undefined ||
			maxPixels === undefined ||
			pixelsLastEdited === undefined
		)
			return

		const checkPixelRefill = () => {
			const refilled = getRefilledPixelsState({
				current: currentPixels,
				max: maxPixels,
				lastEdited: pixelsLastEdited,
				now: Date.now(),
			})

			if (!refilled) return

			// Deterministically re-derivable from elapsed time (see
			// getRefilledPixelsState), not a real user edit - see the
			// stamina-reset silent write above for why this matters.
			actions.setConfig(
				"userdata",
				{
					"current-pixels": refilled.current,
					"pixels-last-edited": refilled.lastEdited,
				},
				{ silent: true }
			)
		}

		checkPixelRefill()
		const interval = setInterval(checkPixelRefill, 30_000)
		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [syncPending, currentPixels, maxPixels, pixelsLastEdited])

	return (
		<SettingsConfigContext.Provider value={settings}>
			{children}
		</SettingsConfigContext.Provider>
	)
}
