"use client"

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react"

import {
	applyExternalImport,
	countIncomingPulls,
	hasExistingPlannerData,
	hasIncomingPlannerData,
	type AppliedExternalImportResult,
} from "@/helpers/applyExternalImport"
import { NEW_ORIGIN } from "@/helpers/domainMigration"
import type { ExternalImportResult } from "@/helpers/importExternal"
import { isNteWizBackup, parseNteWizImport } from "@/helpers/importNteWiz"
import {
	buildNteWizBookmarklet,
	buildNteWizConsoleScript,
	buildNteWizReadableScript,
	getNteWizOrigins,
	isNteWizMigrationMessage,
	isNteWizOrigin,
	NTEWIZ_MESSAGE_CHANNEL,
	NTEWIZ_SOURCE_URL,
	type NteWizMigrationMessage,
} from "@/helpers/nteWizMigration"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import { useInitialSyncPending } from "@/helpers/syncGate"

import { useT } from "@/contexts"

import { LocaleLink } from "@/components/layout/LocaleLink"
import {
	ExternalImportPendingModal,
	ExternalImportSummaryModal,
	ImportErrorModal,
	type SettingsImportError,
} from "@/components/settings/SettingsModals"

import styles from "./ntewizMigrate.module.css"

type PopupStatus = "connecting" | "conflict" | "saving" | "done" | "error"

const HANDSHAKE_TIMEOUT_MS = 15_000
const noopSubscribe = () => () => {}

type TokenKind =
	| "plain"
	| "string"
	| "regex"
	| "keyword"
	| "global"
	| "number"
	| "prop"

const JS_TOKEN_RE =
	/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/(?:\\.|[^/\\\n])+\/[gimsuy]*|\b(?:function|var|if|else|return|try|catch|true|false|null)\b|\b(?:window|document|location|indexedDB|navigator|alert|JSON)\b|\b\d+\b|\.[A-Za-z_$][\w$]*/g

function tokenizeJs(code: string): { kind: TokenKind; text: string }[] {
	const tokens: { kind: TokenKind; text: string }[] = []
	let lastIndex = 0

	for (const match of code.matchAll(JS_TOKEN_RE)) {
		const index = match.index ?? 0
		if (index > lastIndex) {
			tokens.push({ kind: "plain", text: code.slice(lastIndex, index) })
		}

		const text = match[0]
		let kind: TokenKind = "plain"
		if (text.startsWith('"') || text.startsWith("'")) {
			kind = "string"
		} else if (text.startsWith("/")) {
			kind = "regex"
		} else if (text.startsWith(".")) {
			kind = "prop"
		} else if (/^\d/.test(text)) {
			kind = "number"
		} else if (
			/^(?:window|document|location|indexedDB|navigator|alert|JSON)$/.test(text)
		) {
			kind = "global"
		} else {
			kind = "keyword"
		}

		tokens.push({ kind, text })
		lastIndex = index + text.length
	}

	if (lastIndex < code.length) {
		tokens.push({ kind: "plain", text: code.slice(lastIndex) })
	}

	return tokens
}

const TOKEN_CLASS: Record<TokenKind, string | undefined> = {
	plain: undefined,
	string: styles.tokString,
	regex: styles.tokRegex,
	keyword: styles.tokKeyword,
	global: styles.tokGlobal,
	number: styles.tokNumber,
	prop: styles.tokProp,
}

function HighlightedScript({ code }: { code: string }) {
	const tokens = useMemo(() => tokenizeJs(code), [code])

	return (
		<pre className={`inset-control ${styles.codeBlock}`}>
			<code>
				{tokens.map((token, index) => {
					const className = TOKEN_CLASS[token.kind]
					return className ? (
						<span key={index} className={className}>
							{token.text}
						</span>
					) : (
						token.text
					)
				})}
			</code>
		</pre>
	)
}

function sendToOpener(message: NteWizMigrationMessage, origin: string) {
	window.opener?.postMessage(message, origin)
}

