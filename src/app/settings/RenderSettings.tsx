"use client"

import { AlertContainer, ModalContainer } from "@/components/layout"
import { useDriveSyncContext } from "@/contexts"
import { backupExport, backupImport, backupSetImport } from "@/helpers/backupData"
import { signInWithGooglePopup } from "@/helpers/signInWithGooglePopup"
import { unlinkGoogleAccount } from "@/helpers/unlinkGoogleAccount"
import { Inventory } from "@/types/inventory"
import { PlannerRecord } from "@/types/planner"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"

import styles from "./settings.module.css"
import Link from "next/link"

const syncStatusLabel = {
	idle: "Not Synced",
	syncing: "Syncing...",
	synced: "Synced",
	error: "Sync Failed",
}

export function RenderSettings() {
	const { data: session, status } = useSession()
	const driveSync = useDriveSyncContext()
	let email: string | null | undefined = "Not Linked"
	if (status === "authenticated") email = session?.user?.email
	const [isImportOlder, setImportOlder] = useState<boolean>(false)
	const [askOverwrite, setAskOverwrite] = useState<boolean>(false)
	const [signoutWarning, setSignoutWarning] = useState<boolean>(false)
	const [unlinkWarning, setUnlinkWarning] = useState<boolean>(false)
	const [importedJson, setImportedJson] = useState<{
		planner: PlannerRecord
		inventory: Inventory
		lastUpdated: number
	}>({
		planner: { arcs: {}, characters: {} },
		inventory: {},
		lastUpdated: 0,
	})

	const importData = () => {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "application/json"
		input.onchange = () => {
			const file = input.files?.[0]
			if (!file) return

			const reader = new FileReader()
			reader.onload = () => {
				const result = reader.result as string
				const importResult = backupImport(result)
				const { status, data } = importResult

				switch (status) {
					case "error":
						break
					case "newer":
						backupSetImport(data)
						break
					case "older":
						setImportOlder(true)
						setImportedJson(data)
						break
					case "overwrite":
						setAskOverwrite(true)
						setImportedJson(data)
						break
					default:
						break
				}
			}
			reader.readAsText(file)
		}
		input.click()
	}

	return (
		<div className={`page ${styles.page}`}>
			<div className={styles.settingsSection}>
				<div className={styles.settingsSectionTitlebar}>
					<span className={styles.settingsSectionTitle}>
						CLOUD BACKUP
					</span>
					{status === "authenticated" && (
						<span className={styles.settingsCloudStatus}>
							<span
								className={`${styles.settingsCloudStatusLabel} ${styles[driveSync.status]}`}>
								{syncStatusLabel[driveSync.status].toUpperCase()}
							</span>
							<div
								tabIndex={0}
								className={styles.settingsCloudSyncBtn}
								data-variant="normal"
								onClick={driveSync.syncNow}
							/>
						</span>
					)}
				</div>
				{status === "authenticated" ? (
					<div className={styles.settingsSectionContent}>
						<span className={styles.settingsSectionContentRow}>
							<b>Account:</b>
							<span className={styles.settingsSecret}>{email}</span>
						</span>
						<span className={styles.settingsSectionContentRow}>
							<b>Last Backup:</b>
							<span
								style={{
									fontFamily: "var(--font-barlow-condensed)",
									letterSpacing: "5%",
								}}>
								{driveSync.latestBackupUpdatedAt
									? new Date(driveSync.latestBackupUpdatedAt as number)
											.toLocaleString("en-GB", {
												year: "numeric",
												month: "short",
												day: "2-digit",
												hour: "numeric",
												minute: "2-digit",
												hour12: true,
											})
											.toUpperCase()
									: "NO BACKUP"}
							</span>
						</span>
						<span
							className={`${styles.settingsSectionContentRow} ${styles.buttonRow}`}>
							<button
								data-variant="normal"
								onClick={() => setSignoutWarning(true)}>
								Sign Out
							</button>
							<button
								data-variant="danger"
								onClick={() => setUnlinkWarning(true)}>
								Unlink & Delete Cloud Data
							</button>
						</span>
					</div>
				) : (
					<div className={styles.settingsSectionContent}>
						<span className={styles.settingsSectionContentRow}>
							{
								"Sync your data across devices using Google Drive. Chiz.Pink can only ever access it's own backup files."
							}
						</span>
						<span
							className={`${styles.settingsSectionContentRow} ${styles.buttonRow}`}>
							<button
								data-variant="normal"
								onClick={() => signInWithGooglePopup()}>
								Sign In
							</button>
						</span>
					</div>
				)}
			</div>

			<div className={styles.settingsSection}>
				<div className={styles.settingsSectionTitlebar}>
					<span className={styles.settingsSectionTitle}>
						LOCAL DATA
					</span>
				</div>
				<div className={styles.settingsSectionContent}>
					<span className={styles.settingsSectionContentColumn}>
						Backup your data locally.
						<p className={styles.settingsTextbox}>
							<span
								style={{
									borderRadius: "100vh",
									backgroundColor: "#ffa600",
									padding: "0.25rem 0.5rem",
									fontSize: "0.7em",
									color: "black",
									fontWeight: 720,
									marginRight: "0.25rem",
									height: "fit-content",
								}}>
								BETA
							</span>
							<span
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: "0.5ch",
								}}>
								{"Import compatible data from: "}
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
						</p>
					</span>
					<span
						className={`${styles.settingsSectionContentRow} ${styles.buttonRow}`}>
						<button
							data-variant="normal"
							onClick={(e) => {
								e.preventDefault()
								backupExport()
							}}>
							Export Data
						</button>
						<button
							data-variant="normal"
							onClick={(e) => {
								e.preventDefault()
								importData()
							}}>
							Import Data
						</button>
					</span>
				</div>
			</div>

			{(isImportOlder || askOverwrite) && (
				<ModalContainer onClose={() => setImportOlder(false)}>
					<AlertContainer
						type="dangerous-confirm"
						confirmLabel="Overwrite"
						onConfirm={() => backupSetImport(importedJson)}
						isConfirmDanger={true}
						cancelLabel="Cancel"
						onCancel={() => setImportOlder(false)}>
						{isImportOlder && (
							<>
								The imported data is older than the current data.
								<br />
							</>
						)}
						{"Would you like to overwrite your current data?"}
					</AlertContainer>
				</ModalContainer>
			)}
			{signoutWarning && (
				<ModalContainer onClose={() => setSignoutWarning(false)}>
					<AlertContainer
						type="dangerous-confirm"
						onConfirm={() => signOut()}
						onCancel={() => setSignoutWarning(false)}
						confirmLabel="Sign Out"
						cancelLabel="Stay Signed In	">
						Stop Cloud Syncing?
						<br />
						<p style={{ fontSize: "0.9em", fontWeight: "500" }}>
							You will need to sign in again to enable syncing.
						</p>
					</AlertContainer>
				</ModalContainer>
			)}
			{unlinkWarning && (
				<ModalContainer onClose={() => setUnlinkWarning(false)}>
					<AlertContainer
						type="dangerous-confirm"
						onConfirm={() =>
							unlinkGoogleAccount(session?.accessToken)
						}
						onCancel={() => setUnlinkWarning(false)}
						confirmLabel="Unlink"
						cancelLabel="Keep Linked">
						Unlink your Google account?
						<br />
						<p style={{ fontSize: "0.9rem", fontWeight: "500" }}>
							This deletes your cloud backup.
						</p>
					</AlertContainer>
				</ModalContainer>
			)}
		</div>
	)
}
