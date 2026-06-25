"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import routes from "@/database/routes"
import { useTooltip } from "@/hooks"

export default function NavButton({
	href,
	icon,
	className,
}: {
	href: string
	icon: string
	className?: string | undefined
}) {
	const pathname = usePathname()
	const active = pathname === `/${href}`

	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	return (
		<Link
			tabIndex={1}
			href={`/${href}`}
			className={`nav-btn ${active ? "active" : ""} ${className}`}
			style={{ backgroundImage: `url("/nav/${icon}.png")` }}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
		>
			<span
				className="icon"
				style={{ backgroundImage: `url("/nav/borders/${icon}.png")` }}
			/>

			<Tooltip offset={{ x: 48, y: 32 }}>
				{routes[`/${href}`].tooltip}
			</Tooltip>
		</Link>
	)
}
