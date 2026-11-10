"use client"

import { CSSProperties } from "react"

import type { MessageKey } from "@/types/messages"

import { useT } from "@/contexts"

import { LocaleLink } from "@/components/layout"

import styles from "@/components/planner/PlannerSwitch/plannerSwitch.module.css"
import catalogStyles from "./catalog.module.css"

const SECTIONS = [
	{ href: "/characters", icon: "character", label: "catalog.switch.characters" },
	{ href: "/arcs", icon: "arc", label: "catalog.switch.arcs" },
] as const satisfies { href: string; icon: string; label: MessageKey }[]

// The planner's Characters | Arcs switch, as links between the two catalog
// pages (one nav button covers both).
export function CatalogSwitch({ active }: { active: "characters" | "arcs" }) {
	const t = useT()
	return (
		<nav
			aria-label={t("catalog.switch.label")}
			className={`${styles.switchContainer} ${active === "arcs" ? styles.right : styles.left}`}
			style={{ display: "grid" }}>
			{SECTIONS.map(({ href, icon, label }) => (
				<LocaleLink
					key={href}
					href={href}
					aria-current={href === `/${active}` ? "page" : undefined}
					className={`${styles.switchButton} ${catalogStyles.switchLink} ${href === `/${active}` ? styles.active : ""}`}
					style={{ "--icon": `url("/icons/${icon}.png")` } as CSSProperties}>
					<span className={styles.label}>{t(label)}</span>
				</LocaleLink>
			))}
		</nav>
	)
}
