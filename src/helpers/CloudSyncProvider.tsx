"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react"

import { api } from "@convex/_generated/api"

import {
	CloudSyncContext,
	type CloudSyncContextValue,
	useT,
} from "@/contexts"
import { AlertContainer } from "@/components/layout/Alert"
import { ModalContainer } from "@/components/layout/Modal/ModalContainer"
import { SyncConflictModal } from "@/components/layout/SyncConflictModal"
import { SyncToast } from "@/components/layout/SyncToast"

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
import {
	hasObservedUnauthenticated,
	setInitialSyncPending,
} from "./syncGate"
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

export function CloudSyncProvider({
	children,
	onStateChange,
}: {
	children?: React.ReactNode
	onStateChange?: (value: CloudSyncContextValue | null) => void
}) {
	const t = useT()
	const { data: session, status: sessionStatus } = useSession()
	const accessToken = session?.accessToken
	const convex = useConvex()
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
	const isReconcilingGachaRef = useRef(false)
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
	const hasBeenUnauthenticatedRef = useRef(hasObservedUnauthenticated())
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

	// Live metadata subscriptions; full ciphertext is fetched one-shot on demand.
	const meta = useQuery(
		api.backups.getBackupMeta,
		convexAuth.isAuthenticated ? {} : "skip"
	)

	const gachaMeta = useQuery(
		api.gachaBackups.getBackupMeta,
		convexAuth.isAuthenticated ? {} : "skip"
	)

	// React immediately when another device unlinks this account.
	useEffect(() => {
		if (meta === undefined || meta === null || meta.unlinkedAt == null) return

		// A fresh, explicit sign-in in this tab after unlink means the user chose to re-link.
		if (hasBeenUnauthenticatedRef.current) {
			if (hasClearedUnlinkRef.current) return
			hasClearedUnlinkRef.current = true
			clearUnlinked({}).catch((error) => {
				console.error("Failed to clear unlink marker", error)
			})
			return
		}

		signOut()
	}, [meta, clearUnlinked])

	// True when this specific remote revision failed to decrypt or parse.
	const remoteCorrupt = meta != null && failedRemoteRow === meta.lastUpdated

	const initialCheckComplete =
		keyReady &&
		meta !== undefined &&
		(meta === null ||
			meta.lastUpdated == null ||
			initialReconcileDone ||
			hasCorruption)

	// Blocks stores from writing while it's still unknown whether an authenticated pull is about to land
	useEffect(() => {
		const pending =
			sessionStatus === "loading" ||
			(sessionStatus === "authenticated" && !initialCheckComplete)

		setInitialSyncPending(pending)
	}, [sessionStatus, initialCheckComplete])

	// Only surface the toast while signed-in initial sync is running and no modal is open.
	const initialSyncToastState =
		sessionStatus !== "authenticated" ||
		initialCheckComplete ||
		restorePrompt ||
		hasCorruption ||
		remoteCorrupt
			? "hidden"
			: status === "error"
				? "error"
				: "syncing"

	// Fetches and reconciles main backup only when remote lastUpdated differs from ours.
	useEffect(() => {
		if (!keyReady || meta === undefined || meta === null) return
		const targetLastUpdated = meta.lastUpdated
		if (targetLastUpdated == null) return
		if (
			restorePrompt ||
			hasCorruption ||
			remoteCorrupt ||
			debounceRef.current ||
			isReconcilingRef.current
		)
			return
		if (lastReconciledRef.current === targetLastUpdated) return

		const key = keyRef.current
		if (!key) return

		isReconcilingRef.current = true
		convex
			.query(api.backups.getBackup, {})
			.then(async (row) => {
				if (!mountedRef.current) return
				if (
					!row ||
					row.ciphertext == null ||
					row.iv == null ||
					row.lastUpdated == null
				) {
					setInitialReconcileDone(true)
					return
				}

				const { ciphertext, iv, lastUpdated } = row
				try {
					const data = await decryptBackupPayload<MainBackupData>(
						key,
						ciphertext,
						iv
					)
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
				} catch (error) {
					console.error("Failed to decrypt Convex backup", error)
					setFailedRemoteRow(lastUpdated)
				} finally {
					setInitialReconcileDone(true)
				}
			})
			.catch((error) => {
				console.error("Failed to fetch Convex backup", error)
				if (mountedRef.current) setStatus("error")
			})
			.finally(() => {
				isReconcilingRef.current = false
			})
	}, [convex, meta, keyReady, restorePrompt, hasCorruption, remoteCorrupt])

	// Fetches and auto-merges decoupled gacha pulls only when remote lastUpdated changes.
	useEffect(() => {
		if (!keyReady || gachaMeta === undefined || gachaMeta === null) return
		if (
			lastReconciledGachaRef.current === gachaMeta.lastUpdated ||
			isReconcilingGachaRef.current
		)
			return

		const key = keyRef.current
		if (!key) return

		isReconcilingGachaRef.current = true
		convex
			.query(api.gachaBackups.getBackup, {})
			.then(async (gachaRow) => {
				if (!mountedRef.current || !gachaRow) return

				const data = await decryptBackupPayload<GachaBackupData>(
					key,
					gachaRow.ciphertext,
					gachaRow.iv
				)
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
			.finally(() => {
				isReconcilingGachaRef.current = false
			})
	}, [convex, gachaMeta, keyReady])

	const upsertBackup = useMutation(api.backups.upsertBackup)
	const upsertGachaBackup = useMutation(api.gachaBackups.upsertBackup)
	const deleteCloudBackup = useMutation(api.backups.deleteBackup)
	const deleteGachaBackup = useMutation(api.gachaBackups.deleteBackup)
	const markUnlinked = useMutation(api.backups.markUnlinked)

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

				// Skip the mutation when content hash matches our last confirmed payload.
				if (hash !== lastPushedMainHashRef.current) {
					const { ciphertext, iv } = await encryptBackupPayload(
						key,
						mainPayload
					)
					const prevReconciled = lastReconciledRef.current
					// Record before the mutation so our own meta update doesn't re-fetch.
					lastReconciledRef.current = lastUpdated
					try {
						await upsertBackup({ ciphertext, iv, lastUpdated })
					} catch (error) {
						lastReconciledRef.current = prevReconciled
						throw error
					}
					lastPushedMainHashRef.current = hash
				} else {
					lastReconciledRef.current = lastUpdated
				}

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
					const prevGachaReconciled = lastReconciledGachaRef.current
					lastReconciledGachaRef.current = gachaLastUpdated
					try {
						await upsertGachaBackup({
							ciphertext,
							iv,
							lastUpdated: gachaLastUpdated,
						})
					} catch (error) {
						lastReconciledGachaRef.current = prevGachaReconciled
						throw error
					}
					lastPushedGachaHashRef.current = gachaHash
				} else {
					lastReconciledGachaRef.current = gachaLastUpdated
				}
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
			meta === null ||
			meta.lastUpdated == null ||
			localLastUpdated > meta.lastUpdated
		if (!localIsAhead || hasPushedThisEpochRef.current) return

		hasPushedThisEpochRef.current = true
		pushToConvex()
	}, [
		initialCheckComplete,
		meta,
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
		const key = keyRef.current
		if (!key) return

		let row
		try {
			row = await convex.query(api.backups.getBackup, {})
		} catch (error) {
			console.error("Failed to fetch cloud backup for re-sync", error)
			setStatus("error")
			return
		}

		if (!row) return
		const { ciphertext, iv, lastUpdated } = row
		if (ciphertext == null || iv == null || lastUpdated == null) return

		try {
			const data = await decryptBackupPayload<MainBackupData>(
				key,
				ciphertext,
				iv
			)
			lastReconciledRef.current = lastUpdated
			lastPushedMainHashRef.current = await hashBackupPayload(data)
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
			t("sync.corruption.both.message")
		corruptionConfirmLabel = t("sync.corruption.eraseAndStartFresh")
		corruptionConfirmAction = () => eraseAndResync()
		corruptionCancelAction = undefined
	} else if (remoteCorrupt) {
		corruptionMessage =
			t("sync.corruption.cloud.message")
		corruptionConfirmLabel = t("sync.corruption.cloud.confirm")
		corruptionConfirmAction = () => overwriteCloudWithLocal()
		corruptionCancelAction = () => eraseAndResync()
	} else {
		// A row with only an unlink marker has no cloud content to resync from.
		const hasCloudContent = meta != null && meta.lastUpdated != null
		corruptionMessage = hasCloudContent
			? t("sync.corruption.local.messageWithCloud")
			: t("sync.corruption.local.messageNoCloud")
		corruptionConfirmLabel = hasCloudContent
			? t("sync.corruption.local.confirmResync")
			: t("sync.corruption.local.confirmErase")
		corruptionConfirmAction = hasCloudContent
			? () => resyncFromCloud()
			: () => eraseAndResync()
		corruptionCancelAction = hasCloudContent
			? () => eraseAndResync()
			: undefined
	}

	const contextValue = useMemo<CloudSyncContextValue>(
		() => ({
			status,
			lastSyncedAt,
			latestBackupUpdatedAt,
			syncNow,
			deleteCloudBackup,
			deleteGachaBackup,
			markUnlinked,
		}),
		[
			status,
			lastSyncedAt,
			latestBackupUpdatedAt,
			syncNow,
			deleteCloudBackup,
			deleteGachaBackup,
			markUnlinked,
		]
	)

	useEffect(() => {
		onStateChange?.(contextValue)
	}, [onStateChange, contextValue])

	useEffect(() => {
		return () => {
			onStateChange?.(null)
		}
	}, [onStateChange])

	const overlays = (
		<>
			<SyncToast state={initialSyncToastState} />
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
						cancelLabel={t("sync.corruption.eraseAndStartFresh")}>
						{corruptionMessage}
					</AlertContainer>
				</ModalContainer>
			)}
		</>
	)

	if (onStateChange) {
		return overlays
	}

	return (
		<CloudSyncContext.Provider value={contextValue}>
			{children}
			{overlays}
		</CloudSyncContext.Provider>
	)
}
