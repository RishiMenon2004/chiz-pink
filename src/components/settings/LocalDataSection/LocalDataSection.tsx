"use client"

import { useT } from "@/contexts"

import { backupExport } from "@/helpers"

import {
	BETATag,
	Blockquote,
	Content,
	ContentColumn,
	Section,
	TitleBar,
} from "../SettingsShared"

import { LocaleLink } from "@/components/layout"

import styles from "@/app/[lang]/settings/settings.module.css"

interface LocalDataSectionProps {
	importData: () => void
	setEraseWarning: (value: boolean) => void
	setErasePullsWarning: (value: boolean) => void
}

export function LocalDataSection({
	importData,
	setEraseWarning,
	setErasePullsWarning,
}: LocalDataSectionProps) {
	const t = useT()

	return (
		<Section>
			<TitleBar title={t("settings.local.title")} />

			<Content>
				<ContentColumn>
					{t("settings.local.description")}
					<Blockquote>
						<BETATag />
						<span className={styles.migrationLinks}>
							{t("settings.local.migrating")}
							<span>
								<LocaleLink
									className="btn-anchor"
									href="https://nteplanner.app/"
									target="_blank">
									NTE Planner
								</LocaleLink>
								{", "}
							</span>
							<LocaleLink
								className="btn-anchor"
								href="https://www.ntewiz.xyz/"
								target="_blank">
								NTEWiz
							</LocaleLink>
						</span>
					</Blockquote>
				</ContentColumn>
				<div className={styles.buttonGroups}>
					<div className={styles.buttonGroup}>
						<b>{t("settings.local.backup")}</b>
						<button
							className="pill-button"
							data-variant="normal"
							onClick={(e) => {
								e.preventDefault()
								importData()
							}}>
							{t("settings.local.import")}
						</button>
						<button
							className="pill-button"
							data-variant="normal"
							onClick={(e) => {
								e.preventDefault()
								backupExport()
							}}>
							{t("settings.local.export")}
						</button>
					</div>
					<div className={styles.buttonGroup}>
						<b>{t("settings.local.erase")}</b>
						<button
							className="pill-button"
							data-variant="danger"
							onClick={() => setErasePullsWarning(true)}>
							{t("settings.local.erasePulls")}
						</button>
						<button
							className="pill-button"
							data-variant="danger"
							onClick={() => setEraseWarning(true)}>
							{t("settings.local.eraseAll")}
						</button>
					</div>
				</div>
			</Content>
		</Section>
	)
}
