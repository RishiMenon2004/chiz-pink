"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"

import { api } from "@convex/_generated/api"

import { ImportedPullsResult, ImportMessage } from "@/types/pulls"

import { decryptDrop, parseDropFragment } from "@/helpers/importDrop"
import {
	importParsedPulls,
	isNteExporterData,
	parseNteExporterImport,
} from "@/helpers/importNteExporterPulls"

import pageStyles from "@/app/pulls/page.module.css"
import styles from "./externalImport.module.css"

type Status = "loading" | "ready" | "imported" | "failed"

export function ExternalImport() {
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
				<div className={pageStyles.sectionTitle}>Import Pulls</div>
				<div>From NTE History Exporter</div>
			</div>

			<div className={`inset-control ${styles.content}`}>
				{status === "loading" && <p>Fetching your pulls...</p>}

				{status === "failed" && (
					<p>
						{"This import link has expired or was already used. Export again, or "}
						<Link className="btn-anchor" href="/pulls">
							import the file instead
						</Link>
						{"."}
					</p>
				)}

				{status === "ready" && (
					<ul className={styles.bannerList}>
						{results.map((row, index) => (
							<li key={index}>
								{row.bannerName}: {row.pulls.length} pulls ({row.server})
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
								{row.message}
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
					Import {pullCount} Pulls
				</button>
			)}

			{status === "imported" && (
				<Link className={`pill-button ${styles.action}`} href="/pulls">
					View pulls
				</Link>
			)}
		</div>
	)
}
