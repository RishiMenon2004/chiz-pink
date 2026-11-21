"use client"

import dynamic from "next/dynamic"
import { type ReactNode, useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

import { useCorruptedKeys } from "@/helpers/dataCorruption"
import { useStorageWriteError } from "@/helpers/storage/storageError"
import {
	markSessionUnauthenticated,
	setInitialSyncPending,
} from "@/helpers/syncGate"

import { CloudSyncContext, type CloudSyncContextValue } from "@/contexts"

import { SyncErrorBoundary } from "./SyncErrorBoundary"

const ActiveCloudSync = dynamic(
	() => import("./ActiveCloudSync").then((mod) => mod.ActiveCloudSync),
	{ ssr: false }
)

const LocalCorruptionModal = dynamic(
	() =>
		import("./LocalCorruptionModal").then((mod) => mod.LocalCorruptionModal),
	{ ssr: false }
)

const StorageWriteErrorModal = dynamic(
	() =>
		import("./StorageWriteErrorModal").then(
			(mod) => mod.StorageWriteErrorModal
		),
	{ ssr: false }
)

const unavailableMutation = async () => {
	throw new Error("Cloud sync is not available.")
}

const IDLE_SYNC_CONTEXT: CloudSyncContextValue = {
	status: "idle",
	lastSyncedAt: null,
	latestBackupUpdatedAt: null,
	syncNow: () => {},
	deleteCloudBackup: unavailableMutation,
	deleteGachaBackup: unavailableMutation,
	markUnlinked: unavailableMutation,
}

const ERROR_SYNC_CONTEXT: CloudSyncContextValue = {
	status: "error",
	lastSyncedAt: null,
	latestBackupUpdatedAt: null,
	syncNow: () => {
		console.warn("Cloud sync is unavailable due to an error.")
	},
	deleteCloudBackup: unavailableMutation,
	deleteGachaBackup: unavailableMutation,
	markUnlinked: unavailableMutation,
}

// Mounts Convex and CloudSyncProvider only for signed-in visitors.
export function CloudSyncGate({ children }: { children: ReactNode }) {
	const { status: sessionStatus } = useSession()
	const corruptedKeys = useCorruptedKeys()
	const hasStorageWriteError = useStorageWriteError()
	const [activeContext, setActiveContext] =
		useState<CloudSyncContextValue | null>(null)
	const [syncFailed, setSyncFailed] = useState(false)
	const [prevSessionStatus, setPrevSessionStatus] = useState(sessionStatus)

	if (prevSessionStatus !== sessionStatus) {
		setPrevSessionStatus(sessionStatus)
		if (sessionStatus === "unauthenticated") {
			setSyncFailed(false)
			setActiveContext(null)
		}
	}

	useEffect(() => {
		if (sessionStatus === "unauthenticated") {
			markSessionUnauthenticated()
			setInitialSyncPending(false)
			return
		}
		if (sessionStatus === "loading") {
			setInitialSyncPending(true)
			return
		}
		// Keep the write gate closed while ActiveCloudSync loads; clear on crash.
		setInitialSyncPending(!syncFailed)
	}, [sessionStatus, syncFailed])

	const handleSyncError = useCallback(() => {
		setSyncFailed(true)
		setInitialSyncPending(false)
	}, [])

	const isAuthenticated = sessionStatus === "authenticated"
	const value = syncFailed
		? ERROR_SYNC_CONTEXT
		: isAuthenticated
			? (activeContext ?? IDLE_SYNC_CONTEXT)
			: IDLE_SYNC_CONTEXT

	return (
		<CloudSyncContext.Provider value={value}>
			{children}
			{isAuthenticated && !syncFailed && (
				<SyncErrorBoundary onError={handleSyncError}>
					<ActiveCloudSync onStateChange={setActiveContext} />
				</SyncErrorBoundary>
			)}
			{!isAuthenticated && corruptedKeys.length > 0 && (
				<LocalCorruptionModal />
			)}
			{hasStorageWriteError && <StorageWriteErrorModal />}
		</CloudSyncContext.Provider>
	)
}
