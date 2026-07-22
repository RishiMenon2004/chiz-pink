"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { signOut, useSession } from "next-auth/react"

import { BackupData } from "@/types/settings"

import { usePWAInstall, useSettingsStore } from "@/hooks"

import {
	backupExport,
	backupImport,
	backupSetImport,
	eraseLocalData,
	parseDescription,
	signInWithGooglePopup,
	unlinkGoogleAccount,
} from "@/helpers"

import { useDriveSyncContext } from "@/contexts"

import {
	AlertContainer,
	InstallPWAButton,
	ModalContainer,
} from "@/components/layout"

import styles from "./settings.module.css"

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

	const { settings, actions } = useSettingsStore()

	const { isStandalone } = usePWAInstall()

	const [isImportOlder, setImportOlder] = useState<boolean>(false)
	const [askOverwrite, setAskOverwrite] = useState<boolean>(false)
	const [signoutWarning, setSignoutWarning] = useState<boolean>(false)
	const [unlinkWarning, setUnlinkWarning] = useState<boolean>(false)
	const [eraseWarning, setEraseWarning] = useState<boolean>(false)
	const [eraseSyncChoice, setEraseSyncChoice] = useState<boolean>(false)
	const [importedJson, setImportedJson] = useState<BackupData>({
		planner: { arcs: {}, characters: {} },
		inventory: {},
		lastUpdated: 0,
		settings: { appearance: {} },
	})

	const importData = useMemo(() => {
		return () => {
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
	}, [])

	return (
		<div className={`page ${styles.page}`}>
			<div className={styles.settingsSection}>
				<div className={styles.settingsSectionTitlebar}>
					<span className={styles.settingsSectionTitle}>
						LOCAL DATA
					</span>
				</div>
				<div className={styles.settingsSectionContent}>
					<span className={styles.settingsSectionContentColumn}>
						Manage the data stored in the Local Storage of your
						browser.
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
									marginLeft: "-0.675rem",
									height: "fit-content",
									userSelect: "none",
								}}>
								BETA
							</span>
							<span
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: "0.5ch",
								}}>
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
						<button
							data-variant="danger"
							onClick={() => setEraseWarning(true)}>
							Erase Data
						</button>
					</span>
				</div>
			</div>

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
									? new Date(
											driveSync.latestBackupUpdatedAt as number
										)
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

			{!isStandalone && (
				<div className={styles.settingsSection}>
					<div className={styles.settingsSectionTitlebar}>
						<span className={styles.settingsSectionTitle}>
							Install as PWA
						</span>
					</div>
					<div className={styles.settingsSectionContent}>
						<span className={styles.settingsSectionContentColumn}>
							Install Chiz.Pink as a native app on any device with a
							supported browser.
							<p className={styles.settingsTextbox}>
								{"Use it on the go or when you're offline too!"}
							</p>
						</span>
						<span
							className={`${styles.settingsSectionContentRow} ${styles.buttonRow}`}>
							<InstallPWAButton type="button" />
						</span>
					</div>
				</div>
			)}

			<div className={styles.settingsSection}>
				<div className={styles.settingsSectionTitlebar}>
					<div className={styles.settingsSectionTitle}>Appearance</div>
				</div>
				<div className={styles.settingsSectionContent}>
					<div className={styles.settingsSectionContentColumn}>
						<div className={styles.settingsSectionContentRow}>
							<input
								type="checkbox"
								checked={
									settings.appearance?.["use-cursors"] || false
								}
								onChange={() =>
									actions.setConfig("appearance", {
										"use-cursors":
											!settings.appearance?.[
												"use-cursors"
											] || false,
									})
								}
							/>
							<b>Custom Cursors</b>
						</div>
					</div>
				</div>
			</div>

			{/* alert modals */}
			{(isImportOlder || askOverwrite) && (
				<ModalContainer onClose={() => setImportOlder(false)}>
					<AlertContainer
						type="dangerous-confirm"
						confirmLabel="Overwrite"
						onConfirm={() => backupSetImport(importedJson)}
						isConfirmDanger={true}
						cancelLabel="Cancel"
						onCancel={() => setImportOlder(false)}>
						{isImportOlder
							? "This file contains older information."
							: "Existing data will be overwritten."}
						<p
							style={{
								fontSize: "0.9em",
								fontWeight: "500",
								textWrapStyle: "balance",
							}}>
							Are you sure you want to replace your current data?
						</p>
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
			{eraseWarning && (
				<ModalContainer onClose={() => setEraseWarning(false)}>
					<AlertContainer
						type="dangerous-confirm"
						onConfirm={() => {
							setEraseWarning(false)
							if (status === "authenticated") {
								setEraseSyncChoice(true)
							} else {
								eraseLocalData()
							}
						}}
						onCancel={() => setEraseWarning(false)}
						confirmLabel="Erase"
						cancelLabel="Cancel">
						Erase all local data?
						<br />
						<p style={{ fontSize: "0.9rem", fontWeight: "500" }}>
							This action will erase all data from this device.
						</p>
					</AlertContainer>
				</ModalContainer>
			)}
			{eraseSyncChoice && (
				<ModalContainer onClose={() => setEraseSyncChoice(false)}>
					<AlertContainer
						type="dangerous-choices"
						onConfirm={() => {
							eraseLocalData()
							driveSync.syncNow()
							setEraseSyncChoice(false)
						}}
						onCancel={() => {
							eraseLocalData()
							signOut()
							setEraseSyncChoice(false)
						}}
						confirmLabel="Erase Cloud Backup"
						cancelLabel="Keep Cloud Backup">
						Keep your Cloud Backup?
						<br />
						<p
							style={{
								fontSize: "0.9rem",
								fontWeight: "500",
								textWrapStyle: "balance",
							}}>
							{parseDescription(
								"You will be able to use your backup when you sign back in."
							)}
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
