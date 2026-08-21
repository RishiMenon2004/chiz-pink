"use client"

import Link from "next/link"
import {
	ChangeEventHandler,
	DetailedHTMLProps,
	InputHTMLAttributes,
	ReactNode,
	useMemo,
	useState,
} from "react"
import { signOut, useSession } from "next-auth/react"
import { useMutation } from "convex/react"

import { api } from "@convex/_generated/api"

import { BackupData, SettingsRecord } from "@/types/settings"
import { ExternalImportResult } from "@/helpers/importExternal"

import {
	plannerActions,
	replaceInventory,
	settingsActions,
	updateInventory,
	useNow,
	usePWAInstall,
	useSettingsStore,
} from "@/hooks"

import {
	backupExport,
	backupImport,
	backupSetImport,
	eraseLocalData,
	formatTimeRemaining,
	getNextPixelRecoveryTime,
	getPixelsRefillTime,
	getWeeklyResetBoundaries,
	isNtePlannerBackup,
	isNteWizBackup,
	parseNtePlannerImport,
	parseNteWizImport,
	signInWithGooglePopup,
	unlinkGoogleAccount,
} from "@/helpers"

import { useCloudSyncContext } from "@/contexts"

import {
	AlertContainer,
	InstallPWAButton,
	ModalContainer,
} from "@/components/layout"

import styles from "./settings.module.css"
import { alertTextBox } from "@/components/layout/Alert/AlertContainer"

const syncStatusLabel = {
	idle: "Not Synced",
	syncing: "Syncing...",
	synced: "Synced",
	error: "Sync Failed",
}

function SectionColumns({ children }: { children: ReactNode }) {
	return <div className={styles.twoColumns}>{children}</div>
}

function Section({ children }: { children: ReactNode }) {
	return (
		<div className={`metallic-panel ${styles.settingsSection}`}>
			{children}
		</div>
	)
}
function TitleBar({ children, title }: { children?: ReactNode; title: string }) {
	return (
		<div className={styles.settingsSectionTitlebar}>
			<Title>{title}</Title>
			{children}
		</div>
	)
}
function Title({ children }: { children: ReactNode }) {
	return <div className={styles.settingsSectionTitle}>{children}</div>
}
function Content({ children }: { children: ReactNode }) {
	return <div className={styles.settingsSectionContent}>{children}</div>
}
function ContentRow({
	children,
	buttonRow,
	equalColumns,
}: {
	children: ReactNode
	buttonRow?: boolean
	equalColumns?: boolean
}) {
	return (
		<div
			className={`${styles.settingsSectionContentRow} ${buttonRow ? styles.buttonRow : ""} ${equalColumns ? styles.equalColumns : ""}`}>
			{children}
		</div>
	)
}
function ContentColumn({ children }: { children: ReactNode }) {
	return <span className={styles.settingsSectionContentColumn}>{children}</span>
}
function Blockquote({ children }: { children: ReactNode }) {
	return (
		<span className={`inset-control ${styles.settingsBlockquote}`}>
			{children}
		</span>
	)
}

function BETATag() {
	return (
		<span
			style={{
				borderRadius: "100vh",
				backgroundColor: "#ffa600",
				padding: "0.25rem 0.5rem",
				color: "black",
				fontFamily: "var(--font-syne)",
				fontSize: "0.7em",
				fontWeight: 720,
				fontStyle: "normal",
				marginRight: "0.25rem",
				marginLeft: "-0.675rem",
				height: "fit-content",
				userSelect: "none",
			}}>
			BETA
		</span>
	)
}

