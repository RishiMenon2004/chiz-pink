"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect } from "react"

export type KeyMouseEventType = MouseEvent | KeyboardEvent

type ModalContainerType = {
	onClickOut?: (e: KeyMouseEventType) => void
	children: ReactNode
}

export function ModalContainer({ onClickOut, children }: ModalContainerType) {
	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key === "Escape" && onClickOut) {
				onClickOut(e as unknown as KeyboardEvent<HTMLElement>)
			}
		}

		window.addEventListener("keydown", handleGlobalKeyDown)
		return () => window.removeEventListener("keydown", handleGlobalKeyDown)
	}, [onClickOut])

	return (
		<div
			className="modal-container no-body-scroll"
			onClick={onClickOut ? (e) => onClickOut(e) : undefined}>
			{children}

			{onClickOut && (
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
