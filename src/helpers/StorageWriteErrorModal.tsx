"use client"

import { useT } from "@/contexts"

import { AlertContainer } from "@/components/layout/Alert"
import { ModalContainer } from "@/components/layout/Modal"

import { dismissStorageWriteError } from "./storage/storageError"

export function StorageWriteErrorModal() {
	const t = useT()

	return (
		<ModalContainer onClickOut={dismissStorageWriteError}>
			<AlertContainer
				type="acknowledge"
				onConfirm={dismissStorageWriteError}
				confirmLabel={t("layout.actions.confirm")}>
				{t("sync.storageError.message")}
			</AlertContainer>
		</ModalContainer>
	)
}
