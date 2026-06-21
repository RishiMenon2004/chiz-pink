"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PointerEvent, useState } from "react"
import { createPortal } from "react-dom"
import { TooltipContainer } from "./TooltipContainer"
import routes from "@/database/routes"

export default function NavButton({ href, icon, className }: { href: string, icon: string, className?: string | undefined }) {
	const pathname = usePathname()
	const active = pathname === `/${href}`

	const [showTooltip, setShowTooltip] = useState<{x: number, y: number} | false>(false)

	const handleHover = (e: PointerEvent<HTMLAnchorElement>) => {
		e.stopPropagation()
		if (e.pointerType === "mouse") {
			setShowTooltip({x: e.clientX, y: e.clientY})
		}
	}

	const handleUnhover = () => {
		setTimeout(() => setShowTooltip(false))
	}
		
	return (
		<Link tabIndex={1} href={`/${href}`}
			className={`nav-btn ${active ? "active" : ""} ${className}`}
			style={{backgroundImage: `url("/nav/${icon}.png")`}}
			onPointerEnter={handleHover}
			onPointerLeave={handleUnhover}
		>
			<span className="icon"
				style={{backgroundImage: `url("/nav/border/${icon}.png")`}}
			/>
			{showTooltip && createPortal(
				<TooltipContainer
					startingPos={showTooltip}
					offset={{x: 48, y: 32}}
				>
					{routes[`/${href}`].tooltip}
				</TooltipContainer>, document.body
			)}
		</Link>
	)
}