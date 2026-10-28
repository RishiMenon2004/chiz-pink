"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"

import {
	backupExport,
	buildBackupPayload,
	hasLocalData,
	hasLocalPulls,
} from "@/helpers/backupData"
import {
	MIGRATE_PATH,
	MIGRATED_KEY,
	NEW_DOMAIN_LABEL,
	NEW_ORIGIN,
	isMigrationMessage,
	isOldDomain,
	type MigrationMessage,
} from "@/helpers/domainMigration"
import { useInitialSyncPending } from "@/helpers/syncGate"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

import { ModalContainer } from "../Modal/ModalContainer"

import styles from "./domainMoveGate.module.css"

// No popup handshake within this long means the opener link didn't survive
// (e.g. an installed PWA opening the popup in a separate browser).
const HANDSHAKE_TIMEOUT_MS = 15_000

// Set for the rest of the browser session once they choose to stay, so
// the prompt doesn't come back on every page load.
const STAY_KEY = "chiz-pink-stay-on-old-domain"

const noopSubscribe = () => () => {}

function hasChosenToStay() {
	try {
		return window.sessionStorage.getItem(STAY_KEY) !== null
	} catch {
		return false
	}
}

function chooseToStay() {
	try {
		window.sessionStorage.setItem(STAY_KEY, "1")
	} catch {
		// Storage blocked: they'll just be asked again next load.
	}
}

function redirectToNewDomain() {
	const { pathname, search, hash } = window.location
	window.location.replace(`${NEW_ORIGIN}${pathname}${search}${hash}`)
}

// "redirect": nothing saved here, so nothing to lose by leaving.
// "move": saved data that chiz.pink doesn't have yet - never moved, or
// edited here since the last move (a plain redirect would strand it).
// "return": already moved with nothing new since; offer to go over.
function getMode(): "redirect" | "move" | "return" {
	const migratedAt = memoryStorage.getItem<number | null>(MIGRATED_KEY, null)
	if (migratedAt === null) {
		return hasLocalData() || hasLocalPulls() ? "move" : "redirect"
	}

	const lastEdited = Math.max(
		memoryStorage.getItem<number>("lastUpdated", 0),
		memoryStorage.getItem<number>("gachaLastUpdated", 0)
	)
	return lastEdited > migratedAt ? "move" : "return"
}

/**
 * Runs only on the old Vercel domain (see helpers/domainMigration.ts):
 * redirects to chiz.pink straight away when there's nothing saved here.
 * Otherwise it asks first - move the data (or, if it was already moved,
 * just go to chiz.pink) or keep using this address.
 */
export function DomainMoveGate() {
	// Server snapshot is false, so hydration matches the server render and
	// the real check happens right after.
	const onOldDomain = useSyncExternalStore(
		noopSubscribe,
		isOldDomain,
		() => false
	)
	const syncPending = useInitialSyncPending()

	const [status, setStatus] = useState<"prompt" | "waiting" | "failed">(
		"prompt"
	)
	const [stayed, setStayed] = useState(false)
	const popupRef = useRef<Window | null>(null)

	const ready = onOldDomain && !syncPending
	const mode = ready && !stayed && !hasChosenToStay() ? getMode() : null

	useEffect(() => {
		if (mode === "redirect") redirectToNewDomain()
	}, [mode])

	useEffect(() => {
		if (status !== "waiting") return

		let handshakeDone = false
		let finished = false

		const send = (message: MigrationMessage) =>
			popupRef.current?.postMessage(message, NEW_ORIGIN)

		const handleMessage = async (e: MessageEvent) => {
			if (e.origin !== NEW_ORIGIN || e.source !== popupRef.current) return
			if (!isMigrationMessage(e.data)) return

			switch (e.data.type) {
				case "ready":
					handshakeDone = true
					send({ type: "data", payload: buildBackupPayload() })
					break
				case "done":
					finished = true
					memoryStorage.setItem(MIGRATED_KEY, Date.now())
					// Must be on disk before leaving, or the next visit would
					// offer the move again.
					await memoryStorage.flushPendingWrites()
					redirectToNewDomain()
					break
				case "error":
					finished = true
					setStatus("failed")
					break
			}
		}

		// The popup was closed before finishing: offer the move again.
		const closedCheck = setInterval(() => {
			if (!finished && popupRef.current?.closed) setStatus("prompt")
		}, 500)
		const handshakeTimeout = setTimeout(() => {
			if (!handshakeDone) setStatus("failed")
		}, HANDSHAKE_TIMEOUT_MS)

		window.addEventListener("message", handleMessage)
		return () => {
			window.removeEventListener("message", handleMessage)
			clearInterval(closedCheck)
			clearTimeout(handshakeTimeout)
		}
	}, [status])

	if (mode !== "move" && mode !== "return") return null

	const stay = () => {
		chooseToStay()
		setStayed(true)
	}

	// Opened from a click, so pop-up blockers allow it.
	const openPopup = () => {
		const popup = window.open(
			`${NEW_ORIGIN}${MIGRATE_PATH}`,
			"chiz-pink-migrate",
			"popup,width=480,height=640"
		)
		if (!popup) {
			setStatus("failed")
			return
		}
		popupRef.current = popup
		setStatus("waiting")
	}

	const body = {
		prompt:
			mode === "return"
				? "Your data has already moved to chiz.pink. Head over there, or keep using this address."
				: memoryStorage.hasItem(MIGRATED_KEY)
					? "You've made changes here since moving. Bring them along to chiz.pink, or keep using this address."
					: "Your data is still saved at the old address. Bring it along to pick up right where you left off, or keep using this address.",
		waiting: "Finish up in the chiz.pink window that just opened.",
		failed: "Couldn't move your data automatically. Try again (allow pop-ups if asked), or download a backup and import it from Settings on chiz.pink.",
	}[status]

	return (
		<ModalContainer>
			<div
				className={`metallic-panel ${styles.card}`}
				role="dialog"
				aria-modal="true"
				aria-labelledby="domain-move-title">
				<Image
					className={styles.icon}
					src="/app_icon.png"
					alt=""
					width={72}
					height={72}
				/>
				<h2 id="domain-move-title" className={styles.title}>
					{"We've moved!"}
				</h2>
				<div className={styles.addresses} aria-hidden="true">
					<span className={`inset-control ${styles.oldAddress}`}>
						{window.location.host}
					</span>
					<span className={styles.arrow} />
					<span className={`inset-control ${styles.newAddress}`}>
						{NEW_DOMAIN_LABEL}
					</span>
				</div>
				<p className={styles.body}>{body}</p>
				<div className={styles.actions}>
					{status !== "waiting" && (
						<button
							type="button"
							className="pill-button"
							onClick={stay}>
							STAY HERE
						</button>
					)}
					{status === "failed" && (
						<button
							type="button"
							className="pill-button"
							onClick={backupExport}>
							DOWNLOAD BACKUP
						</button>
					)}
					<button
						type="button"
						className="pill-button"
						autoFocus
						onClick={mode === "return" ? redirectToNewDomain : openPopup}>
						{mode === "return"
							? `GO TO ${NEW_DOMAIN_LABEL.toUpperCase()}`
							: {
									prompt: "MOVE MY DATA",
									waiting: "REOPEN WINDOW",
									failed: "TRY AGAIN",
								}[status]}
					</button>
				</div>
			</div>
		</ModalContainer>
	)
}
