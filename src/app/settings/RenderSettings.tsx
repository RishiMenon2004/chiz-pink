"use client"

import { signOut, useSession } from "next-auth/react"
import { useMutation } from "convex/react"
import { useMemo, useState } from "react"

import { api } from "@convex/_generated/api"

import { BackupData } from "@/types/settings"

import {
	plannerActions,
	replaceInventory,
	settingsActions,
	updateInventory,
} from "@/hooks"

import { ExternalImportResult } from "@/helpers/importExternal"

import {
	backupImport,
	backupSetImport,
	eraseLocalData,
	isNtePlannerBackup,
	isNteWizBackup,
	parseNtePlannerImport,
	parseNteWizImport,
	unlinkGoogleAccount,
} from "@/helpers"

import {
	AppearanceSection,
	BehaviourSection,
	CloudBackupSection,
	LocalDataSection,
	PWAInstallSection,
	AppraiserSection,
} from "@/components/settings"
import { Section, SectionColumns } from "@/components/settings/SettingsShared"
import {
	ExternalImportPendingModal,
	ExternalImportSummaryModal,
	EraseDataWarningModal,
	EraseSyncChoiceModal,
	ImportOverwriteModal,
	SignoutWarningModal,
	UnlinkAccountModal,
} from "@/components/settings/SettingsModals"

import styles from "./settings.module.css"

function hasExistingPlannerData() {
	const inventory = JSON.parse(localStorage.getItem("inventory") || "{}")
	const planner = JSON.parse(localStorage.getItem("planner") || "{}")

	return (
		Object.keys(inventory).length > 0 ||
		Object.keys(planner.characters ?? {}).length > 0 ||
		Object.keys(planner.arcs ?? {}).length > 0
	)
}

export function RenderSettings() {
	const { data: session, status } = useSession()
	const deleteCloudBackup = useMutation(api.backups.deleteBackup)
	const markUnlinked = useMutation(api.accountStatus.markUnlinked)

	const [isImportOlder, setImportOlder] = useState<boolean>(false)
	const [askOverwrite, setAskOverwrite] = useState<boolean>(false)
	const [signoutWarning, setSignoutWarning] = useState<boolean>(false)
	const [unlinkWarning, setUnlinkWarning] = useState<boolean>(false)
	const [eraseWarning, setEraseWarning] = useState<boolean>(false)
	const [eraseSyncChoice, setEraseSyncChoice] = useState<boolean>(false)
	const [importedJson, setImportedJson] = useState<BackupData | null>(null)
	const [externalImportPending, setExternalImportPending] =
		useState<ExternalImportResult | null>(null)
	const [externalImportSummary, setExternalImportSummary] =
		useState<ExternalImportResult | null>(null)

	const applyExternalPlannerImport = useMemo(() => {
		return (report: ExternalImportResult, mode: "merge" | "overwrite") => {
			if (mode === "overwrite") {
				replaceInventory(report.inventory)
				plannerActions.updatePlanner(() => ({ characters: {}, arcs: {} }))
			} else if (Object.keys(report.inventory).length > 0) {
				updateInventory(report.inventory)
			}

			report.characters.forEach(({ character }) =>
				plannerActions.addCharacter(character)
			)

			report.arcs.forEach(({ arc }) => plannerActions.addWeapon(arc))

			if (report.staminaPatch) {
				settingsActions.setConfig("userdata", report.staminaPatch)
			}

			setExternalImportSummary(report)
		}
	}, [])

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

					let parsed: unknown = null
					try {
						parsed = JSON.parse(result)
					} catch (error) {
						console.error(error)
						return
					}

					let report: ExternalImportResult | null = null

					if (isNtePlannerBackup(parsed)) {
						report = parseNtePlannerImport(parsed)
					} else if (isNteWizBackup(parsed)) {
						report = parseNteWizImport(parsed)
					}

					if (report) {
						if (hasExistingPlannerData()) {
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
				/>
				<CloudBackupSection
					setSignoutWarning={setSignoutWarning}
					setUnlinkWarning={setUnlinkWarning}
				/>
			</SectionColumns>

			<PWAInstallSection />

			<Section>
				<AppearanceSection />
				<BehaviourSection />
			</Section>

			<ImportOverwriteModal
				isImportOlder={isImportOlder}
				askOverwrite={askOverwrite}
				onConfirm={() => {
					if (importedJson !== null) {
						backupSetImport(importedJson)
					}
					setAskOverwrite(false)
				}}
				setImportOlder={setImportOlder}
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
			<EraseSyncChoiceModal
				eraseSyncChoice={eraseSyncChoice}
				setEraseSyncChoice={setEraseSyncChoice}
				eraseLocalData={eraseLocalData}
				signOut={() => signOut()}
			/>
			<UnlinkAccountModal
				unlinkWarning={unlinkWarning}
				setUnlinkWarning={setUnlinkWarning}
				session={session}
				markUnlinked={markUnlinked}
				deleteCloudBackup={deleteCloudBackup}
				unlinkGoogleAccount={unlinkGoogleAccount}
			/>
		</main>
	)
}
