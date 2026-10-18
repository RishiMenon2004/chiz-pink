"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { RoutesData } from "@/data/routes"

import { useTooltip } from "@/hooks/useTooltip"

import styles from "./navButton.module.css"

export function NavButton({
	href,
	icon = href,
	activeFor = [href],
	tooltip,
	className = "",
}: {
	href: string
	icon?: string
	// Top-level route segments that light this button up (defaults to its
	// own), e.g. the catalog button covers both /characters and /arcs.
	activeFor?: string[]
	tooltip?: string
	className?: string
}) {
	const pathname = usePathname()
	const active = activeFor.includes(pathname.split("/")[1])

	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	return (
		<Link
			tabIndex={1}
			href={`/${href}`}
			className={`inset-control ${styles.navBtn} ${active ? styles.active : ""} ${className}`}
			style={{ backgroundImage: `url("/nav/${icon}.png")` }}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
			<span
				className={styles.icon}
				style={{ backgroundImage: `url("/nav/borders/${icon}.png")` }}
			/>

			<Tooltip offset={{ x: 6, y: 0 }}>
				{tooltip ?? RoutesData[`/${href}`].tooltip}
			</Tooltip>
		</Link>
	)
}
