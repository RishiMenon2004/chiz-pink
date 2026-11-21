"use client"

import { signOut, useSession } from "next-auth/react"
import { useMemo, useState } from "react"

import { BackupData } from "@/types/settings"

import {
	applyExternalImport,
	hasExistingPlannerData,
	hasIncomingPlannerData,
	type AppliedExternalImportResult,
} from "@/helpers/applyExternalImport"
import { ExternalImportResult } from "@/helpers/importExternal"
import { unlinkGoogleAccount } from "@/helpers/unlinkGoogleAccount"

import {
	backupImport,
	backupSetImport,
	eraseLocalData,
	erasePullHistory,
	isNtePlannerBackup,
	isNteWizBackup,
	parseNtePlannerImport,
	parseNteWizImport,
} from "@/helpers"

import { useCloudSyncContext } from "@/contexts"

import {
	AppearanceSection,
	BehaviourSection,
	CloudBackupSection,
	LanguageSection,
	LocalDataSection,
	PWAInstallSection,
	AppraiserSection,
} from "@/components/settings"
import { Section, SectionColumns } from "@/components/settings/SettingsShared"
import {
	CloudEraseErrorModal,
	ExternalImportPendingModal,
	ExternalImportSummaryModal,
	EraseDataWarningModal,
	ErasePullsWarningModal,
	EraseSyncChoiceModal,
	ImportErrorModal,
	ImportOverwriteModal,
	SignoutWarningModal,
	UnlinkAccountModal,
	type SettingsImportError,
} from "@/components/settings/SettingsModals"

import styles from "./settings.module.css"

export function RenderSettings() {
	const { data: session, status } = useSession()
	const { deleteCloudBackup, deleteGachaBackup, markUnlinked } =
		useCloudSyncContext()

	const [isImportOlder, setImportOlder] = useState<boolean>(false)
	const [askOverwrite, setAskOverwrite] = useState<boolean>(false)
	const [signoutWarning, setSignoutWarning] = useState<boolean>(false)
	const [unlinkWarning, setUnlinkWarning] = useState<boolean>(false)
	const [eraseWarning, setEraseWarning] = useState<boolean>(false)
	const [eraseSyncChoice, setEraseSyncChoice] = useState<boolean>(false)
	const [erasePullsWarning, setErasePullsWarning] = useState<boolean>(false)
	const [importedJson, setImportedJson] = useState<BackupData | null>(null)
	const [externalImportPending, setExternalImportPending] =
		useState<ExternalImportResult | null>(null)
	const [externalImportSummary, setExternalImportSummary] =
		useState<AppliedExternalImportResult | null>(null)
	const [importError, setImportError] = useState<SettingsImportError | null>(
		null
	)
	const [cloudEraseError, setCloudEraseError] = useState<boolean>(false)

	const applyExternalPlannerImport = useMemo(() => {
		return (report: ExternalImportResult, mode: "merge" | "overwrite") => {
			setExternalImportSummary(applyExternalImport(report, mode))
		}
	}, [])

	const closeImportOverwrite = () => {
		setImportOlder(false)
		setAskOverwrite(false)
		setImportedJson(null)
	}

	const importData = useMemo(() => {
		return () => {
			const input = document.createElement("input")
			input.type = "file"
			input.accept = "application/json"
			input.onchange = () => {
				const file = input.files?.[0]
				if (!file) return

				const reader = new FileReader()
				reader.onerror = () => {
					console.error("Failed to read backup file", reader.error)
					setImportError("readFailed")
				}
				reader.onload = () => {
					if (typeof reader.result !== "string") {
						setImportError("readFailed")
						return
					}
					const result = reader.result

					let parsed: unknown = null
					try {
						parsed = JSON.parse(result)
					} catch (error) {
						console.error(error)
						setImportError("invalidJson")
						return
					}

					let report: ExternalImportResult | null = null

					if (isNtePlannerBackup(parsed)) {
						report = parseNtePlannerImport(parsed)
					} else if (isNteWizBackup(parsed)) {
						report = parseNteWizImport(parsed)
					}

					if (report) {
						if (hasExistingPlannerData() && hasIncomingPlannerData(report)) {
							setExternalImportPending(report)
						} else {
							applyExternalPlannerImport(report, "merge")
						}
						return
					}

					const importResult = backupImport(result)
					const { status, data } = importResult

					switch (status) {
						case "error":
							setImportError("unsupportedFormat")
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
	}, [applyExternalPlannerImport])

	return (
		<main className={`page ${styles.page}`} role="main">
			<AppraiserSection />

			<SectionColumns>
				<LocalDataSection
					importData={importData}
					setEraseWarning={setEraseWarning}
					setErasePullsWarning={setErasePullsWarning}
				/>
				<CloudBackupSection
					setSignoutWarning={setSignoutWarning}
					setUnlinkWarning={setUnlinkWarning}
				/>
			</SectionColumns>

			<PWAInstallSection />

			<Section>
				<LanguageSection />
				<AppearanceSection />
				<BehaviourSection />
			</Section>

			<ImportErrorModal
				importError={importError}
				onClose={() => setImportError(null)}
			/>
			<CloudEraseErrorModal
				open={cloudEraseError}
				onClose={() => setCloudEraseError(false)}
			/>
			<ImportOverwriteModal
				isImportOlder={isImportOlder}
				askOverwrite={askOverwrite}
				onConfirm={() => {
					if (importedJson !== null) {
						backupSetImport(importedJson)
					}
					closeImportOverwrite()
				}}
				onCancel={closeImportOverwrite}
			/>
			<ExternalImportPendingModal
				externalImportPending={externalImportPending}
				setExternalImportPending={setExternalImportPending}
				applyExternalPlannerImport={applyExternalPlannerImport}
			/>
			<ExternalImportSummaryModal
				externalImportSummary={externalImportSummary}
				setExternalImportSummary={setExternalImportSummary}
			/>
			<SignoutWarningModal
				signoutWarning={signoutWarning}
				onConfirm={() => signOut()}
				setSignoutWarning={setSignoutWarning}
			/>
			<EraseDataWarningModal
				eraseWarning={eraseWarning}
				onConfirm={() => {
					setEraseWarning(false)
					if (status === "authenticated") {
						setEraseSyncChoice(true)
					} else {
						eraseLocalData()
					}
				}}
				setEraseWarning={setEraseWarning}
			/>
			<ErasePullsWarningModal
				erasePullsWarning={erasePullsWarning}
				isSignedIn={status === "authenticated"}
				onConfirm={() => {
					setErasePullsWarning(false)
					erasePullHistory()
					if (status === "authenticated") {
						deleteGachaBackup({}).catch((error) => {
							console.error(
								"Failed to delete gacha cloud backup",
								error
							)
							setCloudEraseError(true)
						})
					}
				}}
				setErasePullsWarning={setErasePullsWarning}
			/>
			<EraseSyncChoiceModal
				eraseSyncChoice={eraseSyncChoice}
				setEraseSyncChoice={setEraseSyncChoice}
				eraseLocalData={eraseLocalData}
				deleteGachaBackup={deleteGachaBackup}
				onDeleteGachaError={() => setCloudEraseError(true)}
				signOut={() => signOut()}
			/>
			<UnlinkAccountModal
				unlinkWarning={unlinkWarning}
				setUnlinkWarning={setUnlinkWarning}
				session={session}
				markUnlinked={markUnlinked}
				deleteCloudBackup={deleteCloudBackup}
				deleteGachaBackup={deleteGachaBackup}
				unlinkGoogleAccount={unlinkGoogleAccount}
			/>
		</main>
	)
}
