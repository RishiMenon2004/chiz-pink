"use client"

import { ReactNode, useCallback, useEffect, useRef, useState } from "react"

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
			const mousePos = {
				x: x + (offset.x || 0),
				y: Math.max(
					y + (offset.y || 0) - tooltipRef.current.clientHeight / 2,
					45
				),
			}

			if (
				mousePos.x + tooltipRef.current.clientWidth >
				document.body.clientWidth
			) {
				mousePos.x =
					x - (offset.x || 0) / 2 - tooltipRef.current.clientWidth
			}

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
		setTimeout(() => setVisible(true), 50)
	}, [])

	return (
		<div className={`tooltip ${isVisible ? "visible" : ""}`} ref={tooltipRef}>
			{children}
			{subtext && <div className="subtext">{subtext}</div>}
		</div>
	)
}