export function ConfigCheckbox({
	checked,
	onChange,
	name,
}: {
	name: string
	checked: boolean
	onChange: ChangeEventHandler<HTMLInputElement>
}) {
	return (
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				alignItems: "center",
				flexWrap: "nowrap",
			}}>
			<input
				className={`inset-control ${styles.configInput}`}
				name={name}
				type="checkbox"
				checked={checked}
				onChange={onChange}
			/>
			<b>{name}</b>
		</div>
	)
}
function ConfigInputbox(
	props: DetailedHTMLProps<
		InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	> & {
		children?: ReactNode
	}
) {
	const { children, ...inputProps } = props
	return (
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				flexDirection: "column",
				alignItems: "flex-start",
			}}>
			<b>{inputProps.name}</b>
			<input
				className={`inset-control ${styles.configInput}`}
				{...inputProps}
			/>
			{children}
		</div>
	)
}
function ConfigNumberBox({
	name,
	value,
	onChange,
	children,
	min,
	max,
	step = 1,
}: {
	name: string
	value: number
	onChange: (value: number) => void
	children?: ReactNode
	min?: number
	max?: number
	step?: number
}) {
	const clamp = (next: number) => {
		let result = next
		if (min !== undefined) result = Math.max(result, min)
		if (max !== undefined) result = Math.min(result, max)
		return result
	}

	const step_ = (delta: number) => {
		onChange(clamp(value + delta))
	}

	return (
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				flexDirection: "column",
				alignItems: "flex-start",
				width: "100%",
			}}>
			<b>{name}</b>
			<div className={`inset-control ${styles.numberStepper}`}>
				<span
					role="button"
					tabIndex={-1}
					aria-label={`Decrease ${name}`}
					className={`${styles.stepperBtn} ${styles.minus}`}
					onClick={() => step_(-step)}
				/>
				<input
					name={name}
					className={`inset-control ${styles.configInput}`}
					type="text"
					pattern="[0-9]*"
					inputMode="numeric"
					value={value || 0}
					onChange={(e) => {
						const digits = e.currentTarget.value.replace(/\D/g, "")
						onChange(digits === "" ? 0 : clamp(parseInt(digits)))
					}}
				/>
				<span
					role="button"
					tabIndex={-1}
					aria-label={`Increase ${name}`}
					className={`${styles.stepperBtn} ${styles.plus}`}
					onClick={() => step_(step)}
				/>
			</div>
			{children}
		</div>
	)
}
function ConfigSelect({
	name,
	value,
	onChange,
	children,
}: {
	name: string
	value?: string | number | readonly string[]
	onChange: ChangeEventHandler<HTMLSelectElement>
	children: ReactNode
}) {
	return (
		<div
			style={{
				flexGrow: 1,
				display: "flex",
				gap: "0.5rem",
				flexDirection: "column",
				alignItems: "flex-start",
			}}>
			<b>{name}</b>
			<select
				className={`inset-control ${styles.configSelect}`}
				name={name}
				value={value}
				onChange={onChange}>
				{children}
			</select>
		</div>
	)
}

const dateDisplayConfig: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "short",
	day: "2-digit",
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
}

const formatDate = (date: number): string => {
	return new Date(date).toLocaleString("en-GB", dateDisplayConfig).toUpperCase()
}

const resetDayTimeConfig: Intl.DateTimeFormatOptions = {
	weekday: "long",
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
}

const formatResetDayTime = (date: number): string => {
	return new Date(date)
		.toLocaleString("en-GB", resetDayTimeConfig)
		.toUpperCase()
}

export function StaminaResetCountdown({
	server,
}: {
	server: SettingsRecord["userdata"]["server"]
}) {
	const now = useNow()

	const content =
		now === null
			? "Reset in: -"
			: (() => {
					const { nextReset } = getWeeklyResetBoundaries(server, now)
					return `Reset in: ${formatTimeRemaining(nextReset - now)} at ${formatResetDayTime(nextReset)}`
				})()

	return (
		<div
			style={{
				fontFamily: "var(--font-barlow-condensed)",
				fontStyle: "italic",
				display: "flex",
				flexDirection: "row",
				flexWrap: "wrap",
				justifyContent: "space-between",
				width: "100%",
				paddingInline: "0.5rem",
				gap: "0.25rem 0.5rem",
			}}>
			<div>{content}</div>
		</div>
	)
}

