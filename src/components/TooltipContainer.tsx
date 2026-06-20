import { ReactNode, useEffect, useRef } from "react";

export function TooltipContainer({ subtext, startingPos, offset, children }: { subtext?: string, startingPos: {x: number, y: number}, offset: {x: number, y: number}, children: ReactNode }) {
	const tooltipRef = useRef<HTMLDivElement>(null!)

	useEffect(() => {
		const handleMouseMove = (e: globalThis.MouseEvent) => {
			if (tooltipRef.current) {
				const mousePos = {x: e.clientX + (offset.x || 0), y: e.clientY + (offset.y || 0) - tooltipRef.current.clientHeight}
				tooltipRef.current.style.transform = `translate(${mousePos.x}px, ${mousePos.y}px)`
			}
		}
		
		window.addEventListener("mousemove", handleMouseMove)
		return () => window.removeEventListener("mousemove", handleMouseMove)
	}, [tooltipRef, offset])

	useEffect(() => {
		tooltipRef.current.style.transform = `translate(${startingPos.x}px, ${startingPos.y}px)`
	}, [startingPos])

	return <div className="tooltip" ref={tooltipRef}>
		{children}
		{subtext && <div className="subtext">{subtext}</div>}
	</div>
}