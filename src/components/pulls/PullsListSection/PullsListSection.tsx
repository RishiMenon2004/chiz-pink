"use client"

import {
	CSSProperties,
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"

import type { MiracleBoxPull, ScarboroughFairPull } from "@/types/pulls"

import { useGachaStore } from "@/hooks"

import { findPullItem, isScarboroughPull } from "@/helpers"
import { fuzzyScoreAny } from "@/helpers/fuzzyMatch"
import { isInitialSyncPending } from "@/helpers/syncGate"

import {
	usePullTrackerContext,
	useSettingsConfigContext,
	useT,
} from "@/contexts"

import { ActionHint, AlertContainer, ModalContainer } from "@/components/layout"
import { alertMessage } from "@/components/layout/Alert/AlertContainer"

import { PullEditOverlay } from "./PullEditOverlay"
import { PullEntry, type PullActions } from "./PullEntryRow"
import { PullMenu } from "./PullRowMenu"
import { PullsPagination, PullsSearchBar } from "./PullsListToolbar"
import {
	buildArcPages,
	buildPullBannerMaps,
	buildRegularPages,
	groupPageRows,
	resolveRun,
	type LabelRow,
	type Pull,
} from "./pullsGrouping"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./pullsListSection.module.css"

const emptySubscribe = () => () => {}

export function PullsListSection() {
	const { selectedBanner, gachaBanners, pulls, pityMap, pullNumberMap, shownPull } =
		usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const [page, setPage] = useState<number>(0)
	const [prevBanner, setPrevBanner] = useState(selectedBanner)
	const [search, setSearch] = useState<string>("")
	const [handledRequest, setHandledRequest] = useState(0)
	const [highlighted, setHighlighted] = useState<string | null>(null)
	const sectionRef = useRef<HTMLDivElement>(null)
	const mounted = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false
	)
	const t = useT()

	if (prevBanner !== selectedBanner) {
		setPrevBanner(selectedBanner)
		setPage(0)
	}

	const pullsPerPage = 10
	// One spare row for the label or divider closing the page's last run.
	const rowsPerPage = pullsPerPage + 1

	const deferredSearch = useDeferredValue(search)
	const isSearching = deferredSearch.trim() !== ""

	const searchTerms = useMemo(
		() =>
			pulls.map((pull) => [
				findPullItem(pull.rewardId, isScarboroughPull(pull) ? pull.rewardType : "arc")
					.name,
				pull.rewardId,
			]),
		[pulls]
	)

	// Matches stay in newest-first order so pull numbers and pity read sequentially.
	const visiblePulls = useMemo(() => {
		if (!isSearching) return pulls
		return pulls.filter(
			(_pull, index) => fuzzyScoreAny(deferredSearch, searchTerms[index]) !== null
		)
	}, [pulls, searchTerms, deferredSearch, isSearching])

	const isArcLayout = selectedBanner === "arcsBanner" && !isSearching
	const isPermanent = selectedBanner === "permanentBanner"

	const { pullBannerMap, ownBannerMap } = useMemo(
		() => buildPullBannerMaps(pulls, selectedBanner, gachaBanners, server),
		[pulls, selectedBanner, gachaBanners, server]
	)

	const runOf = useCallback(
		(pull: Pull) => resolveRun(pull, ownBannerMap, pullBannerMap),
		[ownBannerMap, pullBannerMap]
	)

	const listPages = useMemo(
		() =>
			isArcLayout
				? buildArcPages(visiblePulls, pullsPerPage, runOf)
				: buildRegularPages(visiblePulls, rowsPerPage, isPermanent, runOf),
		[isArcLayout, isPermanent, visiblePulls, pullsPerPage, rowsPerPage, runOf]
	)
	const maxPages = Math.max(listPages.length - 1, 0)

	// Jump to a pull requested from Recent S-Ranks once its banner is active and search clears.
	if (
		shownPull &&
		shownPull.request !== handledRequest &&
		shownPull.banner === selectedBanner
	) {
		if (search !== "") {
			setSearch("")
		} else if (!isSearching) {
			const index = listPages.findIndex((rows) =>
				rows.some((row) => row.type === "pull" && row.pull.uid === shownPull.uid)
			)
			if (index !== -1) {
				setHandledRequest(shownPull.request)
				setPage(index)
				setHighlighted(shownPull.uid)
			}
		}
	}

	useEffect(() => {
		if (handledRequest === 0) return
		sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
	}, [handledRequest])

	useEffect(() => {
		if (!highlighted) return
		const timer = window.setTimeout(() => setHighlighted(null), 2000)
		return () => window.clearTimeout(timer)
	}, [highlighted])

	const clampedPage = Math.min(page, maxPages)

	const pageGroups = useMemo(
		() => groupPageRows(listPages[clampedPage] ?? [], runOf),
		[listPages, clampedPage, runOf]
	)

	const labelText = ({ run, ending }: LabelRow) => {
		const banners = run.banners.length > 0 ? run.banners : [t("pulls.list.unknownBanner")]
		const names = banners.map((banner) => `"${banner}"`).join(" / ")
		return run.labelled || !ending
			? names
			: t("pulls.list.endOf", { banners: names })
	}

	const [menu, setMenu] = useState<{
		pull: Pull
		anchor: HTMLElement
		x: number
		y: number
	} | null>(null)
	const [editing, setEditing] = useState<{ pull: Pull; anchor: HTMLElement } | null>(
		null
	)
	const closeMenu = useCallback(() => setMenu(null), [])
	const [deleting, setDeleting] = useState<Pull | null>(null)
	const { actions: gachaActions } = useGachaStore()

	const closeEditor = useCallback(() => {
		setEditing((current) => {
			const anchor = current?.anchor
			if (anchor?.isConnected) requestAnimationFrame(() => anchor.focus())
			return null
		})
	}, [])

	const pullActions: PullActions = useMemo(
		() => ({
			onMenu: (pull, anchor, x, y) => setMenu({ pull, anchor, x, y }),
			onEdit: (pull, anchor) => {
				setMenu(null)
				setEditing({ pull, anchor })
			},
		}),
		[]
	)

	const renderPull = (pull: MiracleBoxPull | ScarboroughFairPull) => (
		<PullEntry
			key={pull.uid}
			pull={pull}
			pity={pityMap[selectedBanner].get(pull.uid) ?? 0}
			pullNumber={pullNumberMap[selectedBanner].get(pull.uid) ?? -1}
			actions={pullActions}
			highlighted={pull.uid === highlighted}
		/>
	)

	return (
		<div
			ref={sectionRef}
			className={`metallic-panel ${pageStyles.section} ${styles.pullsSection}`}>
			<PullsSearchBar
				search={search}
				onSearchChange={(value) => {
					setSearch(value)
					setPage(0)
				}}
				onClear={() => {
					setSearch("")
					setPage(0)
				}}
			/>
			{visiblePulls.length > 0 && (
				<ActionHint
					surface="light"
					touch={t("pulls.list.editHintTouch")}
					className={styles.editHint}
				/>
			)}
			<div
				data-bannertype={selectedBanner}
				style={{
					gridTemplateRows: `auto repeat(${rowsPerPage}, 1fr)`,
				}}
				className={`inset-control ${styles.pullsList}`}>
				<div className={styles.listHeader}>
					<div className={styles.pullNumber}>#</div>
					{selectedBanner !== "arcsBanner" && (
						<div className={`${styles.pullDice} ${styles.showDivider}`}>
							{t("pulls.list.dice")}
						</div>
					)}
					<div
						className={`${styles.pullName} ${(selectedBanner === "arcsBanner" && styles.showDivider) || ""}`}>
						{t("pulls.list.item")}
					</div>
					<div className={styles.pullPity}>{t("pulls.list.pity")}</div>
				</div>
				{pageGroups.map((group) =>
					isPermanent ? (
						group.pulls.map(renderPull)
					) : (
						<div
							key={`group-${group.pulls[0].uid}`}
							className={styles.bannerGroup}
							style={
								{
									gridRow: `span ${group.pulls.length + (group.label ? 1 : 0)}`,
									"--group-color": group.run.themeColor ?? "var(--pink)",
								} as CSSProperties
							}>
							{group.pulls.map(renderPull)}
							{group.label && (
								<div className={`${styles.bannerDivider} ${styles.groupLabel}`}>
									{labelText(group.label)}
								</div>
							)}
						</div>
					)
				)}
				{pageGroups.length <= 0 && (
					<div className={styles.bannerDivider}>
						{isSearching ? t("pulls.list.noMatches") : t("pulls.list.noHistory")}
					</div>
				)}
			</div>
			{mounted && (
				<PullsPagination
					clampedPage={clampedPage}
					maxPages={maxPages}
					onPageChange={setPage}
				/>
			)}
			{menu && (
				<PullMenu
					pull={menu.pull}
					x={menu.x}
					y={menu.y}
					onEdit={() => pullActions.onEdit(menu.pull, menu.anchor)}
					onDelete={() => setDeleting(menu.pull)}
					onClose={closeMenu}
				/>
			)}
			{deleting &&
				createPortal(
					<ModalContainer>
						<AlertContainer
							type="dangerous-confirm"
							confirmLabel={t("pulls.manual.deleteButton")}
							cancelLabel={t("pulls.manual.cancel")}
							onCancel={() => setDeleting(null)}
							onConfirm={() => {
								if (isInitialSyncPending()) return
								gachaActions.removePulls(selectedBanner, [deleting.uid])
								setDeleting(null)
							}}>
							{t("pulls.manual.deleteConfirm")}
							<br />
							<p className={alertMessage}>{t("pulls.manual.deleteConfirmNote")}</p>
						</AlertContainer>
					</ModalContainer>,
					document.body
				)}
			{editing && (
				<PullEditOverlay
					pull={editing.pull}
					shownPity={pityMap[selectedBanner].get(editing.pull.uid) ?? 0}
					anchor={editing.anchor}
					renderRow={(draft, pity, slots) => (
						<PullEntry
							pull={draft as MiracleBoxPull | ScarboroughFairPull}
							pity={pity}
							pullNumber={pullNumberMap[selectedBanner].get(editing.pull.uid) ?? -1}
							slots={slots}
						/>
					)}
					onClose={closeEditor}
				/>
			)}
		</div>
	)
}
