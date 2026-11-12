"use client"

import { useT } from "@/contexts"

import { InfoBox } from "@/components/layout"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./statsSection.module.css"

// Placeholder until pull statistics are built.
export function StatsSection() {
	const t = useT()

	return (
		<div
			className={`metallic-panel ${pageStyles.section} ${styles.statsSection}`}>
			<div className={pageStyles.sectionTitleRow}>
				<span className={pageStyles.sectionTitle}>{t("pulls.stats.title")}</span>
			</div>
			<div className={`inset-control ${styles.statsContent}`}>
				<InfoBox sticker="rich" className={styles.notice}>
					<div>{t("pulls.stats.comingSoon")}</div>
				</InfoBox>
			</div>
		</div>
	)
}
