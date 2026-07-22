"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

import { DriveSyncContext } from "@/contexts"
import { AlertContainer } from "@/components/layout/Alert"
import { ModalContainer } from "@/components/layout/Modal"

import { backupImport, backupSetImport, buildBackupPayload, markSynced } from "./backupData"
import { downloadBackupFromDrive, uploadBackupToDrive } from "./googleDrive"

const AUTO_SYNC_DEBOUNCE_MS = 4000
const REMOTE_POLL_INTERVAL_MS = 60000

type SyncStatus = "idle" | "syncing" | "synced" | "error"
type RestorePrompt = {
	kind: "older" | "overwrite"
	data: ReturnType<typeof backupImport>["data"]
	localLastUpdated: number | null
}

// Local's lastUpdated is missing entirely when there's no prior sync history
// (the "overwrite" conflict case) - relative age can't be determined then.
function describeAge(value: number | null, other: number | null) {
	if (value == null || other == null || value === other) return null
	return value > other ? "newer" : "older"
}

export function DriveSyncProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status: sessionStatus } = useSession()
	const accessToken = session?.accessToken

	const [status, setStatus] = useState<SyncStatus>("idle")
	// Wall-clock time we last completed a sync action (push or pull).
	const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
	// The lastUpdated field of whichever backup (pushed or pulled) we most
	// recently confirmed matches Drive - not the wall-clock time of the sync.
	const [latestBackupUpdatedAt, setLatestBackupUpdatedAt] = useState<
		number | null
	>(null)
	// Have we checked Drive for an existing backup yet this session? Auto/manual
	// sync must not run before this, or a fresh device would upload empty local
	// data and clobber a real backup that's sitting on Drive.
	const [initialCheckComplete, setInitialCheckComplete] = useState(false)
	const [restorePrompt, setRestorePrompt] = useState<RestorePrompt | null>(null)

	const isSyncingRef = useRef(false)
	const isPullingRef = useRef(false)
	const pendingRef = useRef(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const hasStartedCheckRef = useRef(false)
	const mountedRef = useRef(true)
	// Holds the latest runSync so it can call itself for a queued retry
	// without closing over its own useCallback binding (which the React
	// Compiler can't safely auto-memoize).
	const runSyncRef = useRef<() => void>(() => {})

	useEffect(() => {
		mountedRef.current = true
		return () => {
			mountedRef.current = false
		}
	}, [])

	// Pulls down whatever's on Drive and reconciles it against local data
	// using the same rules as a manual file import. Called once on sign-in,
	// then again on a poll/focus cadence so remote changes from other
	// devices eventually surface here too.
	const pullFromDrive = useCallback(async () => {
		if (!accessToken) return
		// Don't pull mid-push, mid-pull, or while the user has an unresolved
		// restore conflict already on screen.
		if (isSyncingRef.current || isPullingRef.current || restorePrompt) return

		isPullingRef.current = true
		try {
			const json = await downloadBackupFromDrive(accessToken)
			if (!mountedRef.current || !json) return

			const result = backupImport(json)

			if (result.status === "synced") {
				markSynced()
				setStatus("synced")
				setLastSyncedAt(Date.now())
				setLatestBackupUpdatedAt(Number(result.data.lastUpdated) || Date.now())
			} else if (result.status === "newer") {
				backupSetImport(result.data)
				markSynced()
				setStatus("synced")
				setLastSyncedAt(Date.now())
				setLatestBackupUpdatedAt(Number(result.data.lastUpdated) || Date.now())
			} else if (
				result.status === "older" ||
				result.status === "overwrite"
			) {
				const localLastUpdated =
					Number(window.localStorage.getItem("lastUpdated")) || null
				setRestorePrompt({
					kind: result.status,
					data: result.data,
					localLastUpdated,
				})
			}
		} catch (error) {
			console.error("Failed to check Drive for remote changes", error)
		} finally {
			isPullingRef.current = false
		}
	}, [accessToken, restorePrompt])

	// One-time, on sign-in.
	useEffect(() => {
		if (sessionStatus !== "authenticated" || !accessToken) return
		if (hasStartedCheckRef.current) return
		hasStartedCheckRef.current = true

		pullFromDrive().finally(() => {
			if (mountedRef.current) setInitialCheckComplete(true)
		})
	}, [sessionStatus, accessToken, pullFromDrive])

	// Ongoing: re-check Drive on a poll interval and whenever the tab regains
	// focus, so changes made on another device eventually show up here too.
	useEffect(() => {
		if (sessionStatus !== "authenticated" || !accessToken) return
		if (!initialCheckComplete) return

		const interval = setInterval(pullFromDrive, REMOTE_POLL_INTERVAL_MS)

		const handleFocus = () => {
			if (document.visibilityState === "visible") pullFromDrive()
		}

		document.addEventListener("visibilitychange", handleFocus)
		window.addEventListener("focus", handleFocus)

		return () => {
			clearInterval(interval)
			document.removeEventListener("visibilitychange", handleFocus)
			window.removeEventListener("focus", handleFocus)
		}
	}, [sessionStatus, accessToken, initialCheckComplete, pullFromDrive])

	// Uploads local data to Drive right now, unconditionally. Used both by the
	// gated auto/manual sync path below and by the restore-conflict modal,
	// which needs an immediate, deliberate push once the user has decided.
	const pushToDrive = useCallback(async () => {
		if (!accessToken) return

		setStatus("syncing")
		try {
			const payload = buildBackupPayload()
			await uploadBackupToDrive(accessToken, payload)
			markSynced()
			setStatus("synced")
			setLastSyncedAt(Date.now())
			setLatestBackupUpdatedAt(Number(payload.lastUpdated) || Date.now())
		} catch (error) {
			console.error("Failed to sync backup to Drive", error)
			setStatus("error")
		}
	}, [accessToken])

	useEffect(() => {
		async function runSync() {
			// Never sync before the initial restore check has resolved, and never
			// sync while the user hasn't decided on a pending restore conflict.
			if (!accessToken || !initialCheckComplete || restorePrompt) return

			if (isSyncingRef.current) {
				pendingRef.current = true
				return
			}

			isSyncingRef.current = true
			await pushToDrive()
			isSyncingRef.current = false

			if (pendingRef.current) {
				pendingRef.current = false
				runSyncRef.current()
			}
		}

		runSyncRef.current = runSync
	}, [accessToken, initialCheckComplete, restorePrompt, pushToDrive])

	const syncNow = useCallback(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current)
			debounceRef.current = null
		}
		runSyncRef.current()
	}, [])

	useEffect(() => {
		if (sessionStatus !== "authenticated" || !accessToken) return

		const handleChange = () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
			debounceRef.current = setTimeout(
				() => runSyncRef.current(),
				AUTO_SYNC_DEBOUNCE_MS
			)
		}

		window.addEventListener("local-storage-update", handleChange)

		return () => {
			window.removeEventListener("local-storage-update", handleChange)
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [sessionStatus, accessToken])

	// Explicit, immediate resolution - no waiting on the debounce for "local wins".
	const resolveRestorePrompt = async (choice: "local" | "drive") => {
		if (!restorePrompt) return

		if (choice === "drive") {
			backupSetImport(restorePrompt.data)
			markSynced()
			setLastSyncedAt(Date.now())
			setLatestBackupUpdatedAt(Number(restorePrompt.data.lastUpdated) || Date.now())
		} else {
			await pushToDrive()
		}

		setRestorePrompt(null)
	}

	const remoteLastUpdated = restorePrompt
		? Number(restorePrompt.data.lastUpdated) || null
		: null
	const localAge = restorePrompt
		? describeAge(restorePrompt.localLastUpdated, remoteLastUpdated)
		: null
	const remoteAge = restorePrompt
		? describeAge(remoteLastUpdated, restorePrompt.localLastUpdated)
		: null

	return (
		<DriveSyncContext.Provider
			value={{ status, lastSyncedAt, latestBackupUpdatedAt, syncNow }}>
			{children}
			{(restorePrompt?.kind === "older" || restorePrompt?.kind === "overwrite") && (
				<ModalContainer onClose={() => resolveRestorePrompt("local")}>
					<AlertContainer
						type="choices"
						onConfirm={() => resolveRestorePrompt("drive")}
						confirmLabel={`Use Cloud Data${remoteAge ? ` (${remoteAge})` : ""}`}
						onCancel={() => resolveRestorePrompt("local")}
						cancelLabel={`Keep Local Data${localAge ? ` (${localAge})` : ""}`}>
						{restorePrompt.kind === "older"
							? "Your BACKUP is older than your current data."
							: "Your BACKUP may conflict with your current data."}
						<br />
						What would you like to do?
					</AlertContainer>
				</ModalContainer>
			)}
		</DriveSyncContext.Provider>
	)
}