export function PixelRefillCountdown({
	current,
	max,
	lastEdited,
}: {
	current: number
	max: number
	lastEdited: number
}) {
	const now = useNow()
	// Lazy initializer (not an effect) so this is captured once on mount,
	// same value on the server and the first client render.
	const [mountTime] = useState(() => Date.now())

	let nextText = "-"
	let fullText = "-"

	if (now !== null) {
		const baseline = lastEdited || mountTime

		const refilledAt = getPixelsRefillTime({
			current,
			max,
			lastEdited: baseline,
		})

		const nextRecoveryAt = getNextPixelRecoveryTime({
			current,
			max,
			lastEdited: baseline,
			now,
		})

		nextText =
			nextRecoveryAt === null
				? "-"
				: formatTimeRemaining(nextRecoveryAt - now)
		fullText =
			refilledAt === null ? "-" : formatTimeRemaining(refilledAt - now)
	}

	return (
		<div
			style={{
				fontFamily: "var(--font-barlow-condensed)",
				fontStyle: "italic",
				display: "flex",
				flexDirection: "row",
				flexWrap: "wrap",
				justifyContent: "space-between",
				width: "100%",
				paddingInline: "0.5rem",
				gap: "0.25rem 0.5rem",
			}}>
			<div>{`Next: ${nextText}`}</div>
			<div>{`Full: ${fullText}`}</div>
		</div>
	)
}

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
	const cloudSync = useCloudSyncContext()
	const deleteCloudBackup = useMutation(api.backups.deleteBackup)
	const markUnlinked = useMutation(api.accountStatus.markUnlinked)
	let email: string | null | undefined = "Not Linked"
	if (status === "authenticated") email = session?.user?.email

	const { settings, actions } = useSettingsStore()

	const { isStandalone } = usePWAInstall()

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
			<Section>
				<TitleBar title="APPRAISER" />

				<Content>
					<ContentRow equalColumns>
						<ConfigInputbox
							name="Nickname"
							value={settings.userdata.nickname}
							placeholder="Appraiser"
							type="text"
							onChange={(e) => {
								actions.setConfig("userdata", {
									nickname: e.currentTarget.value,
								})
							}}
						/>
						<ConfigSelect
							name="Server"
							value={settings.userdata.server}
							onChange={(e) => {
								actions.setConfig("userdata", {
									server: e.currentTarget
										.value as SettingsRecord["userdata"]["server"],
								})
							}}>
							<option value="America">America</option>
							<option value="Europe">Europe</option>
							<option value="Asia">Asia</option>
							<option value="SEA">SEA</option>
						</ConfigSelect>
					</ContentRow>

					<div className={styles.pixelStaminaGrid}>
						<ConfigNumberBox
							name="Character Pixels"
							min={0}
							max={999}
							value={settings.userdata["current-pixels"]}
							onChange={(value) => {
								actions.setConfig("userdata", {
									"current-pixels": value,
									"pixels-last-edited": Date.now(),
								})
							}}>
							<PixelRefillCountdown
								current={settings.userdata["current-pixels"]}
								max={settings.userdata["max-pixels"]}
								lastEdited={
									settings.userdata["pixels-last-edited"]
								}
							/>
						</ConfigNumberBox>
						<ConfigNumberBox
							name="Max Pixels"
							min={0}
							value={settings.userdata["max-pixels"]}
							onChange={(value) => {
								actions.setConfig("userdata", {
									"max-pixels": value,
								})
							}}
						/>
						<ConfigNumberBox
							name="City Stamina"
							min={0}
							max={settings.userdata["max-stamina"]}
							value={settings.userdata["current-stamina"]}
							onChange={(value) => {
								actions.setConfig("userdata", {
									"current-stamina": value,
								})
							}}>
							<StaminaResetCountdown
								server={settings.userdata.server}
							/>
						</ConfigNumberBox>
						<ConfigNumberBox
							name="Max Stamina"
							min={0}
							value={settings.userdata["max-stamina"]}
							onChange={(value) => {
								actions.setConfig("userdata", {
									"max-stamina": value,
								})
							}}
						/>
					</div>
				</Content>
			</Section>

			<SectionColumns>
				<Section>
					<TitleBar title="LOCAL DATA" />

					<Content>
						<ContentColumn>
							Manage the data stored in the Local Storage of your
							browser.
							<Blockquote>
								<BETATag />
								<span
									style={{
										display: "flex",
										flexWrap: "wrap",
										gap: "0.5ch",
									}}>
									{
										"Migrating from another app? Import compatible data from: "
									}
									<span>
										<Link
											className="btn-anchor"
											href="https://nteplanner.app/"
											target="_blank">
											NTE Planner
										</Link>
										{", "}
									</span>
									<Link
										className="btn-anchor"
										href="https://www.ntewiz.xyz/"
										target="_blank">
										NTEWiz
									</Link>
								</span>
							</Blockquote>
						</ContentColumn>
						<ContentRow buttonRow>
							<button
								className={`pill-button ${styles.configButton}`}
								data-variant="normal"
								onClick={(e) => {
									e.preventDefault()
									backupExport()
								}}>
								Export Data
							</button>
							<button
								className={`pill-button ${styles.configButton}`}
								data-variant="normal"
								onClick={(e) => {
									e.preventDefault()
									importData()
								}}>
								Import Data
							</button>
							<button
								className={`pill-button ${styles.configButton}`}
								data-variant="danger"
								onClick={() => setEraseWarning(true)}>
								Erase Data
							</button>
						</ContentRow>
					</Content>
				</Section>

				<Section>
					<TitleBar title="CLOUD BACKUP">
						{status === "authenticated" && (
							<span className={styles.settingsCloudStatus}>
								<span
									className={`${styles.settingsCloudStatusLabel} ${styles[cloudSync.status]}`}>
									{syncStatusLabel[
										cloudSync.status
									].toUpperCase()}
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
										fontFamily:
											"var(--font-barlow-condensed)",
										letterSpacing: "5%",
									}}>
									{cloudSync.latestBackupUpdatedAt
										? formatDate(
												cloudSync.latestBackupUpdatedAt
											)
										: "NO BACKUP"}
								</span>
							</ContentRow>

							<ContentRow buttonRow>
								<button
									className={`pill-button ${styles.configButton}`}
									data-variant="normal"
									onClick={() => setSignoutWarning(true)}>
									Sign Out
								</button>
								<button
									className={`pill-button ${styles.configButton}`}
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
									className={`pill-button ${styles.configButton}`}
									data-variant="normal"
									onClick={() => signInWithGooglePopup()}>
									Sign In
								</button>
							</ContentRow>
						</Content>
					)}
				</Section>
			</SectionColumns>
			{!isStandalone && (
				<Section>
					<TitleBar title="INSTALL AS PWA" />

					<Content>
						<ContentColumn>
							Install Chiz.Pink as a native app on any device with a
							supported browser.
							<Blockquote>
								{"Use it on the go or when you're offline too!"}
							</Blockquote>
						</ContentColumn>

						<ContentRow buttonRow>
							<InstallPWAButton type="button" />
						</ContentRow>
					</Content>
				</Section>
			)}

			<Section>
				<TitleBar title="APPEARANCE" />
				<Content>
					<ContentRow equalColumns>
						<ContentColumn>
							<ConfigCheckbox
								name="Custom Cursors"
								checked={settings.appearance["use-cursors"]}
								onChange={(e) =>
									actions.setConfig("appearance", {
										"use-cursors": e.currentTarget.checked,
									})
								}
							/>
						</ContentColumn>

						<ContentColumn>
							<ConfigCheckbox
								name="Hybrid Planner"
								checked={
									settings.appearance["use-hybrid-planner"] ??
									false
								}
								onChange={(e) =>
									actions.setConfig("appearance", {
										"use-hybrid-planner":
											e.currentTarget.checked,
									})
								}
							/>
						</ContentColumn>
					</ContentRow>
				</Content>
				<TitleBar title="BEHAVIOUR" />
				<Content>
					<ContentRow equalColumns>
						<ContentColumn>
							<ConfigCheckbox
								checked={settings.behaviour["auto-claim"]}
								onChange={(e) =>
									actions.setConfig("behaviour", {
										"auto-claim": e.currentTarget.checked,
									})
								}
								name="Daily Tasks: Add to Inventory"
							/>
						</ContentColumn>
						<ContentColumn>
							<ConfigCheckbox
								name={`Calendar: ${
									settings.behaviour[
										"calendar-day-boundary"
									] === "server"
										? "Server Time"
										: "Local Time"
								}`}
								checked={
									(settings.behaviour[
										"calendar-day-boundary"
									] ?? "server") === "local"
								}
								onChange={(e) =>
									actions.setConfig("behaviour", {
										"calendar-day-boundary": e.currentTarget
											.checked
											? "local"
											: "server",
									})
								}
							/>
						</ContentColumn>
					</ContentRow>
				</Content>
			</Section>

			{/* alert modals */}
			{(isImportOlder || askOverwrite) && (
				<ModalContainer>
					<AlertContainer
						type="dangerous-confirm"
						confirmLabel="Overwrite"
						onConfirm={() => {
							if (importedJson !== null) {
								backupSetImport(importedJson)
							}
							setAskOverwrite(false)
						}}
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
			)}
			{externalImportPending && (
				<ModalContainer onClickOut={() => setExternalImportPending(null)}>
					<AlertContainer
						type="dangerous-choices"
						confirmLabel="Overwrite"
						cancelLabel="Add to Existing"
						onConfirm={() => {
							applyExternalPlannerImport(
								externalImportPending,
								"overwrite"
							)
							setExternalImportPending(null)
						}}
						onCancel={() => {
							applyExternalPlannerImport(
								externalImportPending,
								"merge"
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
			)}
			{externalImportSummary && (
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
			)}
			{signoutWarning && (
				<ModalContainer>
					<AlertContainer
						type="dangerous-confirm"
						onConfirm={() => signOut()}
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
			)}
			{eraseWarning && (
				<ModalContainer>
					<AlertContainer
						type="dangerous-confirm"
						onConfirm={() => {
							setEraseWarning(false)
							if (status === "authenticated") {
								setEraseSyncChoice(true)
							} else {
								eraseLocalData()
							}
						}}
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
			)}
			{eraseSyncChoice && (
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
			)}
			{unlinkWarning && (
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
									error
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
			)}
		</main>
	)
}
