"use client"

import { Session } from "next-auth"

import { ExternalImportResult } from "@/helpers/importExternal"

import {
	AlertContainer,
	ModalContainer,
} from "@/components/layout"
import {
	alertTextBox,
	alertMessage,
	alertTextColumns,
} from "@/components/layout/Alert/AlertContainer"

import { useCloudSyncContext, useT } from "@/contexts"

/* ------------------------------------------------------------------ */
/*  Import overwrite / older warning                                   */
/* ------------------------------------------------------------------ */

export function ImportOverwriteModal({
	isImportOlder,
	askOverwrite,
	onConfirm,
	onCancel,
}: {
	isImportOlder: boolean
	askOverwrite: boolean
	onConfirm: () => void
	onCancel: () => void
}) {
	const t = useT()

	if (!isImportOlder && !askOverwrite) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				confirmLabel={t("settings.modals.importOverwrite.confirm")}
				onConfirm={onConfirm}
				isConfirmDanger={true}
				cancelLabel={t("settings.modals.importOverwrite.cancel")}
				onCancel={onCancel}>
				{isImportOlder
					? t("settings.modals.importOverwrite.older")
					: t("settings.modals.importOverwrite.overwritten")}
				<p className={alertMessage}>
					{t("settings.modals.importOverwrite.question")}
				</p>
			</AlertContainer>
		</ModalContainer>
	)
}

/* ------------------------------------------------------------------ */
/*  External import pending (overwrite / merge choice)                 */
/* ------------------------------------------------------------------ */

export function ExternalImportPendingModal({
	externalImportPending,
	setExternalImportPending,
	applyExternalPlannerImport,
}: {
	externalImportPending: ExternalImportResult | null
	setExternalImportPending: (v: null) => void
	applyExternalPlannerImport: (
		report: ExternalImportResult,
		mode: "merge" | "overwrite",
	) => void
}) {
	const t = useT()

	if (!externalImportPending) return null

	return (
		<ModalContainer onClickOut={() => setExternalImportPending(null)}>
			<AlertContainer
				type="dangerous-choices"
				confirmLabel={t("settings.modals.externalPending.overwrite")}
				cancelLabel={t("settings.modals.externalPending.merge")}
				onConfirm={() => {
					applyExternalPlannerImport(
						externalImportPending,
						"overwrite",
					)
					setExternalImportPending(null)
				}}
				onCancel={() => {
					applyExternalPlannerImport(
						externalImportPending,
						"merge",
					)
					setExternalImportPending(null)
				}}>
				{t("settings.modals.externalPending.title", {
					source: externalImportPending.source,
				})}
				<div
					className={`inset-control ${alertTextBox} ${alertTextColumns}`}>
					<p>{t("settings.modals.externalPending.mergeInfo")}</p>
					<p>{t("settings.modals.externalPending.overwriteInfo")}</p>
				</div>
			</AlertContainer>
		</ModalContainer>
	)
}

/* ------------------------------------------------------------------ */
/*  External import summary                                            */
/* ------------------------------------------------------------------ */

export function ExternalImportSummaryModal({
	externalImportSummary,
	setExternalImportSummary,
}: {
	externalImportSummary: ExternalImportResult | null
	setExternalImportSummary: (v: null) => void
}) {
	const t = useT()

	if (!externalImportSummary) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="acknowledge"
				confirmLabel={t("settings.modals.externalSummary.confirm")}
				onConfirm={() => setExternalImportSummary(null)}>
				{t("settings.modals.externalSummary.title", {
					source: externalImportSummary.source,
				})}
				<div className={`inset-control ${alertTextBox}`}>
					<div>
						{externalImportSummary.unmatchedMaterials.length > 0
							? t("settings.modals.externalSummary.inventorySkipped", {
									imported: Object.keys(
										externalImportSummary.inventory,
									).length,
									skipped:
										externalImportSummary.unmatchedMaterials
											.length,
								})
							: t("settings.modals.externalSummary.inventory", {
									imported: Object.keys(
										externalImportSummary.inventory,
									).length,
								})}
					</div>
					<div>
						{externalImportSummary.skippedCharacterIds.length > 0
							? t("settings.modals.externalSummary.charactersSkipped", {
									imported:
										externalImportSummary.characters.length,
									skipped:
										externalImportSummary.skippedCharacterIds
											.length,
								})
							: t("settings.modals.externalSummary.characters", {
									imported:
										externalImportSummary.characters.length,
								})}
					</div>
					<div>
						{externalImportSummary.skippedArcIds.length > 0
							? t("settings.modals.externalSummary.arcsSkipped", {
									imported: externalImportSummary.arcs.length,
									skipped:
										externalImportSummary.skippedArcIds.length,
								})
							: t("settings.modals.externalSummary.arcs", {
									imported: externalImportSummary.arcs.length,
								})}
					</div>
					{externalImportSummary.staminaPatch && (
						<div>{t("settings.modals.externalSummary.staminaUpdated")}</div>
					)}
				</div>
				{(externalImportSummary.hasActivitiesData ||
					externalImportSummary.hasEventsData) && (
					<div className={`inset-control ${alertTextBox}`}>
						<p>{t("settings.modals.externalSummary.activitiesUnsupported")}</p>
					</div>
				)}
			</AlertContainer>
		</ModalContainer>
	)
}

/* ------------------------------------------------------------------ */
/*  Sign-out warning                                                   */
/* ------------------------------------------------------------------ */

