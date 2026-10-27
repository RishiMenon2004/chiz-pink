"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"

import type { BackupData } from "@/types/settings"

import {
	backupImport,
	backupSetImport,
	hasLocalData,
	hasLocalPulls,
} from "@/helpers/backupData"
import {
	OLD_ORIGIN,
	isMigrationMessage,
	type MigrationMessage,
} from "@/helpers/domainMigration"
import { useInitialSyncPending } from "@/helpers/syncGate"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

import { AlertContainer, ModalContainer } from "@/components/layout"
import {
	alertTextBox,
	alertTextColumns,
} from "@/components/layout/Alert/AlertContainer"

import styles from "./migrate.module.css"

type Status = "connecting" | "conflict" | "saving" | "done" | "error"

const noopSubscribe = () => () => {}

function formatTimestamp(value: number | null) {
	if (value == null) return "Unknown"
	return new Date(value).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	})
}

function send(message: MigrationMessage) {
	window.opener?.postMessage(message, OLD_ORIGIN)
}

const STATUS_TEXT: Record<Exclude<Status, "conflict">, string> = {
	connecting: "Bringing your data over...",
	saving: "Saving...",
	done: "All moved! You can close this window.",
	error: "Something went wrong moving your data. Close this window and try again.",
}

/**
 * The chiz.pink side of the domain move (see helpers/domainMigration.ts):
 * opened as a popup by the old domain, which sends its saved data here.
 */
export function RenderMigrate() {
	// Opened directly (not as the old domain's popup): nothing to receive.
	const hasOpener = useSyncExternalStore(
		noopSubscribe,
		() => window.opener !== null,
		() => true
	)
	const syncPending = useInitialSyncPending()

	const [status, setStatus] = useState<Status>("connecting")
	const [incoming, setIncoming] = useState<BackupData | null>(null)
	const startedRef = useRef(false)

	const finish = async (data: BackupData | null) => {
		setStatus("saving")
		if (data) backupSetImport(data)
		// The window closes next - unsaved writes would be lost with it.
		await memoryStorage.flushPendingWrites()
		send({ type: "done" })
		setStatus("done")
		window.close()
	}

	useEffect(() => {
		if (!hasOpener || syncPending || startedRef.current) return
		startedRef.current = true

		const handleMessage = (e: MessageEvent) => {
			if (e.origin !== OLD_ORIGIN || e.source !== window.opener) return
			if (!isMigrationMessage(e.data) || e.data.type !== "data") return

			// Same validation as a manual backup file import.
			const { status: importStatus, data } = backupImport(
				JSON.stringify(e.data.payload)
			)

			if (importStatus === "error") {
				send({ type: "error" })
				setStatus("error")
			} else if (importStatus === "synced") {
				void finish(null)
			} else if (!hasLocalData() && !hasLocalPulls()) {
				void finish(data)
			} else {
				// chiz.pink already has its own data: let them choose.
				setIncoming(data)
				setStatus("conflict")
			}
		}

		window.addEventListener("message", handleMessage)
		send({ type: "ready" })
		return () => window.removeEventListener("message", handleMessage)
	}, [hasOpener, syncPending])

	const localLastUpdated = memoryStorage.getItem<number | null>(
		"lastUpdated",
		null
	)
	const incomingIsNewer =
		incoming !== null && incoming.lastUpdated > (localLastUpdated ?? 0)

	return (
		<main className={`page ${styles.migrateMain}`} role="main">
			<span className={styles.migrateCard}>
				<p className={styles.migrateTitle}>Moving to chiz.pink</p>
				<p className={styles.migrateDescription}>
					{!hasOpener ? (
						<>
							{"There's nothing to move here. "}
							<Link className="btn-anchor" href="/">
								Go home
							</Link>
						</>
					) : status === "conflict" ? (
						STATUS_TEXT.connecting
					) : (
						STATUS_TEXT[status]
					)}
				</p>
			</span>

			{status === "conflict" && incoming && (
				<ModalContainer>
					<AlertContainer
						type="choices"
						onConfirm={() => void finish(incoming)}
						confirmLabel="Use old data"
						onCancel={() => void finish(null)}
						cancelLabel="Keep chiz.pink data">
						{
							"chiz.pink already has saved data. Which version would you like to keep?"
						}
						<div className={alertTextColumns}>
							<div className={`inset-control ${alertTextBox}`}>
								<b>
									{`chiz.pink${incomingIsNewer ? "" : " (newer)"}`}
								</b>
								<p>{formatTimestamp(localLastUpdated)}</p>
							</div>
							<div className={`inset-control ${alertTextBox}`}>
								<b>
									{`Old address${incomingIsNewer ? " (newer)" : ""}`}
								</b>
								<p>{formatTimestamp(incoming.lastUpdated)}</p>
							</div>
						</div>
					</AlertContainer>
				</ModalContainer>
			)}
		</main>
	)
}
