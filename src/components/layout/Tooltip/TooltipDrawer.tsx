"use client"

import { ReactNode, useCallback, useEffect, useState } from "react"

export function TooltipDrawer({
	subtext,
	onClose,
	children,
}: {
	subtext?: string
	onClose: () => void
	children: ReactNode
}) {
	const [isVisible, setVisible] = useState(false)

	useEffect(() => {
		const mount = setTimeout(() => setVisible(true), 10)
		return () => clearTimeout(mount)
	}, [])

	const handleClose = useCallback(() => {
		setVisible(false)
		setTimeout(onClose, 200)
	}, [onClose])

	useEffect(() => {
		const handleKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key === "Escape") handleClose()
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [handleClose])

	return (
		<div
			className={`tooltip-drawer-backdrop no-body-scroll ${isVisible ? "visible" : ""}`}
			onClick={handleClose}>
			<div
				className="tooltip-drawer"
				onClick={(e) => e.stopPropagation()}>
				<div className="tooltip-drawer-handle" />
				{children}
				{subtext && <div className="subtext">{subtext}</div>}
			</div>
		</div>
	)
}
