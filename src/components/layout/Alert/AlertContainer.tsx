"use client"

import { MouseEvent, ReactNode, useEffect, useRef } from "react"

import { ModalEventType } from "@/types"

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
	onConfirm: ((e: MouseEvent) => void) | ((e: ModalEventType) => void)
	onCancel?: ((e: MouseEvent) => void) | ((e: ModalEventType) => void)
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

	return (
		<div
			ref={containerRef}
			className={`metallic-panel ${styles.alertBox}`}
			onClick={(e) => e.stopPropagation()}>
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
