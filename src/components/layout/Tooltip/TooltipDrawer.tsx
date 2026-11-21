"use client"

import { ReactNode, useCallback, useEffect, useRef, useState } from "react"

const CLOSE_DISTANCE_PX = 100
const CLOSE_RATIO = 0.3
const FLICK_VELOCITY_PX_PER_MS = 0.4
const FLICK_MIN_DISTANCE_PX = 24
const FLICK_MAX_IDLE_MS = 80
const DRAG_START_SLOP_PX = 6

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
	const backdropRef = useRef<HTMLDivElement>(null)
	const drawerRef = useRef<HTMLDivElement>(null)
	const closingRef = useRef(false)

	useEffect(() => {
		const mount = setTimeout(() => setVisible(true), 10)
		return () => clearTimeout(mount)
	}, [])

	const handleClose = useCallback(() => {
		if (closingRef.current) return
		closingRef.current = true
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

	useEffect(() => {
		const drawer = drawerRef.current
		const backdrop = backdropRef.current
		if (!drawer || !backdrop) return

		type DragState = {
			startX: number
			startY: number
			lastY: number
			lastTime: number
			velocity: number
			dragging: boolean
			lockedOut: boolean
		}

		let drag: DragState | null = null

		const begin = (x: number, y: number) => {
			if (closingRef.current || drawer.scrollTop > 0) return
			drag = {
				startX: x,
				startY: y,
				lastY: y,
				lastTime: performance.now(),
				velocity: 0,
				dragging: false,
				lockedOut: false,
			}
		}

		const move = (x: number, y: number, preventDefault?: () => void) => {
			if (!drag || drag.lockedOut) return

			const dx = x - drag.startX
			const dy = y - drag.startY

			if (!drag.dragging) {
				if (Math.hypot(dx, dy) < DRAG_START_SLOP_PX) return
				// Only claim downward vertical drags when scrolled to the top.
				if (dy <= 0 || Math.abs(dx) > dy || drawer.scrollTop > 0) {
					drag.lockedOut = true
					return
				}
				drag.dragging = true
				drawer.style.transition = "none"
				backdrop.style.transition = "none"
			}

			preventDefault?.()

			const now = performance.now()
			const dt = now - drag.lastTime
			if (dt > 0) {
				drag.velocity = (y - drag.lastY) / dt
				drag.lastY = y
				drag.lastTime = now
			}

			const offset = Math.max(0, dy)
			drawer.style.transform = `translateY(${offset}px)`

			const height = drawer.offsetHeight || 1
			const progress = Math.min(offset / height, 1)
			backdrop.style.opacity = String(1 - progress * 0.6)
		}

		const end = (y: number) => {
			if (!drag) return
			const state = drag
			drag = null

			if (!state.dragging) return

			const offset = Math.max(0, y - state.startY)
			const height = drawer.offsetHeight || 1
			const threshold = Math.min(height * CLOSE_RATIO, CLOSE_DISTANCE_PX)
			const recentVelocity =
				performance.now() - state.lastTime <= FLICK_MAX_IDLE_MS
					? state.velocity
					: 0
			const shouldClose =
				offset >= threshold ||
				(offset >= FLICK_MIN_DISTANCE_PX &&
					recentVelocity >= FLICK_VELOCITY_PX_PER_MS)

			backdrop.style.transition = ""

			if (shouldClose) {
				drawer.style.transition = "transform 200ms ease-out"
				drawer.style.transform = "translateY(100%)"
				backdrop.style.opacity = "0"
				handleClose()
			} else {
				drawer.style.transition = ""
				drawer.style.transform = ""
				backdrop.style.opacity = ""
			}
		}

		const cancel = () => {
			if (!drag) return
			const wasDragging = drag.dragging
			drag = null
			if (!wasDragging) return
			drawer.style.transition = ""
			backdrop.style.transition = ""
			drawer.style.transform = ""
			backdrop.style.opacity = ""
		}

		const onTouchStart = (e: TouchEvent) => {
			if (e.touches.length !== 1) return
			const touch = e.touches[0]
			begin(touch.clientX, touch.clientY)
		}

		const onTouchMove = (e: TouchEvent) => {
			if (!drag || e.touches.length !== 1) return
			const touch = e.touches[0]
			move(touch.clientX, touch.clientY, () => {
				if (e.cancelable) e.preventDefault()
			})
		}

		const onTouchEnd = (e: TouchEvent) => {
			const touch = e.changedTouches[0]
			if (touch) end(touch.clientY)
			else cancel()
		}

		// Mouse / pen drag support (e.g. desktop DevTools or stylus).
		let activePointerId: number | null = null

		const onPointerDown = (e: PointerEvent) => {
			if (e.pointerType === "touch" || e.button !== 0) return
			activePointerId = e.pointerId
			begin(e.clientX, e.clientY)
		}

		const onPointerMove = (e: PointerEvent) => {
			if (e.pointerId !== activePointerId) return
			move(e.clientX, e.clientY)
		}

		const onPointerUp = (e: PointerEvent) => {
			if (e.pointerId !== activePointerId) return
			activePointerId = null
			end(e.clientY)
		}

		const onPointerCancel = (e: PointerEvent) => {
			if (e.pointerId !== activePointerId) return
			activePointerId = null
			cancel()
		}

		drawer.addEventListener("touchstart", onTouchStart, { passive: true })
		drawer.addEventListener("touchmove", onTouchMove, { passive: false })
		drawer.addEventListener("touchend", onTouchEnd, { passive: true })
		drawer.addEventListener("touchcancel", cancel, { passive: true })

		drawer.addEventListener("pointerdown", onPointerDown)
		window.addEventListener("pointermove", onPointerMove)
		window.addEventListener("pointerup", onPointerUp)
		window.addEventListener("pointercancel", onPointerCancel)

		return () => {
			drawer.removeEventListener("touchstart", onTouchStart)
			drawer.removeEventListener("touchmove", onTouchMove)
			drawer.removeEventListener("touchend", onTouchEnd)
			drawer.removeEventListener("touchcancel", cancel)

			drawer.removeEventListener("pointerdown", onPointerDown)
			window.removeEventListener("pointermove", onPointerMove)
			window.removeEventListener("pointerup", onPointerUp)
			window.removeEventListener("pointercancel", onPointerCancel)
		}
	}, [handleClose])

	return (
		<div
			ref={backdropRef}
			className={`tooltip-drawer-backdrop no-body-scroll ${isVisible ? "visible" : ""}`}
			onClick={handleClose}>
			<div
				ref={drawerRef}
				className="tooltip-drawer"
				onClick={(e) => e.stopPropagation()}>
				<div className="tooltip-drawer-handle" />
				{children}
				{subtext && <div className="subtext">{subtext}</div>}
			</div>
		</div>
	)
}
