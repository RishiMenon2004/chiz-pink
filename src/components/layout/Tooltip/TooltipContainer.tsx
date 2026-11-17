"use client"

import { ReactNode, useCallback, useEffect, useRef, useState } from "react"

// Gap kept between the tooltip and the window edges.
const VIEWPORT_MARGIN = 8
// The tooltip never goes above this, as before.
const TOP_LIMIT = 45

export function TooltipContainer({
	subtext,
	startingPos,
	offset,
	children,
}: {
	subtext?: string
	startingPos: { x: number; y: number }
	offset: { x: number; y: number }
	children: ReactNode
}) {
	const tooltipRef = useRef<HTMLDivElement>(null!)
	const [isVisible, setVisible] = useState<boolean>(false)

	const calculateMousePos = useCallback(
		({ x, y }: { x: number; y: number }) => {
			const { clientWidth: width, clientHeight: height } = tooltipRef.current

			const mousePos = {
				x: x + (offset.x || 0),
				y: y + (offset.y || 0) - height / 2,
			}

			if (mousePos.x + width > document.body.clientWidth) {
				mousePos.x = x - (offset.x || 0) / 2 - width
			}

			// Keep it on screen: the bottom edge is clamped first so that a
			// tooltip taller than the window stays pinned to the top.
			mousePos.x = Math.max(mousePos.x, VIEWPORT_MARGIN)
			mousePos.y = Math.max(
				Math.min(mousePos.y, window.innerHeight - height - VIEWPORT_MARGIN),
				TOP_LIMIT
			)

			return mousePos
		},
		[offset]
	)

	useEffect(() => {
		const handleMouseMove = (e: globalThis.MouseEvent) => {
			if (tooltipRef.current) {
				const mousePos = calculateMousePos({ x: e.clientX, y: e.clientY })
				tooltipRef.current.style.transform = `translate(${mousePos.x}px, ${mousePos.y}px)`
			}
		}

		window.addEventListener("mousemove", handleMouseMove)
		return () => window.removeEventListener("mousemove", handleMouseMove)
	}, [tooltipRef, calculateMousePos])

	useEffect(() => {
		const mousePos = calculateMousePos(startingPos)
		tooltipRef.current.style.transform = `translate(${mousePos.x}px, ${mousePos.y}px)`
	}, [startingPos, calculateMousePos])

	useEffect(() => {
		const mount = setTimeout(() => setVisible(true), 50)
		return () => clearTimeout(mount)
	}, [])

	return (
		<div className={`tooltip ${isVisible ? "visible" : ""}`} ref={tooltipRef}>
			{children}
			{subtext && <div className="subtext">{subtext}</div>}
		</div>
	)
}