export function RenderNteWizMigrate() {
	const t = useT()
	const syncPending = useInitialSyncPending()

	const hasOpener = useSyncExternalStore<boolean | null>(
		noopSubscribe,
		() => window.opener !== null,
		() => null
	)
	const origin = useSyncExternalStore<string>(
		noopSubscribe,
		() => window.location.origin,
		() => NEW_ORIGIN
	)

	const bookmarkletUrl = useMemo(() => buildNteWizBookmarklet(origin), [origin])
	const consoleScript = useMemo(() => buildNteWizConsoleScript(origin), [origin])
	const readableScript = useMemo(
		() => buildNteWizReadableScript(origin),
		[origin]
	)

	const bookmarkletRef = useRef<HTMLAnchorElement | null>(null)
	useEffect(() => {
		// Assign the javascript: href via DOM ref to avoid React's unsafe URL warning.
		bookmarkletRef.current?.setAttribute("href", bookmarkletUrl)
	}, [bookmarkletUrl])

	const [popupStatus, setPopupStatus] = useState<PopupStatus>("connecting")
	const [showManualFallback, setShowManualFallback] = useState(false)
	const [pendingImport, setPendingImport] =
		useState<ExternalImportResult | null>(null)
	const [modalSummary, setModalSummary] =
		useState<AppliedExternalImportResult | null>(null)
	const [completedSummary, setCompletedSummary] =
		useState<AppliedExternalImportResult | null>(null)
	const [importError, setImportError] = useState<SettingsImportError | null>(
		null
	)

	const [pasteText, setPasteText] = useState("")
	const [copiedTarget, setCopiedTarget] = useState<
		"bookmarklet" | "console" | null
	>(null)
	const [dragHint, setDragHint] = useState(false)

	const receivedRef = useRef(false)
	const finishingRef = useRef(false)
	const openerOriginRef = useRef<string | null>(null)

	const finishPopupImport = useCallback(
		async (report: ExternalImportResult, mode: "merge" | "overwrite") => {
			if (finishingRef.current) return
			finishingRef.current = true
			setPopupStatus("saving")

			try {
				const applied = applyExternalImport(report, mode)
				await memoryStorage.flushPendingWrites()
				if (openerOriginRef.current) {
					sendToOpener(
						{ channel: NTEWIZ_MESSAGE_CHANNEL, type: "done" },
						openerOriginRef.current
					)
				}
				setCompletedSummary(applied)
				setPopupStatus("done")
			} catch (error) {
				console.error("Failed to save migrated NTEWiz data", error)
				if (openerOriginRef.current) {
					sendToOpener(
						{ channel: NTEWIZ_MESSAGE_CHANNEL, type: "error" },
						openerOriginRef.current
					)
				}
				setPopupStatus("error")
			}
		},
		[]
	)

	const finishManualImport = useCallback(
		(report: ExternalImportResult, mode: "merge" | "overwrite") => {
			const applied = applyExternalImport(report, mode)
			setModalSummary(applied)
			setCompletedSummary(applied)
			setPasteText("")
		},
		[]
	)

	const applyChosenMode = useCallback(
		(report: ExternalImportResult, mode: "merge" | "overwrite") => {
			if (hasOpener === true && openerOriginRef.current) {
				void finishPopupImport(report, mode)
			} else {
				finishManualImport(report, mode)
			}
		},
		[hasOpener, finishPopupImport, finishManualImport]
	)

	useEffect(() => {
		if (hasOpener !== true || syncPending) return

		const handshakeTimeout = setTimeout(() => {
			if (!receivedRef.current) setPopupStatus("error")
		}, HANDSHAKE_TIMEOUT_MS)

		const handleMessage = (e: MessageEvent) => {
			if (!isNteWizOrigin(e.origin) || e.source !== window.opener) return
			if (!isNteWizMigrationMessage(e.data) || e.data.type !== "data") return
			if (receivedRef.current) return
			receivedRef.current = true
			clearTimeout(handshakeTimeout)
			openerOriginRef.current = e.origin

			if (!isNteWizBackup(e.data.payload)) {
				sendToOpener(
					{ channel: NTEWIZ_MESSAGE_CHANNEL, type: "error" },
					e.origin
				)
				setPopupStatus("error")
				return
			}

			const report = parseNteWizImport(e.data.payload)
			if (hasExistingPlannerData() && hasIncomingPlannerData(report)) {
				setPendingImport(report)
				setPopupStatus("conflict")
			} else {
				void finishPopupImport(report, "merge")
			}
		}

		window.addEventListener("message", handleMessage)
		for (const allowedOrigin of getNteWizOrigins()) {
			sendToOpener(
				{ channel: NTEWIZ_MESSAGE_CHANNEL, type: "ready" },
				allowedOrigin
			)
		}

		return () => {
			window.removeEventListener("message", handleMessage)
			clearTimeout(handshakeTimeout)
		}
	}, [hasOpener, syncPending, finishPopupImport])

	const handleRawJson = useCallback(
		(raw: string) => {
			let parsed: unknown = null
			try {
				parsed = JSON.parse(raw)
			} catch (error) {
				console.error(error)
				setImportError("invalidJson")
				return
			}

			if (!isNteWizBackup(parsed)) {
				setImportError("unsupportedFormat")
				return
			}

			const report = parseNteWizImport(parsed)
			if (hasExistingPlannerData() && hasIncomingPlannerData(report)) {
				setPendingImport(report)
			} else {
				finishManualImport(report, "merge")
			}
		},
		[finishManualImport]
	)

	const handleFileUpload = () => {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "application/json"
		input.onchange = () => {
			const file = input.files?.[0]
			if (!file) return

			const reader = new FileReader()
			reader.onerror = () => {
				console.error("Failed to read NTEWiz backup file", reader.error)
				setImportError("readFailed")
			}
			reader.onload = () => {
				if (typeof reader.result !== "string") {
					setImportError("readFailed")
					return
				}
				handleRawJson(reader.result)
			}
			reader.readAsText(file)
		}
		input.click()
	}

	const copyText = async (
		text: string,
		target: "bookmarklet" | "console"
	) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopiedTarget(target)
			window.setTimeout(() => {
				setCopiedTarget((current) => (current === target ? null : current))
			}, 2500)
		} catch (error) {
			console.error("Failed to copy to clipboard", error)
		}
	}

	const isPopupView = hasOpener === true && !showManualFallback

	return (
		<main className={`page ${styles.page}`} role="main">
			{isPopupView ? (
				<section className={`metallic-panel ${styles.card} ${styles.popupCard}`}>
					<div className={styles.cardTop}>
						<h1 className={styles.title}>{t("migrate.ntewiz.title")}</h1>

						{popupStatus === "connecting" && (
							<p className={styles.statusText}>
								{t("migrate.ntewiz.popup.connecting")}
							</p>
						)}
						{popupStatus === "conflict" && (
							<p className={styles.statusText}>
								{t("migrate.ntewiz.popup.conflict")}
							</p>
						)}
						{popupStatus === "saving" && (
							<p className={styles.statusText}>
								{t("migrate.ntewiz.popup.saving")}
							</p>
						)}
						{popupStatus === "error" && (
							<div className={styles.statusGroup}>
								<p className={styles.statusText}>
									{t("migrate.ntewiz.popup.error")}
								</p>
								<button
									type="button"
									className="pill-button"
									onClick={() => setShowManualFallback(true)}>
									{t("migrate.ntewiz.popup.showManual")}
								</button>
							</div>
						)}
					</div>
					{popupStatus === "done" && completedSummary && (
						<SummaryCard summary={completedSummary} />
					)}
				</section>
			) : (
				<div className={styles.layout}>
					<section className={`metallic-panel ${styles.card} ${styles.fullWidth}`}>
						<div className={styles.cardTop}>
							<div className={styles.header}>
								<h1 className={styles.title}>{t("migrate.ntewiz.title")}</h1>
								<p className={styles.subtitle}>
									{t("migrate.ntewiz.subtitle")}
								</p>
							</div>

							<div className={`inset-control ${styles.notice}`}>
								<p>{t("migrate.ntewiz.sameBrowserNote")}</p>
							</div>
						</div>

						{completedSummary && (
							<SummaryCard summary={completedSummary} />
						)}
					</section>

					<section className={`metallic-panel ${styles.card}`}>
						<div className={styles.cardTop}>
							<div className={styles.methodHeader}>
								<h2 className={styles.sectionTitle}>
									{t("migrate.ntewiz.bookmarklet.title")}
								</h2>
								<span className={styles.recommendedTag}>
									{t("migrate.ntewiz.bookmarklet.badge")}
								</span>
							</div>
							<p className={styles.description}>
								{t("migrate.ntewiz.bookmarklet.description")}
							</p>

							<div className={styles.actionRow}>
								<a
									ref={bookmarkletRef}
									className={styles.bookmarkItem}
									draggable={true}
									onClick={(e) => {
										e.preventDefault()
										setDragHint(true)
									}}>
									<span className={styles.bookmarkFavicon} aria-hidden="true" />
									<span className={styles.bookmarkLabel}>
										{t("migrate.ntewiz.bookmarklet.button")}
									</span>
								</a>
								<button
									type="button"
									className="pill-button"
									onClick={() => void copyText(bookmarkletUrl, "bookmarklet")}>
									{copiedTarget === "bookmarklet"
										? t("migrate.ntewiz.copied")
										: t("migrate.ntewiz.bookmarklet.copyLink")}
								</button>
							</div>

							{dragHint && (
								<p className={styles.dragHint}>
									{t("migrate.ntewiz.bookmarklet.dragHint")}
								</p>
							)}
						</div>

						<ol className={`inset-control ${styles.steps}`}>
							<li>{t("migrate.ntewiz.bookmarklet.step1")}</li>
							<li>
								{t.rich("migrate.ntewiz.bookmarklet.step2", {
									link: (text) => (
										<a
											className="btn-anchor"
											href={NTEWIZ_SOURCE_URL}
											target="_blank"
											rel="noopener noreferrer">
											{text}
										</a>
									),
								})}
							</li>
							<li>{t("migrate.ntewiz.bookmarklet.step3")}</li>
						</ol>
					</section>

					<section className={`metallic-panel ${styles.card}`}>
						<div className={styles.cardTop}>
							<h2 className={styles.sectionTitle}>
								{t("migrate.ntewiz.console.title")}
							</h2>
							<p className={styles.description}>
								{t("migrate.ntewiz.console.description")}
							</p>

							<div className={styles.actionRow}>
								<a
									className="pill-button"
									href={NTEWIZ_SOURCE_URL}
									target="_blank"
									rel="noopener noreferrer">
									{t("migrate.ntewiz.console.openNteWiz")}
								</a>
								<button
									type="button"
									className="pill-button"
									onClick={() => void copyText(consoleScript, "console")}>
									{copiedTarget === "console"
										? t("migrate.ntewiz.copied")
										: t("migrate.ntewiz.console.copyScript")}
								</button>
							</div>
						</div>

						<ol className={`inset-control ${styles.steps}`}>
							<li>
								{t.rich("migrate.ntewiz.console.step1", {
									link: (text) => (
										<a
											className="btn-anchor"
											href={NTEWIZ_SOURCE_URL}
											target="_blank"
											rel="noopener noreferrer">
											{text}
										</a>
									),
								})}
							</li>
							<li>{t("migrate.ntewiz.console.step2")}</li>
							<li>{t("migrate.ntewiz.console.step3")}</li>
						</ol>

						<details className={styles.codeDetails}>
							<summary>{t("migrate.ntewiz.console.viewScript")}</summary>
							<HighlightedScript code={readableScript} />
						</details>
					</section>

					<section className={`metallic-panel ${styles.card} ${styles.fullWidth}`}>
						<div className={styles.cardTop}>
							<h2 className={styles.sectionTitle}>
								{t("migrate.ntewiz.manual.title")}
							</h2>
							<p className={styles.description}>
								{t("migrate.ntewiz.manual.description")}
							</p>
						</div>

						<div className={styles.manualRow}>
							<textarea
								className={`inset-control ${styles.pasteInput}`}
								placeholder={t("migrate.ntewiz.manual.placeholder")}
								value={pasteText}
								onChange={(e) => setPasteText(e.currentTarget.value)}
								rows={4}
							/>

							<div className={styles.manualActions}>
								<button
									type="button"
									className="pill-button"
									disabled={syncPending || pasteText.trim().length === 0}
									onClick={() => handleRawJson(pasteText)}>
									{t("migrate.ntewiz.manual.importPasted")}
								</button>
								<button
									type="button"
									className="pill-button"
									disabled={syncPending}
									onClick={handleFileUpload}>
									{t("migrate.ntewiz.manual.uploadFile")}
								</button>
							</div>
						</div>
					</section>
				</div>
			)}

			<ExternalImportPendingModal
				externalImportPending={pendingImport}
				setExternalImportPending={(value) => {
					setPendingImport(value)
					if (value === null && hasOpener === true && !finishingRef.current) {
						setPopupStatus("error")
					}
				}}
				applyExternalPlannerImport={applyChosenMode}
			/>
			<ExternalImportSummaryModal
				externalImportSummary={modalSummary}
				setExternalImportSummary={setModalSummary}
			/>
			<ImportErrorModal
				importError={importError}
				onClose={() => setImportError(null)}
			/>
		</main>
	)
}

