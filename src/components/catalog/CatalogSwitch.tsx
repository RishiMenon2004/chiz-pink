"use client"

import { CSSProperties } from "react"
import Link from "next/link"

import styles from "@/components/planner/PlannerSwitch/plannerSwitch.module.css"
import catalogStyles from "./catalog.module.css"

const SECTIONS = [
	{ href: "/characters", icon: "character", label: "Characters" },
	{ href: "/arcs", icon: "arc", label: "Arcs" },
] as const

// The planner's Characters | Arcs switch, as links between the two catalog
// pages (one nav button covers both).
export function CatalogSwitch({ active }: { active: "characters" | "arcs" }) {
	return (
		<nav
			aria-label="Catalog"
			className={`${styles.switchContainer} ${active === "arcs" ? styles.right : styles.left}`}
			style={{ display: "grid" }}>
			{SECTIONS.map(({ href, icon, label }) => (
				<Link
					key={href}
					href={href}
					aria-current={href === `/${active}` ? "page" : undefined}
					className={`${styles.switchButton} ${catalogStyles.switchLink} ${href === `/${active}` ? styles.active : ""}`}
					style={{ "--icon": `url("/icons/${icon}.png")` } as CSSProperties}>
					<span className={styles.label}>{label}</span>
				</Link>
			))}
		</nav>
	)
}
