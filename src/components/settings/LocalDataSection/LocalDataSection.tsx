"use client"

import Link from "next/link"

import { backupExport } from "@/helpers"

import {
	BETATag,
	Blockquote,
	Content,
	ContentColumn,
	ContentRow,
	Section,
	TitleBar,
} from "../SettingsShared"

import styles from "@/app/settings/settings.module.css"

interface LocalDataSectionProps {
	importData: () => void
	setEraseWarning: (value: boolean) => void
}

export function LocalDataSection({
	importData,
	setEraseWarning,
}: LocalDataSectionProps) {
	return (
		<Section>
			<TitleBar title="LOCAL DATA" />

			<Content>
				<ContentColumn>
					{"Manage the data stored in your browser's IndexedDB."}
					<Blockquote>
						<BETATag />
						<span className={styles.migrationLinks}>
							{
								"Migrating from another app? Import compatible data from: "
							}
							<span>
								<Link
									className="btn-anchor"
									href="https://nteplanner.app/"
									target="_blank">
									NTE Planner
								</Link>
								{", "}
							</span>
							<Link
								className="btn-anchor"
								href="https://www.ntewiz.xyz/"
								target="_blank">
								NTEWiz
							</Link>
						</span>
					</Blockquote>
				</ContentColumn>
				<ContentRow buttonRow>
					<button
						className="pill-button"
						data-variant="normal"
						onClick={(e) => {
							e.preventDefault()
							backupExport()
						}}>
						Export Data
					</button>
					<button
						className="pill-button"
						data-variant="normal"
						onClick={(e) => {
							e.preventDefault()
							importData()
						}}>
						Import Data
					</button>
					<button
						className="pill-button"
						data-variant="danger"
						onClick={() => setEraseWarning(true)}>
						Erase Data
					</button>
				</ContentRow>
			</Content>
		</Section>
	)
}
