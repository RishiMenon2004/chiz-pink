"use client"

import { useEffect, useRef, useState } from "react"

import { useTooltip } from "@/hooks/useTooltip"

import { useT } from "@/contexts"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./pullsListSection.module.css"

const TOOLTIP_OFFSET = { x: 24, y: 0 }

export function PullsSearchBar({
	search,
	onSearchChange,
	onClear,
	canSelect,
	selectMode,
	onToggleSelectMode,
}: {
	search: string
	onSearchChange: (value: string) => void
	onClear: () => void
	canSelect: boolean
	selectMode: boolean
	onToggleSelectMode: () => void
}) {
	const t = useT()
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const selectLabel = selectMode
		? t("pulls.list.cancelSelect")
		: t("pulls.list.select")

	return (
		<div className={pageStyles.sectionTitleRow}>
			<span className={pageStyles.sectionTitle}>{t("pulls.list.title")}</span>
			<div className={styles.searchControls}>
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
				{canSelect && (
					<button
						type="button"
						className={`pill-button ${styles.selectToggleBtn}`}
						aria-label={selectLabel}
						aria-pressed={selectMode}
						data-active={selectMode || undefined}
						onPointerEnter={showTooltip}
						onPointerLeave={hideTooltip}
						onClick={() => {
							hideTooltip()
							onToggleSelectMode()
						}}>
						<Tooltip offset={TOOLTIP_OFFSET}>{selectLabel}</Tooltip>
					</button>
				)}
			</div>
		</div>
	)
}

export function PullsBatchBar({
	selectedCount,
	allPageSelected,
	allVisibleSelected,
	hasPagePulls,
	hasVisiblePulls,
	onTogglePage,
	onSelectAll,
	onClearSelection,
	onDeleteSelected,
}: {
	selectedCount: number
	allPageSelected: boolean
	allVisibleSelected: boolean
	hasPagePulls: boolean
	hasVisiblePulls: boolean
	onTogglePage: () => void
	onSelectAll: () => void
	onClearSelection: () => void
	onDeleteSelected: () => void
}) {
	const t = useT()

	return (
		<div className={styles.batchBar}>
			<span className={styles.batchCount}>
				{t("pulls.list.selectedCount", { count: selectedCount })}
			</span>
			<div className={styles.batchActions}>
				<button
					type="button"
					className={`pill-button ${styles.batchBtn}`}
					disabled={!hasPagePulls || allPageSelected}
					onClick={onTogglePage}>
					{t("pulls.list.selectPage")}
				</button>
				<button
					type="button"
					className={`pill-button ${styles.batchBtn}`}
					disabled={!hasVisiblePulls || allVisibleSelected}
					onClick={onSelectAll}>
					{t("pulls.list.selectAll")}
				</button>
				<button
					type="button"
					className={`pill-button ${styles.batchBtn}`}
					disabled={selectedCount === 0}
					onClick={onClearSelection}>
					{t("pulls.list.clearSelection")}
				</button>
				<button
					type="button"
					className={`pill-button ${styles.batchBtn}`}
					data-variant="danger"
					disabled={selectedCount === 0}
					onClick={onDeleteSelected}>
					{t("pulls.list.deleteSelected")}
				</button>
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
