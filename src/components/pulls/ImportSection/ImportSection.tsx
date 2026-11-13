"use client"

import { DragEventHandler, MouseEventHandler, useMemo, useState } from "react"

import { ImportedPullsResult, ImportMessage } from "@/types/pulls"

import {
	importParsedPulls,
	isNteExporterData,
	parseNteExporterImport,
} from "@/helpers/importNteExporterPulls"

import { usePullTrackerContext, useT } from "@/contexts"

import { ManualPullEntry } from "../ManualPullEntry"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./importSection.module.css"

export function ImportSection() {
	const t = useT()
	const { selectedBanner } = usePullTrackerContext()
	const [importMessages, setImportMessages] = useState<ImportMessage[]>([])
	const [parsedData, setParsedData] = useState<ImportedPullsResult>(null!)
	const [fileName, setFileName] = useState<string>(null!)
	const [fileDragHover, setfileDragOver] = useState<boolean>(false)

	const parseData = useMemo(() => {
		return (file: File) => {
			const reader = new FileReader()
			reader.onload = () => {
				const result = reader.result as string

				let parsed: unknown = null
				try {
					parsed = JSON.parse(result)
				} catch (error) {
					console.error(error)
					setImportMessages([
						{
							message: "pulls.import.messages.readFailed",
							params: { error: String(error) },
							status: "error",
						},
					])
					return
				}

				if (isNteExporterData(parsed)) {
					const parsedImport = parseNteExporterImport(parsed)
					setParsedData(parsedImport)
					setImportMessages(parsedImport.messages)
					setFileName(file.name)
				} else {
					setImportMessages([
						{
							message: "pulls.import.messages.unrecognisedFile",
							status: "warn",
						},
					])
				}
			}
			reader.readAsText(file)
		}
	}, [])

	const importData = () => {
		let importResult: ReturnType<typeof importParsedPulls> = []

		if (parsedData) {
			importResult = importParsedPulls(parsedData)
			importResult = [...parsedData.messages, ...importResult]
		} else {
			importResult = [
				{ message: "pulls.import.messages.parseFailed", status: "error" },
			]
		}

		setImportMessages(importResult)
	}

	const clearImports: MouseEventHandler = (e) => {
		e.stopPropagation()

		setParsedData(null!)
		setFileName(null!)
		setImportMessages([])
	}

	const openFileSelect: MouseEventHandler = (e) => {
		e.preventDefault()
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "application/json"
		input.onchange = () => {
			const file = input.files?.[0]
			if (!file) return
			parseData(file)
		}
		input.click()
	}

	const handleDrop: DragEventHandler = (e) => {
		e.preventDefault()
		setfileDragOver(false)
		const file = e.dataTransfer.files?.[0]
		if (!file) return
		parseData(file)
	}

	return (
		<div
			className={`metallic-panel ${pageStyles.section} ${styles.importSection}`}>
			<div className={pageStyles.sectionTitleRow}>
				<div className={pageStyles.sectionTitle}>{t("pulls.import.title")}</div>
				<div>
					{t.rich("pulls.import.description", {
						link: (text) => (
							<a
								href="https://github.com/RishiMenon2004/nte-exporter/releases/latest"
								target="_blank">
								{text}
							</a>
						),
					})}
				</div>
			</div>
			<div
				onDragEnter={() => {
					setfileDragOver(true)
				}}
				onDragExit={() => {
					setfileDragOver(false)
				}}
				onDragOver={(e) => e.preventDefault()}
				onDrop={handleDrop}
				className={`inset-control ${styles.importFileBox} ${(fileDragHover && styles.fileDropActive) || ""}`}>
				<div className={styles.importFileDrop} onClick={openFileSelect}>
					<p>{t("pulls.import.dropHere")}</p>
				</div>
				<div className={`${styles.importFileSelect}`}>
					<code>
						<span className={styles.fileName}>
							{fileName || t("pulls.import.noFile")}
						</span>
					</code>
					{parsedData && (
						<button
							className={`pill-button ${styles.clearFileButton}`}
							onClick={clearImports}>
							X
						</button>
					)}
					<button
						className={`pill-button ${styles.fileButton}`}
						onClick={openFileSelect}>
						{parsedData ? t("pulls.import.changeFile") : t("pulls.import.selectFile")}
					</button>
				</div>

				{importMessages.length > 0 && (
					<span className={`${styles.importMessageBox}`}>
						{importMessages.map((row, index) => {
							return (
								<p
									key={index}
									data-type={row.status}
									className={styles.importMessage}>
									{t(row.message, row.params)}
								</p>
							)
						})}
					</span>
				)}
			</div>
			<button
				disabled={
					!parsedData ||
					parsedData.messages.some(
						(message) => message.status === "error"
					)
				}
				className={`pill-button ${styles.importButton}`}
				onClick={(e) => {
					e.preventDefault()
					importData()
				}}>
				{t("pulls.import.importButton", {
					count: parsedData?.pulls.length ?? 0,
				})}
			</button>
			<hr />
			<div className={pageStyles.sectionTitleRow}>
				<div className={pageStyles.sectionTitle}>{t("pulls.import.manual")}</div>
			</div>
			{/* Keyed by board: switching boards drops rows queued for another. */}
			<ManualPullEntry key={selectedBanner} />
		</div>
	)
}
