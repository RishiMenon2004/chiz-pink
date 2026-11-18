"use client"

import { ReactNode } from "react"

import type { ToolIntroId } from "@/helpers/toolIntro"

import { useToolIntro } from "@/hooks/useToolIntro"

import { useT } from "@/contexts"

import { InfoBox } from "../InfoBox"

import styles from "./toolIntro.module.css"

// A short "what this tool is" box. New visitors see it open; everyone else
// (and the server HTML) gets it collapsed into an "About" toggle, so the
// text is always on the page for search engines without flashing in for
// returning users. Collapses on the X or on the tool's first real use (see
// dismissToolIntro's callers).
export function ToolIntro({
	id,
	children,
}: {
	id: ToolIntroId
	children: ReactNode
}) {
	const t = useT()
	const { show, dismiss } = useToolIntro(id)

	if (show) {
		return <InfoBox onDismiss={dismiss}>{children}</InfoBox>
	}

	return (
		<details className={styles.about}>
			<summary className={styles.summary}>
				<svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
					<circle cx="8" cy="8" r="6.5" />
					<path d="M8 7.25v4" />
					<circle cx="8" cy="4.75" r="0.5" fill="currentColor" />
				</svg>
				{t("layout.toolIntro.about", {
					tool: t(`routes.${id}.tooltip`),
				})}
			</summary>
			<InfoBox className={styles.box}>{children}</InfoBox>
		</details>
	)
}
