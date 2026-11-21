"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

import { useT } from "@/contexts"

import type { Pull } from "./pullsGrouping"

import styles from "./pullsListSection.module.css"

// Right-click menu for a pull row: Edit, and Delete for manual pulls.
export function PullMenu({
	pull,
	x,
	y,
	onEdit,
	onDelete,
	onClose,
}: {
	pull: Pull
	x: number
	y: number
	onEdit: () => void
	onDelete: () => void
	onClose: () => void
}) {
	const t = useT()
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			if (!menuRef.current?.contains(e.target as Node)) onClose()
		}
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}
		document.addEventListener("pointerdown", onPointerDown)
		window.addEventListener("keydown", onKeyDown)
		window.addEventListener("scroll", onClose, true)
		menuRef.current?.querySelector("button")?.focus()
		return () => {
			document.removeEventListener("pointerdown", onPointerDown)
			window.removeEventListener("keydown", onKeyDown)
			window.removeEventListener("scroll", onClose, true)
		}
	}, [onClose])

	return createPortal(
		<div
			ref={menuRef}
			role="menu"
			className={styles.pullMenu}
			style={{
				left: Math.min(x, window.innerWidth - 176),
				top: Math.min(y, window.innerHeight - 96),
			}}>
			<button type="button" role="menuitem" className={styles.pullMenuItem} onClick={onEdit}>
				{t("pulls.manual.edit")}
			</button>
			{pull.manual && (
				<button
					type="button"
					role="menuitem"
					className={styles.pullMenuItem}
					data-variant="danger"
					onClick={() => {
						onClose()
						onDelete()
					}}>
					{t("pulls.manual.deleteButton")}
				</button>
			)}
		</div>,
		document.body
	)
}
