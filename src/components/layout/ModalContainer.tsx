"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect } from "react"

export type ModalEventType = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>

export default function ModalContainer({
	onClose,
	onCancel,
	children,
}: {
	onClose: (e: ModalEventType) => void
	onCancel?: (e: ModalEventType) => void
	children: ReactNode
}) {
	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			if (onCancel) {
				if (e.key === "Enter") {
					onClose(e as unknown as KeyboardEvent<HTMLElement>)
				}

				if (e.key === "Escape") {
					onCancel(e as unknown as KeyboardEvent<HTMLElement>)
				}
				return
			}

			if (e.key === "Enter" || e.key === "Escape") {
				onClose(e as unknown as KeyboardEvent<HTMLElement>)
			}
		}

		window.addEventListener("keydown", handleGlobalKeyDown)
		return () => window.removeEventListener("keydown", handleGlobalKeyDown)
	}, [onClose, onCancel])

	return (
		<div
			className={`modal-container`}
			onClick={(e) => (onCancel ? onCancel(e) : onClose(e))}>
			{children}
			<button
				className="close-btn"
				onClick={(e) => (onCancel ? onCancel(e) : onClose(e))}
			/>
			{onCancel && (
				<p
					style={{
						position: "fixed",
						bottom: "5%",
						color: "white",
						opacity: "0.5",
						fontWeight: "700",
					}}>
					Click the empty space to exit
				</p>
			)}
		</div>
	)
}
