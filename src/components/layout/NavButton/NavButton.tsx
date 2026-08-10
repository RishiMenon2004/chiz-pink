"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { RoutesData } from "@/data/routes"

import { useTooltip } from "@/hooks"

import styles from "./navButton.module.css"

export function NavButton({ href, icon }: { href: string; icon: string }) {
	const pathname = usePathname()
	const active = pathname === `/${href}`

	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	return (
		<Link
			tabIndex={1}
			href={`/${href}`}
			className={`inset-control ${styles.navBtn} ${active ? styles.active : ""}`}
			style={{ backgroundImage: `url("/nav/${icon}.png")` }}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
			<span
				className={styles.icon}
				style={{ backgroundImage: `url("/nav/borders/${icon}.png")` }}
			/>

			<Tooltip offset={{ x: 6, y: 0 }}>
				{RoutesData[`/${href}`].tooltip}
			</Tooltip>
		</Link>
	)
}
