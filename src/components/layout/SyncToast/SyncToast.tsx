"use client"

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react"

import { useT } from "@/contexts"

import styles from "./syncToast.module.css"

// Fast syncs finish before this, so the toast never flashes on screen.
const SHOW_DELAY_MS = 400

type SyncToastState = "hidden" | "syncing" | "error"

const noopSubscribe = () => () => {}

// Dev-only preview, since cloud sync doesn't run locally:
// ?syncToast=syncing or ?syncToast=error forces that state.
function getDevOverride(): SyncToastState | null {
	if (process.env.NODE_ENV !== "development") return null
	const value = new URLSearchParams(window.location.search).get("syncToast")
	return value === "syncing" || value === "error" ? value : null
}

// Shown while the first cloud pull after sign-in/load is in flight, which
// is the window where every store's isInitialSyncPending() check drops
// edits. "error" means the gate never opened (e.g. the backup key fetch
// failed), so edits stay paused until a reload.
export function SyncToast({ state: realState }: { state: SyncToastState }) {
	const t = useT()
	const devOverride = useSyncExternalStore(
		noopSubscribe,
		getDevOverride,
		() => null
	)
	const state = devOverride ?? realState
	const [delayPassed, setDelayPassed] = useState(false)

	useEffect(() => {
		if (state === "hidden") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setDelayPassed(false)
			return
		}
		const timer = setTimeout(() => setDelayPassed(true), SHOW_DELAY_MS)
		return () => clearTimeout(timer)
	}, [state])

	const visible = state !== "hidden" && (delayPassed || state === "error")
	const messageRef = useRef<HTMLSpanElement>(null)

	// Wrapped text keeps the width it would need on one line, leaving a gap
	// on the right of the panel. Shrink the message to its longest wrapped
	// line so the panel hugs the text. Re-measured on resize and once web
	// fonts load, since either changes where the lines break.
	useLayoutEffect(() => {
		const message = messageRef.current
		if (!message) return

		function fitToText() {
			if (!message) return
			message.style.width = ""
			const range = document.createRange()
			range.selectNodeContents(message)
			const left = message.getBoundingClientRect().left
			let widest = 0
			for (const rect of range.getClientRects()) {
				widest = Math.max(widest, rect.right - left)
			}
			if (widest > 0) message.style.width = `${Math.ceil(widest)}px`
		}

		fitToText()
		let cancelled = false
		document.fonts.ready.then(() => {
			if (!cancelled) fitToText()
		})
		window.addEventListener("resize", fitToText)
		return () => {
			cancelled = true
			window.removeEventListener("resize", fitToText)
		}
	}, [visible, state])

	return (
		<div
			className={`metallic-panel ${styles.syncToast}`}
			data-visible={visible}
			data-state={state}
			role="status"
			aria-live="polite">
			{visible && (
				<>
					{/* Mirrors the Cloud Backup status pill in settings. */}
					<span className={styles.statusLabel}>
						{t(
							state === "error"
								? "settings.shared.syncStatus.error"
								: "settings.shared.syncStatus.syncing"
						).toUpperCase()}
					</span>
					<span ref={messageRef} className={styles.message}>
						{t(
							state === "error"
								? "sync.initialToast.errorMessage"
								: "sync.initialToast.message"
						)}
					</span>
				</>
			)}
		</div>
	)
}
