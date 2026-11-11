"use client"

import { formatLocale, type Locale } from "@/helpers/locale"

import { useLocale, useT } from "@/contexts"

import { AlertContainer } from "@/components/layout/Alert"
import {
	alertTextBox,
	alertTextColumns,
} from "@/components/layout/Alert/AlertContainer"
import { ModalContainer } from "@/components/layout/Modal/ModalContainer"

function formatTimestamp(value: number | null, unknown: string, locale: Locale) {
	if (value == null) return unknown
	// English keeps the browser's own date format.
	return new Date(value).toLocaleString(formatLocale(locale), {
		dateStyle: "medium",
		timeStyle: "short",
	})
}

// The only remaining cloud sync conflict prompt: first sign-in on this
// device while both this device and the cloud account already have data.
// Every other sync scenario resolves silently via true Last-Write-Wins -
// see CloudSyncProvider's reconcile effect.
export function SyncConflictModal({
	localLastUpdated,
	cloudLastUpdated,
	onKeepLocal,
	onUseCloud,
}: {
	localLastUpdated: number | null
	cloudLastUpdated: number | null
	onKeepLocal: () => void
	onUseCloud: () => void
}) {
	const t = useT()
	const locale = useLocale()

	return (
		<ModalContainer>
			<AlertContainer
				type="choices"
				onConfirm={onUseCloud}
				confirmLabel={t("layout.syncConflict.useCloud")}
				onCancel={onKeepLocal}
				cancelLabel={t("layout.syncConflict.keepLocal")}>
				{t("layout.syncConflict.message")}
				<div className={alertTextColumns}>
					<div className={`inset-control ${alertTextBox}`}>
						<b>{t("layout.syncConflict.thisDevice")}</b>
						<p>{formatTimestamp(localLastUpdated, t("layout.syncConflict.unknown"), locale)}</p>
					</div>
					<div className={`inset-control ${alertTextBox}`}>
						<b>{t("layout.syncConflict.cloud")}</b>
						<p>{formatTimestamp(cloudLastUpdated, t("layout.syncConflict.unknown"), locale)}</p>
					</div>
				</div>
			</AlertContainer>
		</ModalContainer>
	)
}
