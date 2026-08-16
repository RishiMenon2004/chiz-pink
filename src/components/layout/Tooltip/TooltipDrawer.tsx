"use client"

import { ReactNode, useEffect, useState } from "react"

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

	const handleClose = () => {
		setVisible(false)
		setTimeout(onClose, 200)
	}

	useEffect(() => {
		const handleKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key === "Escape") handleClose()
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
