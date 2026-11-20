"use client"

import { eraseLocalData } from "@/helpers/backupData"
import { clearCorruption } from "@/helpers/dataCorruption"

import { useT } from "@/contexts"

import { AlertContainer } from "@/components/layout/Alert"
import { ModalContainer } from "@/components/layout/Modal"

// Local-only corruption recovery modal for signed-out visitors.
export function LocalCorruptionModal() {
	const t = useT()

	return (
		<ModalContainer>
			<AlertContainer
				type="choices"
				onConfirm={() => {
					eraseLocalData()
					clearCorruption()
				}}
				confirmLabel={t("sync.corruption.local.confirmErase")}
				cancelLabel={t("sync.corruption.eraseAndStartFresh")}>
				{t("sync.corruption.local.messageNoCloud")}
			</AlertContainer>
		</ModalContainer>
	)
}
