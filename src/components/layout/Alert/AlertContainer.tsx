"use client"

import { KeyboardEvent, ReactNode, useEffect, useRef } from "react"

import { KeyMouseEventType } from "@/types"

import { stopPropogation } from "@/helpers"

import styles from "./alertContainer.module.css"

export function AlertContainer({
	type,
	onConfirm,
	onCancel,
	confirmLabel = "YES",
	cancelLabel = "NO",
	children,
}: {
	type:
		| "acknowledge"
		| "confirm"
		| "dangerous-confirm"
		| "choices"
		| "dangerous-choices"
	onConfirm: (e: KeyMouseEventType) => void
	onCancel?: (e: KeyMouseEventType) => void
	confirmLabel?: string
	cancelLabel?: string
	isConfirmDanger?: boolean
	children: ReactNode
}) {
	const containerRef = useRef<HTMLDivElement>(null)

	let buttonTypes: ("normal" | "danger")[] = ["normal", "normal"]

	if (type === "dangerous-confirm") {
		buttonTypes = [buttonTypes[0], "danger"]
	}

	if (type === "dangerous-choices") {
		buttonTypes = ["danger", "danger"]
	}

	useEffect(() => {
		const container = containerRef.current
		const target =
			container?.querySelector<HTMLButtonElement>("#cancel") ??
			container?.querySelector<HTMLButtonElement>("#confirm")
		target?.focus()
	}, [])

	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			if (onCancel) {
				if (e.key === "Enter") {
					onConfirm(e as unknown as KeyboardEvent<HTMLElement>)
				}

				if (e.key === "Escape") {
					onCancel(e as unknown as KeyboardEvent<HTMLElement>)
				}
				return
			}

			if (e.key === "Enter" || e.key === "Escape") {
				onConfirm(e as unknown as KeyboardEvent<HTMLElement>)
			}
		}

		window.addEventListener("keydown", handleGlobalKeyDown)
		return () => window.removeEventListener("keydown", handleGlobalKeyDown)
	}, [onConfirm, onCancel])

	return (
		<div
			ref={containerRef}
			className={`metallic-panel ${styles.alertBox}`}
			onClick={stopPropogation}>
			<div>{children}</div>
			<div className={styles.alertBoxButtons}>
				{type !== "acknowledge" && (
					<button
						className="pill-button"
						id="cancel"
						onClick={onCancel}
						data-variant={buttonTypes[0]}>
						{cancelLabel.toUpperCase()}
					</button>
				)}
				<button
					className="pill-button"
					id="confirm"
					onClick={onConfirm}
					data-variant={buttonTypes[1]}>
					{confirmLabel.toUpperCase()}
				</button>
			</div>
		</div>
	)
}
