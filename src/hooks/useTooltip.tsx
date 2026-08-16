"use client"

import { PointerEvent, ReactNode, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { TooltipContainer, TooltipDrawer } from "@/components/layout"

const LONG_PRESS_MS = 450
const LONG_PRESS_MOVE_CANCEL_PX = 10

export function useTooltip() {
	const [isTooltipShown, setIsTooltipShown] = useState<
		{ x: number; y: number } | false
	>(false)
	const [isDrawerShown, setIsDrawerShown] = useState(false)

	const showTooltip = (e: PointerEvent<HTMLElement>) => {
		e.stopPropagation()
		if (e.pointerType === "mouse") {
			setIsTooltipShown({ x: e.clientX, y: e.clientY })
		}
	}

	const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const hideTooltip = () => {
		if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
		hideTimeoutRef.current = setTimeout(() => setIsTooltipShown(false))
	}

	// Touch/pen press-and-hold -> drawer. Mouse keeps the hover tooltip above;
	// this path is a no-op for pointerType "mouse".
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pressOriginRef = useRef<{ x: number; y: number } | null>(null)
	const activePointerIdRef = useRef<number | null>(null)
	// Set once a long press actually opens the drawer, so the consumer's
	// click handler (which still fires on pointerup) can bail out instead of
	// also triggering its normal tap behavior (e.g. opening an edit modal).
	const didLongPressRef = useRef(false)

	const clearLongPressTimer = () => {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current)
			longPressTimerRef.current = null
		}
	}

	const cancelPress = (e?: PointerEvent<HTMLElement>) => {
		if (e && e.pointerId !== activePointerIdRef.current) return
		clearLongPressTimer()
		activePointerIdRef.current = null
		pressOriginRef.current = null
	}

	const onPointerDown = (e: PointerEvent<HTMLElement>) => {
		if (e.pointerType === "mouse") return

		activePointerIdRef.current = e.pointerId
		pressOriginRef.current = { x: e.clientX, y: e.clientY }

		clearLongPressTimer()
		longPressTimerRef.current = setTimeout(() => {
			longPressTimerRef.current = null
			didLongPressRef.current = true
			navigator.vibrate?.(15)
			setIsDrawerShown(true)
		}, LONG_PRESS_MS)
	}

	const onPointerMove = (e: PointerEvent<HTMLElement>) => {
		if (
			!pressOriginRef.current ||
			e.pointerId !== activePointerIdRef.current
		) {
			return
		}

		const dx = e.clientX - pressOriginRef.current.x
		const dy = e.clientY - pressOriginRef.current.y
		if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_CANCEL_PX) cancelPress(e)
	}

	const longPressHandlers = {
		onPointerDown,
		onPointerMove,
		onPointerUp: cancelPress,
		onPointerCancel: cancelPress,
	}

	const closeDrawer = () => setIsDrawerShown(false)

	const consumeLongPress = () => {
		if (!didLongPressRef.current) return false
		didLongPressRef.current = false
		return true
	}

	useEffect(() => {
		return () => {
			if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
			clearLongPressTimer()
		}
	}, [])

	const Tooltip = ({
		offset,
		subText,
		children,
	}: {
		offset: { x: number; y: number }
		subText?: string
		children: ReactNode
	}) => {
		if (isDrawerShown) {
			return createPortal(
				<TooltipDrawer subtext={subText} onClose={closeDrawer}>
					{children}
				</TooltipDrawer>,
				document.body
			)
		}

		return (
			isTooltipShown &&
			createPortal(
				<TooltipContainer
					subtext={subText}
					startingPos={isTooltipShown}
					offset={offset}>
					{children}
				</TooltipContainer>,
				document.body
			)
		)
	}

	return {
		Tooltip,
		showTooltip,
		hideTooltip,
		longPressHandlers,
		consumeLongPress,
	}
}
