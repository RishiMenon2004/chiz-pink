"use client"

import { useMemo, useState } from "react"

import { ImportedPullsResult } from "@/types/pulls"

import {
	importParsedPulls,
	isNteExporterData,
	parseNteExporterImport,
} from "@/helpers/importNteExporterPulls"

import styles from "./importSection.module.css"

export function ImportSection() {
	const [importMessages, setImportMessages] = useState<string[]>([])

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

					let parseResult: ImportedPullsResult | null = null
					if (isNteExporterData(parsed)) {
						parseResult = parseNteExporterImport(parsed)
					}

					let importResult: ReturnType<typeof importParsedPulls> = {
						status: "pending",
						messages: [],
					}

					if (parseResult) {
						importResult = importParsedPulls(parseResult)
						importResult.messages = [
							...parseResult.messages,
							...importResult.messages,
						]
					} else {
						importResult.status = "error"
						importResult.messages = ["Error while parsing file"]
					}

					setImportMessages(importResult.messages)
				}
				reader.readAsText(file)
			}
			input.click()
		}
	}, [])

	return (
		<div
			className={`metallic-panel ${styles.section} ${styles.importSection}`}>
			<div className={styles.sectionTitleRow}>
				<div className={styles.sectionTitle}>Import</div>
				<div>
					Export your pull history using:{" "}
					<a
						href="https://github.com/Golumpa/nte-exporter/releases"
						className="btn-anchor">
						NTE History Exporter
					</a>
				</div>
			</div>
			<div className={`inset-control ${styles.importFileDrop}`}></div>
			<button
				className={`pill-button ${styles.importButton}`}
				data-variant="normal"
				onClick={(e) => {
					e.preventDefault()
					importData()
				}}>
				Import Pulls
			</button>
			<span className={`inset-control ${styles.importMessageBox}`}>
				{importMessages.map((message, index) => {
					return <p key={index}>{message}</p>
				})}
			</span>
		</div>
	)
}
