"use client"

import {
	CSSProperties,
	ReactNode,
	RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react"
import { createPortal } from "react-dom"

import styles from "./manualPullEntry.module.css"

// Room kept between a panel and the window's edges.
const EDGE = 8

// A dropdown floating over the page under its anchor (above it when there's
// no room below), kept within the window sideways. It closes on a press
// outside it and its anchor, and on Escape (before anything around it
// does). It follows its anchor when the page scrolls or the window resizes
// rather than closing: on touch devices, focusing a text box brings up the
// keyboard and scrolls the page, which would close it as it opened.
export function FloatingPanel({
	anchorRef,
	onClose,
	matchWidth = false,
	id,
	role,
	label,
	className,
	children,
}: {
	anchorRef: RefObject<HTMLElement | null>
	onClose: () => void
	// At least as wide as the anchor.
	matchWidth?: boolean
	id?: string
	role?: string
	label?: string
	className?: string
	children: ReactNode
}) {
	const panelRef = useRef<HTMLDivElement>(null)
	const [place, setPlace] = useState<CSSProperties | null>(null)

	// Placed again whenever the panel changes size (a search narrowing the
	// grid) or its anchor moves, so it stays against it.
	useLayoutEffect(() => {
		const panel = panelRef.current
		if (!panel) return
		const position = () => {
			const anchor = anchorRef.current?.getBoundingClientRect()
			if (!anchor) return
			const minWidth = matchWidth ? anchor.width : 0
			panel.style.minWidth = `${minWidth}px`
			const { width, height } = panel.getBoundingClientRect()

			const below = anchor.bottom + 4
			const top =
				below + height > window.innerHeight - EDGE
					? Math.max(EDGE, anchor.top - 4 - height)
					: below
			const left = Math.min(Math.max(EDGE, anchor.left), window.innerWidth - EDGE - width)
			setPlace({ top, left, minWidth })
		}
		position()
		const observer = new ResizeObserver(position)
		observer.observe(panel)
		// Scrolls inside the panel (the item grid) don't move it.
		const onScroll = (e: Event) => {
			if (!(e.target instanceof Node && panel.contains(e.target))) position()
		}
		const viewport = window.visualViewport
		window.addEventListener("scroll", onScroll, true)
		window.addEventListener("resize", position)
		viewport?.addEventListener("resize", position)
		return () => {
			observer.disconnect()
			window.removeEventListener("scroll", onScroll, true)
			window.removeEventListener("resize", position)
			viewport?.removeEventListener("resize", position)
		}
	}, [anchorRef, matchWidth])

	useEffect(() => {
		const inside = (target: EventTarget | null) =>
			target instanceof Node &&
			(panelRef.current?.contains(target) || anchorRef.current?.contains(target))
		const onPointerDown = (e: PointerEvent) => {
			if (!inside(e.target)) onClose()
		}
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return
			e.stopImmediatePropagation()
			onClose()
			anchorRef.current?.focus()
		}
		document.addEventListener("pointerdown", onPointerDown)
		window.addEventListener("keydown", onKeyDown, true)
		return () => {
			document.removeEventListener("pointerdown", onPointerDown)
			window.removeEventListener("keydown", onKeyDown, true)
		}
	}, [anchorRef, onClose])

	return createPortal(
		<div
			ref={panelRef}
			id={id}
			role={role}
			aria-label={label}
			className={`${styles.floating} ${className ?? ""}`}
			style={place ?? { visibility: "hidden" }}
			// Presses here reach the panel only: React would otherwise pass
			// them up to what it's drawn from (a modal reading a press as
			// outside it, say), though it floats elsewhere on the page.
			onPointerDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}>
			{children}
		</div>,
		document.body
	)
}
