"use client"

import { useSession } from "next-auth/react"

import { useCloudSyncContext, useT } from "@/contexts"

import { signInWithGooglePopup } from "@/helpers"

import {
	Content,
	ContentRow,
	Section,
	TitleBar,
	formatDate,
	syncStatusLabel,
} from "../SettingsShared"

import styles from "@/app/[lang]/settings/settings.module.css"

interface CloudBackupSectionProps {
	setSignoutWarning: (value: boolean) => void
	setUnlinkWarning: (value: boolean) => void
}

export function CloudBackupSection({
	setSignoutWarning,
	setUnlinkWarning,
}: CloudBackupSectionProps) {
	const t = useT()
	const { data: session, status } = useSession()
	const cloudSync = useCloudSyncContext()

	let email: string | null | undefined = t("settings.cloud.notLinked")
	if (status === "authenticated") email = session?.user?.email

	return (
		<Section>
			<TitleBar title={t("settings.cloud.title")}>
				{status === "authenticated" && (
					<span className={styles.settingsCloudStatus}>
						<span
							className={`${styles.settingsCloudStatusLabel} ${styles[cloudSync.status]}`}>
							{t(syncStatusLabel[cloudSync.status]).toUpperCase()}
						</span>
						<button
							className={`pill-button ${styles.settingsCloudSyncBtn}`}
							disabled={cloudSync.status === "syncing"}
							onClick={cloudSync.syncNow}
						/>
					</span>
				)}
			</TitleBar>

			{status === "authenticated" ? (
				<Content>
					<ContentRow>
						<b>{t("settings.cloud.account")}</b>
						<span
							className={`inset-control ${styles.settingsSecret}`}>
							{email}
						</span>
					</ContentRow>

					<ContentRow>
						<b>{t("settings.cloud.lastBackup")}</b>
						<span className={styles.backupTimestamp}>
							{cloudSync.latestBackupUpdatedAt
								? formatDate(cloudSync.latestBackupUpdatedAt)
								: t("settings.cloud.noBackup")}
						</span>
					</ContentRow>

					<ContentRow buttonRow>
						<button
							className="pill-button"
							data-variant="normal"
							onClick={() => setSignoutWarning(true)}>
							{t("settings.cloud.signOut")}
						</button>
						<button
							className="pill-button"
							data-variant="danger"
							onClick={() => setUnlinkWarning(true)}>
							{t("settings.cloud.unlink")}
						</button>
					</ContentRow>
				</Content>
			) : (
				<Content>
					<ContentRow>
						{t("settings.cloud.description")}
					</ContentRow>

					<ContentRow buttonRow>
						<button
							className="pill-button"
							data-variant="normal"
							onClick={() => signInWithGooglePopup()}>
							{t("settings.cloud.signIn")}
						</button>
					</ContentRow>
				</Content>
			)}
		</Section>
	)
}
