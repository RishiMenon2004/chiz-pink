"use client"

import { SettingsConfigContext } from "@/contexts"
import { isInitialSyncPending, useInitialSyncPending } from "@/helpers/syncGate"
import { getStaminaResetBoundaries } from "@/helpers/staminaReset"
import { SettingsRecord } from "@/types/settings"
import { ReactNode, useEffect, useSyncExternalStore } from "react"

let lastRawValue: string | null = null

const SERVER_FALLBACK: SettingsRecord = {
	appearance: {
		"use-cursors": true,
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

let cachedSettings: SettingsRecord = {
	...SERVER_FALLBACK,
}

function readSettings() {
	if (typeof window === "undefined") return SERVER_FALLBACK

	const value = localStorage.getItem("settings")
	return JSON.parse(value || JSON.stringify(SERVER_FALLBACK))
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

		try {
			localStorage.setItem("settings", JSON.stringify(updatedSettings))
			if (!options?.silent) {
				localStorage.setItem("lastUpdated", JSON.stringify(Date.now()))
			}
			window.dispatchEvent(new Event("local-storage-update"))
		} catch (err) {
			console.error("Local Storage Error:", err)
		}
	},

	setConfig<K extends keyof SettingsRecord>(
		key: K,
		updater:
			| Partial<SettingsRecord[K]>
			| ((current: SettingsRecord[K]) => Partial<SettingsRecord[K]>)
	) {
		this.updateSettings((current) => ({
			...current,
			[key]: {
				...current[key],
				...(typeof updater === "function"
					? updater(current[key])
					: updater),
			},
		}))
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
	if (typeof window === "undefined") return SERVER_FALLBACK as SettingsRecord

	const rawValue = localStorage.getItem("settings")

	if (rawValue !== lastRawValue) {
		cachedSettings = JSON.parse(
			rawValue || JSON.stringify(SERVER_FALLBACK)
		) satisfies SettingsRecord
		lastRawValue = rawValue
	}

	return cachedSettings
}

const getServerSnapshot = () => {
	return SERVER_FALLBACK
}

export function useSettingsStore() {
	const settings = useSyncExternalStore<SettingsRecord>(
		subscribe,
		getSnapshot,
		getServerSnapshot
	)

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

	// Depends on syncPending so this retries once the initial Drive check
	// resolves - the backfill is a no-op while sync is pending, and without
	// this dependency it would only ever get the one shot on mount.
	const syncPending = useInitialSyncPending()

	useEffect(() => {
		if (syncPending) return

		if (!settings?.appearance || !settings?.userdata) {
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
	const server = settings.userdata?.server
	const maxStamina = settings.userdata?.["max-stamina"]
	const lastStaminaReset = settings.userdata?.["last-stamina-reset"]

	useEffect(() => {
		if (syncPending || !server || maxStamina === undefined) return

		const checkStaminaReset = () => {
			const { previousReset } = getStaminaResetBoundaries(
				server,
				Date.now()
			)

			if (previousReset > (lastStaminaReset ?? 0)) {
				actions.setConfig("userdata", {
					"current-stamina": maxStamina,
					"last-stamina-reset": previousReset,
				})
			}
		}

		checkStaminaReset()
		const interval = setInterval(checkStaminaReset, 30_000)
		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [syncPending, server, maxStamina, lastStaminaReset])

	return (
		<SettingsConfigContext.Provider value={settings}>
			<body className={`${useCustomCursor ? "custom-cursors" : ""}`}>
				{children}
			</body>
		</SettingsConfigContext.Provider>
	)
}
