import { ReactNode, useEffect, useRef } from "react"

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

	useEffect(() => {
		const handleMouseMove = (e: globalThis.MouseEvent) => {
			if (tooltipRef.current) {
				const mousePos = {
					x: e.clientX + (offset.x || 0),
					y:
						e.clientY +
						(offset.y || 0) -
						(tooltipRef.current.clientHeight / 2),
				}

				if (
					mousePos.x + tooltipRef.current.clientWidth >
					document.body.clientWidth
				) {
					mousePos.x =
						e.clientX -
						(offset.x / 2 || 0) -
						tooltipRef.current.clientWidth
				}

				tooltipRef.current.style.transform = `translate(${mousePos.x}px, ${mousePos.y}px)`
			}
		}

		window.addEventListener("mousemove", handleMouseMove)
		return () => window.removeEventListener("mousemove", handleMouseMove)
	}, [tooltipRef, offset])

	useEffect(() => {
		const mousePos = {
			x: startingPos.x + (offset.x || 0),
			y: startingPos.y + (offset.y || 0) - (tooltipRef.current.clientHeight / 2),
		}

		if (
			mousePos.x + tooltipRef.current.clientWidth >
			document.body.clientWidth
		) {
			mousePos.x =
				startingPos.x -
				(offset.x / 2 || 0) -
				tooltipRef.current.clientWidth
		}
		tooltipRef.current.style.transform = `translate(${mousePos.x}px, ${mousePos.y}px)`
	}, [startingPos, offset])

	return (
		<div className="tooltip" ref={tooltipRef}>
			{children}
			{subtext && <div className="subtext">{subtext}</div>}
		</div>
	)
}
