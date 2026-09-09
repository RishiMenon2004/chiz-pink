"use client"

import { Session } from "next-auth"

import { ExternalImportResult } from "@/helpers/importExternal"

import {
	AlertContainer,
	ModalContainer,
} from "@/components/layout"
import { alertTextBox } from "@/components/layout/Alert/AlertContainer"

import { useCloudSyncContext } from "@/contexts"

/* ------------------------------------------------------------------ */
/*  Import overwrite / older warning                                   */
/* ------------------------------------------------------------------ */

export function ImportOverwriteModal({
	isImportOlder,
	askOverwrite,
	onConfirm,
	setImportOlder,
}: {
	isImportOlder: boolean
	askOverwrite: boolean
	onConfirm: () => void
	setImportOlder: (v: boolean) => void
}) {
	if (!isImportOlder && !askOverwrite) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				confirmLabel="Overwrite"
				onConfirm={onConfirm}
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
	if (!externalImportPending) return null

	return (
		<ModalContainer onClickOut={() => setExternalImportPending(null)}>
			<AlertContainer
				type="dangerous-choices"
				confirmLabel="Overwrite"
				cancelLabel="Add to Existing"
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
				{`Import ${externalImportPending.source} Data`}
				<div
					className={`inset-control ${alertTextBox}`}
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "3rem",
					}}>
					<p>
						{
							"Add to Existing: Replaces your Inventory. Appends Characters and Arcs onto your existing planner."
						}
					</p>
					<p>
						{
							"Overwrite. Replaces your Inventory, Characters, and Arcs entirely."
						}
					</p>
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
	if (!externalImportSummary) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="acknowledge"
				confirmLabel="Got it"
				onConfirm={() => setExternalImportSummary(null)}>
				{`${externalImportSummary.source} Data Imported`}
				<div className={`inset-control ${alertTextBox}`}>
					<div>
						{`Inventory: ${Object.keys(externalImportSummary.inventory).length} items imported`}
						{externalImportSummary.unmatchedMaterials.length >
							0 &&
							`, ${externalImportSummary.unmatchedMaterials.length} skipped (no match)`}
					</div>
					<div>
						{`Characters: ${externalImportSummary.characters.length} imported`}
						{externalImportSummary.skippedCharacterIds
							.length > 0 &&
							`, ${externalImportSummary.skippedCharacterIds.length} skipped (unknown character)`}
					</div>
					<div>
						{`Arcs: ${externalImportSummary.arcs.length} imported`}
						{externalImportSummary.skippedArcIds.length > 0 &&
							`, ${externalImportSummary.skippedArcIds.length} skipped (unknown arc)`}
					</div>
					{externalImportSummary.staminaPatch && (
						<div>Stamina & Pixels updated</div>
					)}
				</div>
				{(externalImportSummary.hasActivitiesData ||
					externalImportSummary.hasEventsData) && (
					<div className={`inset-control ${alertTextBox}`}>
						<p>
							{
								"Importing Activity/Event completion isn't supported yet."
							}
						</p>
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
	if (!signoutWarning) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				onConfirm={onConfirm}
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
	if (!eraseWarning) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				onConfirm={onConfirm}
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
	)
}

/* ------------------------------------------------------------------ */
/*  Erase sync choice (keep / delete cloud backup)                     */
/* ------------------------------------------------------------------ */

export function EraseSyncChoiceModal({
	eraseSyncChoice,
	setEraseSyncChoice,
	eraseLocalData,
	signOut,
}: {
	eraseSyncChoice: boolean
	setEraseSyncChoice: (v: boolean) => void
	eraseLocalData: () => void
	signOut: () => void
}) {
	const cloudSync = useCloudSyncContext()

	if (!eraseSyncChoice) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-choices"
				onConfirm={() => {
					eraseLocalData()
					cloudSync.syncNow()
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
					You will be able to use your backup when you sign back
					in.
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
	unlinkGoogleAccount,
}: {
	unlinkWarning: boolean
	setUnlinkWarning: (v: boolean) => void
	session: Session | null
	markUnlinked: (args: Record<string, never>) => Promise<unknown>
	deleteCloudBackup: (args: Record<string, never>) => Promise<unknown>
	unlinkGoogleAccount: (accessToken?: string) => Promise<void>
}) {
	if (!unlinkWarning) return null

	return (
		<ModalContainer>
			<AlertContainer
				type="dangerous-confirm"
				onConfirm={async () => {
					try {
						await markUnlinked({})
						await deleteCloudBackup({})
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
				confirmLabel="Unlink"
				cancelLabel="Keep Linked">
				Unlink your Google account?
				<br />
				<p style={{ fontSize: "0.9rem", fontWeight: "500" }}>
					This deletes your cloud backup.
				</p>
			</AlertContainer>
		</ModalContainer>
	)
}