export function SignoutWarningModal({
	signoutWarning,
	onConfirm,
	setSignoutWarning,
}: {
	signoutWarning: boolean
	onConfirm: () => void
	setSignoutWarning: (v: boolean) => void
}) {
	const t = useT()

	if (!signoutWarning) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				onConfirm={onConfirm}
				onCancel={() => setSignoutWarning(false)}
				confirmLabel={t("settings.modals.signout.confirm")}
				cancelLabel={t("settings.modals.signout.cancel")}>
				{t("settings.modals.signout.title")}
				<br />
				<p className={alertMessage}>
					{t("settings.modals.signout.message")}
				</p>
			</AlertContainer>
		</ModalContainer>
	)
}

/* ------------------------------------------------------------------ */
/*  Erase data warning                                                 */
/* ------------------------------------------------------------------ */

export function EraseDataWarningModal({
	eraseWarning,
	onConfirm,
	setEraseWarning,
}: {
	eraseWarning: boolean
	onConfirm: () => void
	setEraseWarning: (v: boolean) => void
}) {
	const t = useT()

	if (!eraseWarning) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				onConfirm={onConfirm}
				onCancel={() => setEraseWarning(false)}
				confirmLabel={t("settings.modals.eraseAll.confirm")}
				cancelLabel={t("settings.modals.eraseAll.cancel")}>
				{t("settings.modals.eraseAll.title")}
				<br />
				<p className={alertMessage}>
					{t("settings.modals.eraseAll.message")}
				</p>
			</AlertContainer>
		</ModalContainer>
	)
}

/* ------------------------------------------------------------------ */
/*  Erase pull history warning                                         */
/* ------------------------------------------------------------------ */

export function ErasePullsWarningModal({
	erasePullsWarning,
	isSignedIn,
	onConfirm,
	setErasePullsWarning,
}: {
	erasePullsWarning: boolean
	isSignedIn: boolean
	onConfirm: () => void
	setErasePullsWarning: (v: boolean) => void
}) {
	const t = useT()

	if (!erasePullsWarning) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				onConfirm={onConfirm}
				onCancel={() => setErasePullsWarning(false)}
				confirmLabel={t("settings.modals.erasePulls.confirm")}
				cancelLabel={t("settings.modals.erasePulls.cancel")}>
				{t("settings.modals.erasePulls.title")}
				<br />
				<p className={alertMessage}>
					{isSignedIn
						? t("settings.modals.erasePulls.messageSignedIn")
						: t("settings.modals.erasePulls.message")}
				</p>
			</AlertContainer>
		</ModalContainer>
	)
}

/* ------------------------------------------------------------------ */
/*  Erase sync choice (keep / delete cloud backup)                     */
/* ------------------------------------------------------------------ */

export function EraseSyncChoiceModal({
	eraseSyncChoice,
	setEraseSyncChoice,
	eraseLocalData,
	deleteGachaBackup,
	signOut,
}: {
	eraseSyncChoice: boolean
	setEraseSyncChoice: (v: boolean) => void
	eraseLocalData: () => void
	deleteGachaBackup: (args: Record<string, never>) => Promise<unknown>
	signOut: () => void
}) {
	const t = useT()
	const cloudSync = useCloudSyncContext()

	if (!eraseSyncChoice) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-choices"
				onConfirm={() => {
					eraseLocalData()
					cloudSync.syncNow()
					// Gacha reconcile only ever merges remote pulls in, so an
					// empty local push can't erase them - the row has to go.
					deleteGachaBackup({}).catch((error) => {
						console.error("Failed to delete gacha cloud backup", error)
					})
					setEraseSyncChoice(false)
				}}
				onCancel={() => {
					eraseLocalData()
					signOut()
					setEraseSyncChoice(false)
				}}
				confirmLabel={t("settings.modals.eraseSyncChoice.confirm")}
				cancelLabel={t("settings.modals.eraseSyncChoice.cancel")}>
				{t("settings.modals.eraseSyncChoice.title")}
				<br />
				<p className={alertMessage}>
					{t("settings.modals.eraseSyncChoice.message")}
				</p>
			</AlertContainer>
		</ModalContainer>
	)
}

/* ------------------------------------------------------------------ */
/*  Unlink account warning                                             */
/* ------------------------------------------------------------------ */

export function UnlinkAccountModal({
	unlinkWarning,
	setUnlinkWarning,
	session,
	markUnlinked,
	deleteCloudBackup,
	deleteGachaBackup,
	unlinkGoogleAccount,
}: {
	unlinkWarning: boolean
	setUnlinkWarning: (v: boolean) => void
	session: Session | null
	markUnlinked: (args: Record<string, never>) => Promise<unknown>
	deleteCloudBackup: (args: Record<string, never>) => Promise<unknown>
	deleteGachaBackup: (args: Record<string, never>) => Promise<unknown>
	unlinkGoogleAccount: (accessToken?: string) => Promise<void>
}) {
	const t = useT()

	if (!unlinkWarning) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				onConfirm={async () => {
					try {
						await markUnlinked({})
						await Promise.all([
							deleteCloudBackup({}),
							deleteGachaBackup({}),
						])
					} catch (error) {
						// Don't let a failed delete trap the user into staying linked.
						console.error(
							"Failed to update Convex before unlinking",
							error,
						)
					}
					await unlinkGoogleAccount(session?.accessToken)
				}}
				onCancel={() => setUnlinkWarning(false)}
				confirmLabel={t("settings.modals.unlink.confirm")}
				cancelLabel={t("settings.modals.unlink.cancel")}>
				{t("settings.modals.unlink.title")}
				<br />
				<p className={alertMessage}>
					{t("settings.modals.unlink.message")}
				</p>
			</AlertContainer>
		</ModalContainer>
	)
}
