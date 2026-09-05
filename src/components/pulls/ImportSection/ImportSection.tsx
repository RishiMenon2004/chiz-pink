"use client"

import { DragEventHandler, MouseEventHandler, useMemo, useState } from "react"

import { ImportedPullsResult, ImportMessage } from "@/types/pulls"

import {
	importParsedPulls,
	isNteExporterData,
	parseNteExporterImport,
} from "@/helpers/importNteExporterPulls"

import styles from "./importSection.module.css"

export function ImportSection() {
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
							message: `Couldn't read the file - ${error}`,
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
							message:
								"File is either unrecognised or does not contain pull history.",
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
				{ message: "Error while parsing file", status: "error" },
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
			className={`metallic-panel ${styles.section} ${styles.importSection}`}>
			<div className={styles.sectionTitleRow}>
				<div className={styles.sectionTitle}>Import</div>
				<div>
					{"Export your pull history using: "}
					<a href="https://github.com/RishiMenon2004/nte-exporter/releases/latest" target="_blank">
						NTE History Exporter
					</a>
					{
						". Then import them here to see your pull history and pity."
					}
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
					<p>Drop JSON here</p>
				</div>
				<div className={`${styles.importFileSelect}`}>
					<code>
						<span className={styles.fileName}>
							{fileName || "no file selected (.json)"}
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
						{parsedData ? "CHANGE FILE" : "SELECT FILE"}
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
									{row.message}
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
				Import {parsedData?.pulls.length ?? 0} Pulls
			</button>
		</div>
	)
}
