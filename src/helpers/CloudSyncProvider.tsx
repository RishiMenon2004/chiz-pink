"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useConvexAuth, useMutation, useQuery } from "convex/react"

import { api } from "@convex/_generated/api"

import { CloudSyncContext } from "@/contexts"
import { AlertContainer } from "@/components/layout/Alert"
import { ModalContainer } from "@/components/layout/Modal"

import {
	backupImport,
	backupSetImport,
	buildBackupPayload,
	markSynced,
} from "./backupData"
import { decryptBackupPayload, encryptBackupPayload } from "./backupCrypto"
import { getOrCreateBackupKey } from "./driveBackupKey"
import { setInitialSyncPending } from "./syncGate"

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

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status: sessionStatus } = useSession()
	const accessToken = session?.accessToken
	const convexAuth = useConvexAuth()

	const [status, setStatus] = useState<SyncStatus>("idle")
	// Wall-clock time we last completed a sync action (push or pull).
	const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
	// The lastUpdated field of whichever backup (pushed or pulled) we most
	// recently confirmed matches Convex - not the wall-clock time of the sync.
	const [latestBackupUpdatedAt, setLatestBackupUpdatedAt] = useState<
		number | null
	>(null)
	// Has this device's copy of the account's AES key resolved yet? Gates
	// both the Convex query subscription and any push, same role the old
	// initial-Drive-check flag played.
	const [keyReady, setKeyReady] = useState(false)
	const [restorePrompt, setRestorePrompt] = useState<RestorePrompt | null>(null)

	const keyRef = useRef<CryptoKey | null>(null)
	const isSyncingRef = useRef(false)
	const isReconcilingRef = useRef(false)
	const pendingRef = useRef(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const hasStartedKeyFetchRef = useRef(false)
	// The row's lastUpdated we last reconciled or pushed - skips redundant
	// reconciliation when the live query re-fires for a write we caused.
	const lastReconciledRef = useRef<number | null>(null)
	const mountedRef = useRef(true)
	// Holds the latest runSync so it can call itself for a queued retry
	// without closing over its own useCallback binding (which the React
	// Compiler can't safely auto-memoize).
	const runSyncRef = useRef<() => void>(() => {})
	// Set once this tab has observed an "unauthenticated" session - lets us
	// tell a genuine, explicit fresh sign-in apart from a page just resuming
	// an existing session (see the account-status effect below).
	const hasBeenUnauthenticatedRef = useRef(false)
	const hasClearedUnlinkRef = useRef(false)
	const hasPushedInitialBackupRef = useRef(false)

	useEffect(() => {
		mountedRef.current = true
		return () => {
			mountedRef.current = false
		}
	}, [])

	// Fetches (or creates) this account's backup key from Drive's
	// appDataFolder, once per sign-in. The key never touches our own server -
	// this call goes straight from the browser to googleapis.com.
	useEffect(() => {
		if (!convexAuth.isAuthenticated || !accessToken) return
		if (hasStartedKeyFetchRef.current) return
		hasStartedKeyFetchRef.current = true

		getOrCreateBackupKey(accessToken)
			.then((key) => {
				if (!mountedRef.current) return
				keyRef.current = key
				setKeyReady(true)
			})
			.catch((error) => {
				console.error("Failed to get backup key from Drive", error)
			})
	}, [convexAuth.isAuthenticated, accessToken])

	// No reset-on-sign-out effect needed here: next-auth's signOut() does a
	// full page redirect (see RenderSettings.tsx), so a fresh sign-in always
	// remounts this provider from scratch.

	useEffect(() => {
		if (sessionStatus === "unauthenticated") hasBeenUnauthenticatedRef.current = true
	}, [sessionStatus])

	const clearUnlinked = useMutation(api.accountStatus.clearUnlinked)

	// Live subscription to whether some other device unlinked this account.
	// Any signed-in device (this one included) reacts to the push instantly -
	// no need for that device to still be reachable or its own Google token
	// to still be valid.
	const isUnlinked = useQuery(
		api.accountStatus.isUnlinked,
		convexAuth.isAuthenticated ? {} : "skip"
	)

	useEffect(() => {
		if (!isUnlinked) return

		// A fresh, explicit sign-in in this tab (session went unauthenticated
		// -> authenticated) after being unlinked is the user deliberately
		// choosing to re-link - clear the marker instead of signing back out.
		if (hasBeenUnauthenticatedRef.current) {
			if (hasClearedUnlinkRef.current) return
			hasClearedUnlinkRef.current = true
			clearUnlinked({}).catch((error) => {
				console.error("Failed to clear unlink marker", error)
			})
			return
		}

		// Otherwise this is either an already-open tab that just got unlinked
		// elsewhere, or a device resuming a session that was unlinked while it
		// was closed - either way, force it back to signed out.
		signOut()
	}, [isUnlinked, clearUnlinked])

	// The live subscription itself - this is the "push update" mechanism.
	// Any device's write to this row re-runs this hook on every other
	// subscribed device, no polling or focus/visibility listeners needed.
	const row = useQuery(
		api.backups.getBackup,
		convexAuth.isAuthenticated ? {} : "skip"
	)

	// row === undefined => still loading; null => resolved, no backup yet.
	const initialCheckComplete = keyReady && row !== undefined

	// Blocks the settings/planner/inventory stores from writing to localStorage
	// while it's still unknown whether an authenticated pull is about to land -
	// see syncGate.ts.
	useEffect(() => {
		const pending =
			sessionStatus === "loading" ||
			(sessionStatus === "authenticated" && !initialCheckComplete)

		setInitialSyncPending(pending)
	}, [sessionStatus, initialCheckComplete])

	// Reconciles whenever a new row comes down the live query, using the same
	// rules as a manual file import.
	useEffect(() => {
		if (!keyReady || row === undefined || row === null) return
		if (restorePrompt || debounceRef.current || isReconcilingRef.current) return
		if (lastReconciledRef.current === row.lastUpdated) return

		const key = keyRef.current
		if (!key) return

		isReconcilingRef.current = true
		decryptBackupPayload(key, row.ciphertext, row.iv)
			.then((data) => {
				if (!mountedRef.current) return
				lastReconciledRef.current = row.lastUpdated

				const result = backupImport(JSON.stringify(data))

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
			})
			.catch((error) => {
				console.error("Failed to decrypt Convex backup", error)
			})
			.finally(() => {
				isReconcilingRef.current = false
			})
	}, [row, keyReady, restorePrompt])

	const upsertBackup = useMutation(api.backups.upsertBackup)

	// Encrypts and uploads local data to Convex right now, unconditionally.
	// Used both by the gated auto/manual sync path below and by the
	// restore-conflict modal, which needs an immediate, deliberate push once
	// the user has decided.
	const pushToConvex = useCallback(async () => {
		const key = keyRef.current
		if (!key) return

		setStatus("syncing")
		try {
			const payload = buildBackupPayload()
			const { ciphertext, iv } = await encryptBackupPayload(key, payload)
			const lastUpdated = Number(payload.lastUpdated) || Date.now()

			await upsertBackup({ ciphertext, iv, lastUpdated })
			lastReconciledRef.current = lastUpdated

			markSynced()
			setStatus("synced")
			setLastSyncedAt(Date.now())
			setLatestBackupUpdatedAt(lastUpdated)
		} catch (error) {
			console.error("Failed to sync backup to Convex", error)
			setStatus("error")
		}
	}, [upsertBackup])

	// First-ever sign-in for this account: no cloud backup exists yet, so
	// immediately back up whatever's on this device rather than waiting for
	// the next local edit's debounce or a manual sync click.
	useEffect(() => {
		if (!keyReady || row !== null) return
		if (restorePrompt || hasPushedInitialBackupRef.current) return

		hasPushedInitialBackupRef.current = true
		pushToConvex()
	}, [keyReady, row, restorePrompt, pushToConvex])

	useEffect(() => {
		async function runSync() {
			// Never sync before the key + initial pull have resolved, and never
			// sync while the user hasn't decided on a pending restore conflict.
			if (!initialCheckComplete || restorePrompt) return

			if (isSyncingRef.current) {
				pendingRef.current = true
				return
			}

			isSyncingRef.current = true
			await pushToConvex()
			isSyncingRef.current = false

			if (pendingRef.current) {
				pendingRef.current = false
				runSyncRef.current()
			}
		}

		runSyncRef.current = runSync
	}, [initialCheckComplete, restorePrompt, pushToConvex])

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
			// A local edit restarts the auto-push debounce, so it doesn't fire
			// mid-edit and interrupt what the user is doing.
			if (debounceRef.current) clearTimeout(debounceRef.current)
			debounceRef.current = setTimeout(() => {
				debounceRef.current = null
				runSyncRef.current()
			}, AUTO_SYNC_DEBOUNCE_MS)
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
			await pushToConvex()
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
		<CloudSyncContext.Provider
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
		</CloudSyncContext.Provider>
	)
}
