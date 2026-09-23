"use client"

import { AlertContainer } from "@/components/layout/Alert"
import {
	alertTextBox,
	alertTextColumns,
} from "@/components/layout/Alert/AlertContainer"
import { ModalContainer } from "@/components/layout/Modal/ModalContainer"

function formatTimestamp(value: number | null) {
	if (value == null) return "Unknown"
	return new Date(value).toLocaleString(undefined, {
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
	return (
		<ModalContainer>
			<AlertContainer
				type="choices"
				onConfirm={onUseCloud}
				confirmLabel="Use Cloud Version"
				onCancel={onKeepLocal}
				cancelLabel="Keep This Device">
				We found existing data in your cloud account. Which version
				would you like to keep?
				<div className={alertTextColumns}>
					<div className={`inset-control ${alertTextBox}`}>
						<b>This Device</b>
						<p>{formatTimestamp(localLastUpdated)}</p>
					</div>
					<div className={`inset-control ${alertTextBox}`}>
						<b>Cloud</b>
						<p>{formatTimestamp(cloudLastUpdated)}</p>
					</div>
				</div>
			</AlertContainer>
		</ModalContainer>
	)
}
