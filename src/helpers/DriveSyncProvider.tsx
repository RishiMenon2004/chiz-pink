"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

import { DriveSyncContext } from "@/contexts"
import { AlertContainer } from "@/components/layout/Alert"
import { ModalContainer } from "@/components/layout/Modal"

import { backupImport, backupSetImport, buildBackupPayload } from "./backupData"
import { downloadBackupFromDrive, uploadBackupToDrive } from "./googleDrive"

const AUTO_SYNC_DEBOUNCE_MS = 4000

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
	const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
	// Have we checked Drive for an existing backup yet this session? Auto/manual
	// sync must not run before this, or a fresh device would upload empty local
	// data and clobber a real backup that's sitting on Drive.
	const [initialCheckComplete, setInitialCheckComplete] = useState(false)
	const [restorePrompt, setRestorePrompt] = useState<RestorePrompt | null>(null)

	const isSyncingRef = useRef(false)
	const pendingRef = useRef(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const hasStartedCheckRef = useRef(false)
	// Holds the latest runSync so it can call itself for a queued retry
	// without closing over its own useCallback binding (which the React
	// Compiler can't safely auto-memoize).
	const runSyncRef = useRef<() => void>(() => {})

	// One-time, on sign-in: pull down whatever's on Drive and reconcile it
	// against local data using the same rules as a manual file import.
	useEffect(() => {
		if (sessionStatus !== "authenticated" || !accessToken) return
		if (hasStartedCheckRef.current) return
		hasStartedCheckRef.current = true

		let cancelled = false

		async function checkDriveBackup() {
			try {
				const json = await downloadBackupFromDrive(accessToken!)
				if (cancelled || !json) return

				const result = backupImport(json)

				if (result.status === "synced") {
					setStatus("synced")
					setLastSyncedAt(Number(result.data.lastUpdated) || Date.now())
				} else if (result.status === "newer") {
					backupSetImport(result.data)
					setStatus("synced")
					setLastSyncedAt(Number(result.data.lastUpdated) || Date.now())
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
				console.error(
					"Failed to check Drive for an existing backup",
					error
				)
			} finally {
				if (!cancelled) setInitialCheckComplete(true)
			}
		}

		checkDriveBackup()

		return () => {
			cancelled = true
		}
	}, [sessionStatus, accessToken])

	// Uploads local data to Drive right now, unconditionally. Used both by the
	// gated auto/manual sync path below and by the restore-conflict modal,
	// which needs an immediate, deliberate push once the user has decided.
	const pushToDrive = useCallback(async () => {
		if (!accessToken) return

		setStatus("syncing")
		try {
			await uploadBackupToDrive(accessToken, buildBackupPayload())
			setStatus("synced")
			setLastSyncedAt(Date.now())
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
		<DriveSyncContext.Provider value={{ status, lastSyncedAt, syncNow }}>
			{children}
			{restorePrompt && (
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
