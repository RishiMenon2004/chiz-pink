"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect } from "react"

export default function ModalContainer({ onClose, children }: { onClose: (e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void, children: ReactNode }) {
	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === "Escape") {
				onClose(e as unknown as KeyboardEvent<HTMLElement>)
			}
		};

		window.addEventListener("keydown", handleGlobalKeyDown)
		return () => window.removeEventListener("keydown", handleGlobalKeyDown)
	}, [onClose])

	return (
		<div className="modal-container" onClick={(e) => onClose(e)}>
			{children}
			<button className="close-btn" onClick={(e) => onClose(e)} />
		</div>
	)
}