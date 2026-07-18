import { MouseEvent, ReactNode } from "react"

import { ModalEventType } from "@/types"

import styles from "./alertContainer.module.css"

export function AlertContainer({
	type,
	onConfirm,
	onCancel,
	children,
}: {
	type: "yes" | "yes-no"
	onConfirm: ((e: MouseEvent) => void) | ((e: ModalEventType) => void)
	onCancel?: ((e: MouseEvent) => void) | ((e: ModalEventType) => void)
	children: ReactNode
}) {
	return (
		<div className={styles.alertBox}>
			<div>{children}</div>
			<div className={styles.alertBoxButtons}>
				{type === "yes-no" && (
					<button tabIndex={1} onClick={onCancel}>
						NO
					</button>
				)}
				<button tabIndex={1} onClick={onConfirm}>
					YES
				</button>
			</div>
		</div>
	)
}
