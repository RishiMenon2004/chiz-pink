"use client"

import { PointerEvent, ReactNode, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { TooltipContainer } from "@/components/layout"

export function useTooltip() {
	const [isTooltipShown, setIsTooltipShown] = useState<
		{ x: number; y: number } | false
	>(false)

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

	useEffect(() => {
		return () => {
			if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
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

	return { Tooltip, showTooltip, hideTooltip }
}
