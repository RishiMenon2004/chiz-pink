"use client"

import { useSession } from "next-auth/react"

import { useCloudSyncContext } from "@/contexts"

import { signInWithGooglePopup } from "@/helpers"

import {
	Content,
	ContentRow,
	Section,
	TitleBar,
	formatDate,
	syncStatusLabel,
} from "../SettingsShared"

import styles from "@/app/settings/settings.module.css"

interface CloudBackupSectionProps {
	setSignoutWarning: (value: boolean) => void
	setUnlinkWarning: (value: boolean) => void
}

export function CloudBackupSection({
	setSignoutWarning,
	setUnlinkWarning,
}: CloudBackupSectionProps) {
	const { data: session, status } = useSession()
	const cloudSync = useCloudSyncContext()

	let email: string | null | undefined = "Not Linked"
	if (status === "authenticated") email = session?.user?.email

	return (
		<Section>
			<TitleBar title="CLOUD BACKUP">
				{status === "authenticated" && (
					<span className={styles.settingsCloudStatus}>
						<span
							className={`${styles.settingsCloudStatusLabel} ${styles[cloudSync.status]}`}>
							{syncStatusLabel[cloudSync.status].toUpperCase()}
						</span>
						<div
							tabIndex={0}
							className={styles.settingsCloudSyncBtn}
							data-variant="normal"
							onClick={cloudSync.syncNow}
						/>
					</span>
				)}
			</TitleBar>

			{status === "authenticated" ? (
				<Content>
					<ContentRow>
						<b>Account:</b>
						<span
							className={`inset-control ${styles.settingsSecret}`}>
							{email}
						</span>
					</ContentRow>

					<ContentRow>
						<b>Last Backup:</b>
						<span
							style={{
								fontFamily: "var(--font-barlow-condensed)",
								letterSpacing: "5%",
							}}>
							{cloudSync.latestBackupUpdatedAt
								? formatDate(cloudSync.latestBackupUpdatedAt)
								: "NO BACKUP"}
						</span>
					</ContentRow>

					<ContentRow buttonRow>
						<button
							className="pill-button"
							data-variant="normal"
							onClick={() => setSignoutWarning(true)}>
							Sign Out
						</button>
						<button
							className="pill-button"
							data-variant="danger"
							onClick={() => setUnlinkWarning(true)}>
							Unlink & Delete Cloud Data
						</button>
					</ContentRow>
				</Content>
			) : (
				<Content>
					<ContentRow>
						{
							"Sync your data across devices, end-to-end encrypted. Chiz.Pink never has access to your unencrypted data - only you can decrypt it."
						}
					</ContentRow>

					<ContentRow buttonRow>
						<button
							className="pill-button"
							data-variant="normal"
							onClick={() => signInWithGooglePopup()}>
							Sign In
						</button>
					</ContentRow>
				</Content>
			)}
		</Section>
	)
}
