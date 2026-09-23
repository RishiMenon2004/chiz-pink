"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useConvexAuth, useMutation, useQuery } from "convex/react"

import { api } from "@convex/_generated/api"

import { CloudSyncContext } from "@/contexts"
import { AlertContainer } from "@/components/layout/Alert"
import { ModalContainer } from "@/components/layout/Modal"
import { SyncConflictModal } from "@/components/layout/SyncConflictModal"

import {
	backupImport,
	backupSetImport,
	backupSetMainImport,
	buildMainPayload,
	buildGachaPayload,
	eraseLocalData,
	markSynced,
} from "./backupData"
import {
	decryptBackupPayload,
	encryptBackupPayload,
	hashBackupPayload,
	type MainBackupData,
	type GachaBackupData,
} from "./backupCrypto"
import { getOrCreateBackupKey } from "./driveBackupKey"
import { setInitialSyncPending } from "./syncGate"
import { clearCorruption, useCorruptedKeys } from "./dataCorruption"
import { mergePullsRecord } from "@/hooks/useGachaStore"
import * as memoryStorage from "./storage/memoryStorage"

const AUTO_SYNC_DEBOUNCE_MS = 30000

type SyncStatus = "idle" | "syncing" | "synced" | "error"
// The one remaining conflict prompt - first sign-in on this device with
// pre-existing data on both sides. Every other case resolves silently via
// true Last-Write-Wins.
type RestorePrompt = {
	data: ReturnType<typeof backupImport>["data"]
	localLastUpdated: number | null
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
	// lastUpdated of the most recent Convex row that failed to decrypt/parse,
	// if any - the cloud backup itself being unreadable, not just local. A
	// row with a different lastUpdated is a fresh backup, so remoteCorrupt
	// (derived below, once `row` exists) naturally clears without needing an
	// explicit reset.
	const [failedRemoteRow, setFailedRemoteRow] = useState<number | null>(null)
	// Any localStorage-backed record that failed to parse (see
	// dataCorruption.ts). Blocks auto-sync until the user picks a recovery
	// path, same as restorePrompt does - we don't want to push corrupt data
	// over a good cloud backup, or pull while the user hasn't decided.
	const corruptedKeys = useCorruptedKeys()
	const hasCorruption = corruptedKeys.length > 0
	// Whether the initial reconcile against the live `row` query has
	// completed at least once since the last key epoch (sign-in/out cycle).
	const [initialReconcileDone, setInitialReconcileDone] = useState(false)

	const keyRef = useRef<CryptoKey | null>(null)
	const isSyncingRef = useRef(false)
	const isReconcilingRef = useRef(false)
	const pendingRef = useRef(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const hasStartedKeyFetchRef = useRef(false)
	// The row's lastUpdated we last reconciled or pushed - skips redundant
	// reconciliation when the live query re-fires for a write we caused.
	const lastReconciledRef = useRef<number | null>(null)
	const lastReconciledGachaRef = useRef<number | null>(null)
	// Content fingerprint (SHA-256) of whichever payload we most recently
	// confirmed matches Convex, pushed or pulled - lets pushToConvex skip the
	// actual mutation when a slice's content hasn't changed even though its
	// lastUpdated timestamp did.
	const lastPushedMainHashRef = useRef<string | null>(null)
	const lastPushedGachaHashRef = useRef<string | null>(null)
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
	// One-shot per key epoch (sign-in/out cycle) - guards the "converge"
	// effect below so it pushes local up to Convex at most once per epoch
	// instead of on every render once its condition is true.
	const hasPushedThisEpochRef = useRef(false)

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
				console.error(
					"Failed to acquire backup key from Google Drive",
					error
				)
				setStatus("error")
			})
	}, [convexAuth.isAuthenticated, accessToken])

	// Resets the keyReady gate on sign-out so a subsequent sign-in (even as
	// the same user) is forced to go through getOrCreateBackupKey again.
	// Also resets initialReconcileDone, since a new key epoch means the
	// current row (if any) hasn't been reconciled against it yet - leaving
	// this stale would let initialCheckComplete go true off last epoch's
	// reconcile before the fresh one actually runs.
	useEffect(() => {
		if (convexAuth.isLoading) return
		if (!convexAuth.isAuthenticated) {
			hasBeenUnauthenticatedRef.current = true
			hasClearedUnlinkRef.current = false
			hasStartedKeyFetchRef.current = false
			keyRef.current = null
			lastReconciledRef.current = null
			lastReconciledGachaRef.current = null
			lastPushedMainHashRef.current = null
			lastPushedGachaHashRef.current = null
			hasPushedThisEpochRef.current = false
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setKeyReady(false)
			setStatus("idle")
			setRestorePrompt(null)
			setFailedRemoteRow(null)
			setInitialReconcileDone(false)
		}
	}, [convexAuth.isLoading, convexAuth.isAuthenticated])

	const clearUnlinked = useMutation(api.backups.clearUnlinked)

	// Live subscription to the main application backup (checklist, inventory, planner, settings)
	const row = useQuery(
		api.backups.getBackup,
		convexAuth.isAuthenticated ? {} : "skip"
	)

	// Live subscription to decoupled gacha pulls backup
	const gachaRow = useQuery(
		api.gachaBackups.getBackup,
		convexAuth.isAuthenticated ? {} : "skip"
	)

	// Whether some other device unlinked this account - rides on the same
	// `row` subscription used for main sync instead of a dedicated query.
	// deleteBackup clears content on unlink but keeps the row so this marker
	// survives (see convex/backups.ts), so any signed-in device (this one
	// included) reacts to it instantly.
	useEffect(() => {
		if (row === undefined || row === null || row.unlinkedAt == null) return

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
	}, [row, clearUnlinked])

	// True when this specific row (by lastUpdated) failed to decrypt or parse
	// - the cloud backup itself is unreadable, not just local.
	const remoteCorrupt = row != null && failedRemoteRow === row.lastUpdated

	const initialCheckComplete =
		keyReady &&
		row !== undefined &&
		(row === null ||
			row.lastUpdated == null ||
			initialReconcileDone ||
			hasCorruption)

	// Blocks stores from writing while it's still unknown whether an authenticated pull is about to land
	useEffect(() => {
		const pending =
			sessionStatus === "loading" ||
			(sessionStatus === "authenticated" && !initialCheckComplete)

		setInitialSyncPending(pending)
	}, [sessionStatus, initialCheckComplete])

	// Reconciles main backup whenever a new row comes down the live query
	useEffect(() => {
		if (!keyReady || row === undefined || row === null) return
		const { ciphertext, iv, lastUpdated } = row
		if (ciphertext == null || iv == null || lastUpdated == null) return
		if (
			restorePrompt ||
			hasCorruption ||
			remoteCorrupt ||
			debounceRef.current ||
			isReconcilingRef.current
		)
			return
		if (lastReconciledRef.current === lastUpdated) return

		const key = keyRef.current
		if (!key) return

		isReconcilingRef.current = true
		decryptBackupPayload<MainBackupData>(key, ciphertext, iv)
			.then(async (data) => {
				if (!mountedRef.current) return
				lastReconciledRef.current = lastUpdated
				lastPushedMainHashRef.current = await hashBackupPayload(data)

				const result = backupImport(JSON.stringify(data))

				if (result.status === "overwrite") {
					const localLastUpdated = memoryStorage.getItem<number | null>(
						"lastUpdated",
						null
					)
					setRestorePrompt({ data: result.data, localLastUpdated })
				} else if (result.status === "newer") {
					backupSetImport(result.data)
					markSynced()
					setStatus("synced")
					setLastSyncedAt(Date.now())
					setLatestBackupUpdatedAt(
						Number(result.data.lastUpdated) || Date.now()
					)
				} else {
					// "synced"/"older": local already matches or leads under LWW.
					// Only reflect it here on an exact match - a strictly-ahead
					// local gets pushed up immediately by the converge effect
					// below, which sets this same state off the freshly-pushed value.
					const localLastUpdated = memoryStorage.getItem<number>(
						"lastUpdated",
						0
					)
					if (localLastUpdated === lastUpdated) {
						markSynced()
						setStatus("synced")
						setLastSyncedAt(Date.now())
						setLatestBackupUpdatedAt(lastUpdated)
					}
				}
			})
			.catch((error) => {
				console.error("Failed to decrypt Convex backup", error)
				setFailedRemoteRow(lastUpdated)
			})
			.finally(() => {
				isReconcilingRef.current = false
				setInitialReconcileDone(true)
			})
	}, [row, keyReady, restorePrompt, hasCorruption, remoteCorrupt])

	// Reconciles decoupled gacha pulls without modal conflicts (auto-merges by uid & signature)
	useEffect(() => {
		if (!keyReady || gachaRow === undefined || gachaRow === null) return
		if (lastReconciledGachaRef.current === gachaRow.lastUpdated) return

		const key = keyRef.current
		if (!key) return

		decryptBackupPayload<GachaBackupData>(
			key,
			gachaRow.ciphertext,
			gachaRow.iv
		)
			.then(async (data) => {
				if (!mountedRef.current) return
				lastReconciledGachaRef.current = gachaRow.lastUpdated
				lastPushedGachaHashRef.current = await hashBackupPayload(data)

				if (data.gachaPulls) {
					mergePullsRecord(data.gachaPulls)
					const localGachaLastUpdated = memoryStorage.getItem<number>(
						"gachaLastUpdated",
						0
					)
					if (gachaRow.lastUpdated > localGachaLastUpdated) {
						memoryStorage.setItem(
							"gachaLastUpdated",
							gachaRow.lastUpdated
						)
					}
				}
			})
			.catch((error) => {
				console.error("Failed to decrypt gacha backup from Convex", error)
			})
	}, [gachaRow, keyReady])

	const upsertBackup = useMutation(api.backups.upsertBackup)
	const upsertGachaBackup = useMutation(api.gachaBackups.upsertBackup)

	// Encrypts and pushes main payload and/or gacha payload to Convex
	const pushToConvex = useCallback(async () => {
		const key = keyRef.current
		if (!key) return

		setStatus("syncing")
		try {
			const localLastUpdated = memoryStorage.getItem<number>(
				"lastUpdated",
				0
			)
			const localGachaLastUpdated = memoryStorage.getItem<number>(
				"gachaLastUpdated",
				0
			)

			// Push main payload if local is newer than what we last reconciled/pushed
			if (
				lastReconciledRef.current === null ||
				localLastUpdated > lastReconciledRef.current
			) {
				const mainPayload = buildMainPayload()
				const lastUpdated = Number(mainPayload.lastUpdated) || Date.now()
				const hash = await hashBackupPayload(mainPayload)

				// Content fingerprint unchanged since the last push - skip the
				// mutation (and its bandwidth) even though lastUpdated ticked.
				if (hash !== lastPushedMainHashRef.current) {
					const { ciphertext, iv } = await encryptBackupPayload(
						key,
						mainPayload
					)
					await upsertBackup({ ciphertext, iv, lastUpdated })
					lastPushedMainHashRef.current = hash
				}

				lastReconciledRef.current = lastUpdated
				setLatestBackupUpdatedAt(lastUpdated)
			}

			// Push gacha payload if local gacha is newer than what we last reconciled/pushed
			if (
				lastReconciledGachaRef.current === null ||
				localGachaLastUpdated > lastReconciledGachaRef.current
			) {
				const gachaPayload = buildGachaPayload()
				const gachaLastUpdated =
					Number(gachaPayload.gachaLastUpdated) || Date.now()
				const gachaHash = await hashBackupPayload(gachaPayload)

				if (gachaHash !== lastPushedGachaHashRef.current) {
					const { ciphertext, iv } = await encryptBackupPayload(
						key,
						gachaPayload
					)
					await upsertGachaBackup({
						ciphertext,
						iv,
						lastUpdated: gachaLastUpdated,
					})
					lastPushedGachaHashRef.current = gachaHash
				}

				lastReconciledGachaRef.current = gachaLastUpdated
			}

			markSynced()
			setStatus("synced")
			setLastSyncedAt(Date.now())
		} catch (error) {
			console.error("Failed to sync backup to Convex", error)
			setStatus("error")
		}
	}, [upsertBackup, upsertGachaBackup])

	// True LWW's "local wins" half: once the initial reconcile against `row`
	// is done, push local up right away if it's strictly ahead of (or there's
	// no) cloud backup, instead of waiting on the next edit's debounce. One
	// push per key epoch - after this, routine edits drive pushToConvex via
	// the debounced listener below.
	useEffect(() => {
		if (
			!initialCheckComplete ||
			restorePrompt ||
			hasCorruption ||
			remoteCorrupt
		)
			return

		const localLastUpdated = memoryStorage.getItem<number>("lastUpdated", 0)
		const localIsAhead =
			row === null ||
			row.lastUpdated == null ||
			localLastUpdated > row.lastUpdated
		if (!localIsAhead || hasPushedThisEpochRef.current) return

		hasPushedThisEpochRef.current = true
		pushToConvex()
	}, [
		initialCheckComplete,
		row,
		restorePrompt,
		hasCorruption,
		remoteCorrupt,
		pushToConvex,
	])

	useEffect(() => {
		async function runSync() {
			if (
				!initialCheckComplete ||
				restorePrompt ||
				hasCorruption ||
				remoteCorrupt
			)
				return

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
	}, [
		initialCheckComplete,
		restorePrompt,
		hasCorruption,
		remoteCorrupt,
		pushToConvex,
	])

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
			debounceRef.current = setTimeout(() => {
				debounceRef.current = null
				runSyncRef.current()
			}, AUTO_SYNC_DEBOUNCE_MS)
		}

		// A 30s debounce risks losing a pending edit if the tab closes before
		// it fires - flush immediately once it looks like the user is leaving,
		// instead of waiting out the rest of the debounce window.
		const flushPending = () => {
			if (!debounceRef.current) return
			clearTimeout(debounceRef.current)
			debounceRef.current = null
			runSyncRef.current()
		}

		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") flushPending()
		}

		window.addEventListener("local-storage-update", handleChange)
		window.addEventListener("blur", flushPending)
		document.addEventListener("visibilitychange", handleVisibilityChange)

		return () => {
			window.removeEventListener("local-storage-update", handleChange)
			window.removeEventListener("blur", flushPending)
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange
			)
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
			setLatestBackupUpdatedAt(
				Number(restorePrompt.data.lastUpdated) || Date.now()
			)
		} else {
			await pushToConvex()
		}

		setRestorePrompt(null)
	}

	const overwriteCloudWithLocal = async () => {
		clearCorruption()
		setFailedRemoteRow(null)
		await pushToConvex()
	}

	const resyncFromCloud = async () => {
		if (!row) return
		const { ciphertext, iv, lastUpdated } = row
		if (ciphertext == null || iv == null || lastUpdated == null) return
		const key = keyRef.current
		if (!key) return

		try {
			const data = await decryptBackupPayload<MainBackupData>(
				key,
				ciphertext,
				iv
			)
			clearCorruption()
			setFailedRemoteRow(null)
			backupSetMainImport(data)
			markSynced()
			setStatus("synced")
			setLastSyncedAt(Date.now())
			setLatestBackupUpdatedAt(Number(data.lastUpdated) || Date.now())
		} catch (error) {
			console.error("Failed to re-sync from cloud", error)
			setFailedRemoteRow(lastUpdated)
		}
	}

	const eraseAndResync = () => {
		eraseLocalData()
		clearCorruption()
		setFailedRemoteRow(null)
		setStatus("idle")
		setLastSyncedAt(null)
		setLatestBackupUpdatedAt(null)
	}

	const bothCorrupt = hasCorruption && remoteCorrupt
	let corruptionMessage: string
	let corruptionConfirmLabel: string
	let corruptionConfirmAction: () => void
	let corruptionCancelAction: (() => void) | undefined

	if (bothCorrupt) {
		corruptionMessage =
			"Both your local data and your cloud backup couldn't be read. To continue, your data on this device will be erased to start fresh."
		corruptionConfirmLabel = "Erase & Start Fresh"
		corruptionConfirmAction = () => eraseAndResync()
		corruptionCancelAction = undefined
	} else if (remoteCorrupt) {
		corruptionMessage =
			"Your cloud backup couldn't be read and may be corrupted. Overwrite it with this device's data, or erase this device to start fresh."
		corruptionConfirmLabel = "Overwrite Cloud with Local"
		corruptionConfirmAction = () => overwriteCloudWithLocal()
		corruptionCancelAction = () => eraseAndResync()
	} else {
		// A row that exists only to carry an unlink marker (no ciphertext) has
		// nothing to resync from - treat it the same as no cloud backup.
		const hasCloudContent = row != null && row.lastUpdated != null
		corruptionMessage = hasCloudContent
			? "Some of your local data couldn't be read and may be corrupted. Restore your last cloud backup, or erase this device's copy and pull it fresh."
			: "Some of your local data couldn't be read and may be corrupted. No cloud backup is available yet, so erase this device's data to start fresh."
		corruptionConfirmLabel = hasCloudContent
			? "Resync from Cloud"
			: "Erase Local Data"
		corruptionConfirmAction = hasCloudContent
			? () => resyncFromCloud()
			: () => eraseAndResync()
		corruptionCancelAction = hasCloudContent
			? () => eraseAndResync()
			: undefined
	}

	return (
		<CloudSyncContext.Provider
			value={{ status, lastSyncedAt, latestBackupUpdatedAt, syncNow }}>
			{children}
			{restorePrompt && (
				<SyncConflictModal
					localLastUpdated={restorePrompt.localLastUpdated}
					cloudLastUpdated={
						Number(restorePrompt.data.lastUpdated) || null
					}
					onKeepLocal={() => resolveRestorePrompt("local")}
					onUseCloud={() => resolveRestorePrompt("drive")}
				/>
			)}
			{(hasCorruption || remoteCorrupt) && !restorePrompt && (
				<ModalContainer>
					<AlertContainer
						type={bothCorrupt ? "acknowledge" : "choices"}
						onConfirm={corruptionConfirmAction}
						confirmLabel={corruptionConfirmLabel}
						onCancel={corruptionCancelAction}
						cancelLabel="Erase & Start Fresh">
						{corruptionMessage}
					</AlertContainer>
				</ModalContainer>
			)}
		</CloudSyncContext.Provider>
	)
}
