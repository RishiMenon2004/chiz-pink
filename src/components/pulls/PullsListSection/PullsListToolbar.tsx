"use client"

import { useEffect, useRef, useState } from "react"

import { useT } from "@/contexts"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./pullsListSection.module.css"

export function PullsSearchBar({
	search,
	onSearchChange,
	onClear,
}: {
	search: string
	onSearchChange: (value: string) => void
	onClear: () => void
}) {
	const t = useT()

	return (
		<div className={pageStyles.sectionTitleRow}>
			<span className={pageStyles.sectionTitle}>{t("pulls.list.title")}</span>
			<div className={`inset-control ${styles.searchField}`}>
				<input
					type="search"
					name="pull search"
					placeholder={t("pulls.list.searchPlaceholder")}
					aria-label={t("pulls.list.searchLabel")}
					autoComplete="off"
					enterKeyHint="done"
					value={search}
					onChange={(e) => onSearchChange(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") e.currentTarget.blur()
					}}
					className={styles.searchInput}
				/>
				{search && (
					<button
						type="button"
						className={styles.searchClear}
						aria-label={t("pulls.list.clearSearch")}
						onClick={onClear}
					/>
				)}
			</div>
		</div>
	)
}

export function PullsPagination({
	clampedPage,
	maxPages,
	onPageChange,
}: {
	clampedPage: number
	maxPages: number
	onPageChange: (nextPage: number) => void
}) {
	const t = useT()
	const [draftInput, setDraftInput] = useState<string | null>(null)
	const [prevClampedPage, setPrevClampedPage] = useState(clampedPage)
	const [inputWidth, setInputWidth] = useState<number>(0)
	const measureRef = useRef<HTMLSpanElement>(null)

	if (prevClampedPage !== clampedPage) {
		setPrevClampedPage(clampedPage)
		if (draftInput !== null) setDraftInput(null)
	}

	const pageInput = draftInput ?? String(clampedPage + 1)

	useEffect(() => {
		if (measureRef.current) {
			setInputWidth(measureRef.current.offsetWidth)
		}
	}, [pageInput])

	return (
		<div className={styles.pageChangeRow}>
			<button
				className={`pill-button ${styles.pageChangeBtn}`}
				data-type="prev"
				disabled={clampedPage === 0}
				onClick={(e) => {
					e.stopPropagation()
					setDraftInput(null)
					onPageChange(Math.max(clampedPage - 1, 0))
				}}>
				{t("pulls.list.prev")}
			</button>
			<div className={`inset-control ${styles.pageChangeCounter}`}>
				<span ref={measureRef} className={styles.pageChangeMeasure}>
					{pageInput || "0"}
				</span>
				<input
					className={styles.pageChangeInput}
					type="text"
					inputMode="numeric"
					value={pageInput}
					style={{ width: inputWidth + 4 || "1ch" }}
					onChange={(e) => {
						setDraftInput(e.target.value)
					}}
					onBlur={() => {
						const parsed = parseInt(pageInput, 10)
						setDraftInput(null)
						if (!isNaN(parsed)) {
							onPageChange(Math.min(Math.max(parsed - 1, 0), maxPages))
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							;(e.target as HTMLInputElement).blur()
						}
					}}
				/>
				<span> / {maxPages + 1}</span>
			</div>
			<button
				className={`pill-button ${styles.pageChangeBtn}`}
				data-type="next"
				disabled={clampedPage === maxPages}
				onClick={(e) => {
					e.stopPropagation()
					setDraftInput(null)
					onPageChange(Math.min(clampedPage + 1, maxPages))
				}}>
				{t("pulls.list.next")}
			</button>
		</div>
	)
}