function SummaryCard({ summary }: { summary: AppliedExternalImportResult }) {
	const t = useT()
	const totalIncomingPulls = countIncomingPulls(summary)
	const pullsImported = summary.pullsImportedCount ?? 0
	const pullsSkipped =
		(summary.pullsDuplicateCount ?? 0) + (summary.skippedPullsCount ?? 0)

	return (
		<div className={styles.summaryWrapper}>
			<div className={`inset-control ${styles.summaryBox}`}>
				<strong className={styles.summaryHeading}>
					{t("settings.modals.externalSummary.title", {
						source: summary.source,
					})}
				</strong>
				<div>
					{summary.unmatchedMaterials.length > 0
						? t("settings.modals.externalSummary.inventorySkipped", {
								imported: Object.keys(summary.inventory).length,
								skipped: summary.unmatchedMaterials.length,
							})
						: t("settings.modals.externalSummary.inventory", {
								imported: Object.keys(summary.inventory).length,
							})}
				</div>
				<div>
					{summary.skippedCharacterIds.length > 0
						? t("settings.modals.externalSummary.charactersSkipped", {
								imported: summary.characters.length,
								skipped: summary.skippedCharacterIds.length,
							})
						: t("settings.modals.externalSummary.characters", {
								imported: summary.characters.length,
							})}
				</div>
				<div>
					{summary.skippedArcIds.length > 0
						? t("settings.modals.externalSummary.arcsSkipped", {
								imported: summary.arcs.length,
								skipped: summary.skippedArcIds.length,
							})
						: t("settings.modals.externalSummary.arcs", {
								imported: summary.arcs.length,
							})}
				</div>
				{(totalIncomingPulls > 0 || (summary.skippedPullsCount ?? 0) > 0) && (
					<div>
						{pullsSkipped > 0
							? t("settings.modals.externalSummary.pullsSkipped", {
									imported: pullsImported,
									skipped: pullsSkipped,
								})
							: t("settings.modals.externalSummary.pulls", {
									imported: pullsImported,
								})}
					</div>
				)}
				{summary.staminaPatch && (
					<div>{t("settings.modals.externalSummary.staminaUpdated")}</div>
				)}
				{summary.source === "NTEWiz" && totalIncomingPulls > 0 && (
					<div className={styles.summaryNote}>
						{t("settings.modals.externalSummary.ntewizDiceNote")}
					</div>
				)}
			</div>

			<div className={styles.actionRow}>
				<LocaleLink className="pill-button" href="/pulls">
					{t("migrate.ntewiz.viewPulls")}
				</LocaleLink>
				<LocaleLink className="pill-button" href="/planner">
					{t("migrate.ntewiz.viewPlanner")}
				</LocaleLink>
				<LocaleLink className="pill-button" href="/">
					{t("migrate.ntewiz.goHome")}
				</LocaleLink>
			</div>
		</div>
	)
}
