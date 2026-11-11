"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation } from "convex/react"

import { api } from "@convex/_generated/api"

import { ImportedPullsResult, ImportMessage } from "@/types/pulls"

import { decryptDrop, parseDropFragment } from "@/helpers/importDrop"
import {
	importParsedPulls,
	isNteExporterData,
	parseNteExporterImport,
} from "@/helpers/importNteExporterPulls"

import { useT } from "@/contexts"

import { LocaleLink } from "@/components/layout"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./externalImport.module.css"

type Status = "loading" | "ready" | "imported" | "failed"

export function ExternalImport() {
	const t = useT()
	const claimDrop = useMutation(api.importDrops.claim)
	const [status, setStatus] = useState<Status>("loading")
	const [results, setResults] = useState<ImportedPullsResult[]>([])
	const [messages, setMessages] = useState<ImportMessage[]>([])
	// Effects run twice in dev, and a second claim would find the drop gone.
	const started = useRef(false)

	useEffect(() => {
		if (started.current) return
		started.current = true

		const fragment = parseDropFragment(window.location.hash)
		// Takes the key out of the address bar and browser history.
		window.history.replaceState(null, "", window.location.pathname)

		const load = async () => {
			try {
				if (!fragment) throw new Error("No drop in the link")

				const drop = await claimDrop({ dropId: fragment.dropId })
				if (!drop) throw new Error("Drop not found")

				const exports = await decryptDrop(drop, fragment.key)
				const parsed = exports
					.filter(isNteExporterData)
					.map(parseNteExporterImport)
				if (parsed.length === 0) throw new Error("No exports in the drop")

				setResults(parsed)
				setMessages(parsed.flatMap((row) => row.messages))
				setStatus("ready")
			} catch (error) {
				// Usually just an expired or reused link, which the page explains.
				console.warn(error)
				setStatus("failed")
			}
		}
		load()
	}, [claimDrop])

	const importAll = () => {
		setMessages([
			...messages,
			...results.flatMap((row) => importParsedPulls(row)),
		])
		setStatus("imported")
	}

	const pullCount = results.reduce((sum, row) => sum + row.pulls.length, 0)
	const hasErrors = messages.some((message) => message.status === "error")

	return (
		<div
			className={`metallic-panel ${pageStyles.section} ${styles.externalImport}`}>
			<div className={pageStyles.sectionTitleRow}>
				<div className={pageStyles.sectionTitle}>{t("pulls.external.title")}</div>
				<div>{t("pulls.external.source")}</div>
			</div>

			<div className={`inset-control ${styles.content}`}>
				{status === "loading" && <p>{t("pulls.external.loading")}</p>}

				{status === "failed" && (
					<p>
						{t.rich("pulls.external.failed", {
							link: (text) => (
								<LocaleLink className="btn-anchor" href="/pulls">
									{text}
								</LocaleLink>
							),
						})}
					</p>
				)}

				{status === "ready" && (
					<ul className={styles.bannerList}>
						{results.map((row, index) => (
							<li key={index}>
								{t("pulls.external.bannerRow", {
									bannerName: row.bannerName,
									count: row.pulls.length,
									server: row.server,
								})}
							</li>
						))}
					</ul>
				)}

				{status !== "failed" && messages.length > 0 && (
					<div className={styles.messageBox}>
						{messages.map((row, index) => (
							<p
								key={index}
								data-type={row.status}
								className={styles.message}>
								{t(row.message, row.params)}
							</p>
						))}
					</div>
				)}
			</div>

			{status === "ready" && (
				<button
					className={`pill-button ${styles.action}`}
					disabled={hasErrors || pullCount === 0}
					onClick={importAll}>
					{t("pulls.import.importButton", { count: pullCount })}
				</button>
			)}

			{status === "imported" && (
				<LocaleLink className={`pill-button ${styles.action}`} href="/pulls">
					{t("pulls.external.viewPulls")}
				</LocaleLink>
			)}
		</div>
	)
}
