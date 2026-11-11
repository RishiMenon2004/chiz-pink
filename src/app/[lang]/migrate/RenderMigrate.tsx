"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import type { MessageKey } from "@/types/messages"
import type { BackupData } from "@/types/settings"

import { useLocale, useT } from "@/contexts"

import {
	backupImport,
	backupSetMainImport,
	hasLocalData,
	mergeImportedPulls,
} from "@/helpers/backupData"
import {
	getOldOrigins,
	isOldOrigin,
	isMigrationMessage,
	type MigrationMessage,
} from "@/helpers/domainMigration"
import { formatLocale, type Locale } from "@/helpers/locale"
import { useInitialSyncPending } from "@/helpers/syncGate"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

import { AlertContainer, LocaleLink, ModalContainer } from "@/components/layout"
import {
	alertTextBox,
	alertTextColumns,
} from "@/components/layout/Alert/AlertContainer"

import styles from "./migrate.module.css"

type Status = "connecting" | "conflict" | "saving" | "done" | "error"

const noopSubscribe = () => () => {}

function formatTimestamp(value: number | null, unknown: string, locale: Locale) {
	if (value == null) return unknown
	// English keeps the browser's own date format.
	return new Date(value).toLocaleString(formatLocale(locale), {
		dateStyle: "medium",
		timeStyle: "short",
	})
}

function send(message: MigrationMessage, origin: string) {
	window.opener?.postMessage(message, origin)
}

const STATUS_TEXT = {
	connecting: "migrate.status.connecting",
	saving: "migrate.status.saving",
	done: "migrate.status.done",
	error: "migrate.status.error",
} as const satisfies Record<Exclude<Status, "conflict">, MessageKey>

/**
 * The chiz.pink side of the domain move (see helpers/domainMigration.ts):
 * opened as a popup by the old domain, which sends its saved data here.
 */
export function RenderMigrate() {
	const t = useT()
	const locale = useLocale()
	// false: opened directly (not as the old domain's popup), so there's
	// nothing to receive. null until hydrated - useInitialSyncPending() also
	// reports the server's "not pending" during hydration, so starting then
	// would run before local storage has loaded.
	const hasOpener = useSyncExternalStore<boolean | null>(
		noopSubscribe,
		() => window.opener !== null,
		() => null
	)
	const syncPending = useInitialSyncPending()

	const [status, setStatus] = useState<Status>("connecting")
	const [incoming, setIncoming] = useState<BackupData | null>(null)
	// The old domain answers every "ready" with the data; only act on it once.
	const receivedRef = useRef(false)
	// Which old address sent the data - replies go only there.
	const openerOriginRef = useRef<string | null>(null)

	// Pull history is always merged, whichever main data is kept - unlike
	// main data, both sides' pulls can be combined without losing any.
	const finish = async (data: BackupData, useIncomingMain: boolean) => {
		setStatus("saving")
		if (useIncomingMain) backupSetMainImport(data)
		mergeImportedPulls(data)
		// The window closes next - unsaved writes would be lost with it.
		await memoryStorage.flushPendingWrites()
		if (openerOriginRef.current) {
			send({ type: "done" }, openerOriginRef.current)
		}
		setStatus("done")
		window.close()
	}

	useEffect(() => {
		if (hasOpener !== true || syncPending) return

		const handleMessage = (e: MessageEvent) => {
			if (!isOldOrigin(e.origin) || e.source !== window.opener) return
			if (!isMigrationMessage(e.data) || e.data.type !== "data") return
			if (receivedRef.current) return
			receivedRef.current = true
			openerOriginRef.current = e.origin

			// Same validation as a manual backup file import.
			const { status: importStatus, data } = backupImport(
				JSON.stringify(e.data.payload)
			)

			if (importStatus === "error") {
				send({ type: "error" }, e.origin)
				setStatus("error")
			} else if (importStatus === "synced") {
				void finish(data, false)
			} else if (!hasLocalData()) {
				void finish(data, true)
			} else {
				// chiz.pink already has its own main data: let them choose.
				setIncoming(data)
				setStatus("conflict")
			}
		}

		window.addEventListener("message", handleMessage)
		// The opener's address isn't readable cross-origin, so offer "ready"
		// to each old address; the browser only delivers the one that matches.
		for (const origin of getOldOrigins()) send({ type: "ready" }, origin)
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
				<p className={styles.migrateTitle}>{t("migrate.title")}</p>
				<p className={styles.migrateDescription}>
					{hasOpener === false ? (
						<>
							{t.rich("migrate.nothingToMove", {
								link: (text) => (
									<LocaleLink className="btn-anchor" href="/">
										{text}
									</LocaleLink>
								),
							})}
						</>
					) : status === "conflict" ? (
						t(STATUS_TEXT.connecting)
					) : (
						t(STATUS_TEXT[status])
					)}
				</p>
			</span>

			{status === "conflict" && incoming && (
				<ModalContainer>
					<AlertContainer
						type="choices"
						onConfirm={() => void finish(incoming, true)}
						confirmLabel={t("migrate.conflict.useOld")}
						onCancel={() => void finish(incoming, false)}
						cancelLabel={t("migrate.conflict.keepCurrent")}>
						{t("migrate.conflict.message")}
						<div className={alertTextColumns}>
							<div className={`inset-control ${alertTextBox}`}>
								<b>
									{incomingIsNewer
										? t("migrate.conflict.current")
										: t("migrate.conflict.currentNewer")}
								</b>
								<p>
									{formatTimestamp(
										localLastUpdated,
										t("migrate.conflict.unknown"),
										locale,
									)}
								</p>
							</div>
							<div className={`inset-control ${alertTextBox}`}>
								<b>
									{incomingIsNewer
										? t("migrate.conflict.oldNewer")
										: t("migrate.conflict.old")}
								</b>
								<p>
									{formatTimestamp(
										incoming.lastUpdated,
										t("migrate.conflict.unknown"),
										locale,
									)}
								</p>
							</div>
						</div>
					</AlertContainer>
				</ModalContainer>
			)}
		</main>
	)
}
