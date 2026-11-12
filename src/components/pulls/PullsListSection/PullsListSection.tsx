"use client"

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"

import { ScarboroughFairPull, MiracleBoxPull } from "@/types/pulls"

import { getItemRarityStyle } from "@/data/items"
import { permanentBanner } from "@/data/activities/banners"

import {
	isScarboroughPull,
	isRateUp,
	findPullItem,
	findPullPoolBanner,
	staticArcBanners,
	getResolvedGachaBanners,
	isPullInBannerWindow,
	getOptimizedImageUrl,
	type PullBanner,
} from "@/helpers"
import { fuzzyScoreAny } from "@/helpers/fuzzyMatch"

import {
	usePullTrackerContext,
	useSettingsConfigContext,
	useT,
} from "@/contexts"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./pullsListSection.module.css"

function DiceRoll({ pull }: { pull: MiracleBoxPull | ScarboroughFairPull }) {
	const { selectedBanner } = usePullTrackerContext()
	const t = useT()

	if (selectedBanner === "arcsBanner") return null

	const isScarborough = isScarboroughPull(pull)
	if (isScarborough && pull.diceRoll !== undefined) {
		const pullDice = () => {
			switch (pull.resultType) {
				case "dice":
					return (
						<Image
							width={84}
							height={32}
							src={`/pulls/dice_${pull.diceRoll}.png`}
							alt={t("pulls.list.diceRollAlt", { roll: pull.diceRoll })}
						/>
					)
				case "pointsGift":
					return <div className={styles.nonDice}>{t("pulls.list.pointsGift")}</div>
				case "slumberland":
					return <div className={styles.nonDice}>{t("pulls.list.slumberland")}</div>
			}
		}
		return <div className={styles.pullDice}>{pullDice()}</div>
	}
}

type Pull = MiracleBoxPull | ScarboroughFairPull

// A stretch of consecutive pulls from one banner. labelled: the exporter
// recorded the banner; otherwise banners lists every banner running then.
type Run = {
	key: string
	banners: string[]
	themeColor: string | null
	labelled: boolean
}

// ending: the run ends here, rather than carrying on to the next page.
type LabelRow = { type: "label"; run: Run; ending: boolean }

type ListRow = { type: "pull"; pull: Pull } | LabelRow

type Group = { run: Run; pulls: Pull[]; label?: LabelRow }

function PullEntry({
	pull,
	pity,
	pullNumber,
}: {
	pull: MiracleBoxPull | ScarboroughFairPull
	pity: number
	pullNumber: number
}) {
	const { selectedBanner, gachaBanners } = usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const isScarborough = isScarboroughPull(pull)

	const item = findPullItem(
		pull.rewardId,
		isScarborough ? pull.rewardType : "arc"
	)

	const rewardType = isScarborough ? pull.rewardType : "arc"
	const sourceDir: Record<ScarboroughFairPull["rewardType"], string> = {
		arc: "/arcs/",
		item: "/materials/",
		cosmetic: "/materials/",
		character: "/characters/avatar/",
	}
	const imageSrc = `${sourceDir[rewardType]}${item.imageSrc}`

	const isRateup = useMemo(
		() => isRateUp(selectedBanner, gachaBanners, pull, server),
		[selectedBanner, gachaBanners, pull, server]
	)

	return (
		<>
			<div className={styles.pullNumber}>
				{pullNumber > 0 ? pullNumber : "-"}
			</div>
			<div
				key={pull.uid}
				data-rateup={isRateup}
				data-rewardtype={rewardType}
				style={
					{
						"--bg-image": `url("${getOptimizedImageUrl(imageSrc)}")`,
					} as CSSProperties
				}
				className={`${styles.pullEntry} ${getItemRarityStyle(item)}`}>
				<div className={styles.pullArt} aria-hidden />
				<DiceRoll pull={pull} />

				<div
					className={styles.pullName}
					style={{
						gridColumn:
							selectedBanner === "arcsBanner" ? "span 2" : "unset",
					}}>
					{item?.name}
					{isScarborough &&
						pull.rewardType === "item" &&
						` ×${pull.quantity}`}
				</div>
				<div className={styles.pullPity}>
					{pullNumber > 0 ? pity : "-"}
				</div>
			</div>
		</>
	)
}

export function PullsListSection() {
	const { selectedBanner, gachaBanners, pulls, pityMap, pullNumberMap } =
		usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const [page, setPage] = useState<number>(0)
	const [search, setSearch] = useState<string>("")
	const [pageInput, setPageInput] = useState<string>("")
	const [inputWidth, setInputWidth] = useState<number>(0)
	const measureRef = useRef<HTMLSpanElement>(null)
	const [mounted, setMounted] = useState(false)
	const t = useT()

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true)
	}, [])

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPage(0)
	}, [selectedBanner])
	const pullsPerPage = 10
	// One spare row for the label or divider closing the page's last run.
	const rowsPerPage = pullsPerPage + 1

	const isSearching = search.trim() !== ""

	// Matches keep their place in the history (newest first) instead of
	// being ranked, so pull numbers and pity still read in order.
	const visiblePulls = useMemo(() => {
		if (!isSearching) return pulls

		return pulls.filter((pull) => {
			const item = findPullItem(
				pull.rewardId,
				isScarboroughPull(pull) ? pull.rewardType : "arc"
			)
			return fuzzyScoreAny(search, [item.name, pull.rewardId]) !== null
		})
	}, [pulls, search, isSearching])

	// Arc history is laid out in its ten-pull groups, which only means
	// something with every pull present; search results use the plain list.
	const isArcLayout = selectedBanner === "arcsBanner" && !isSearching
	const isPermanent = selectedBanner === "permanentBanner"

	// pullBannerMap: every banner running when a pull was made, used for
	// the "End of ..." dividers of pulls without a pool.
	// ownBannerMap: the one banner a pull was made on, going by the pool the
	// exporter recorded. Each run of a banner's pulls is boxed and labelled
	// instead, which keeps banners running side by side apart.
	const { pullBannerMap, ownBannerMap } = useMemo(() => {
		const names = new Map<string, string[]>()
		const own = new Map<string, PullBanner>()
		const limitedBanners =
			selectedBanner === "limitedBanner"
				? getResolvedGachaBanners(gachaBanners, server)
				: []

		pulls.forEach((pull) => {
			if (selectedBanner === "permanentBanner") {
				names.set(pull.uid, [permanentBanner.name])
				return
			}

			const banners =
				selectedBanner === "arcsBanner" ? staticArcBanners : limitedBanners
			names.set(
				pull.uid,
				banners.filter((b) => isPullInBannerWindow(b, pull)).map((b) => b.name)
			)

			const banner = findPullPoolBanner(selectedBanner, pull, limitedBanners)
			if (banner) own.set(pull.uid, banner)
		})

		for (const [uid, bannerNames] of names) {
			if (bannerNames.length === 0) names.set(uid, [t("pulls.list.unknownBanner")])
		}

		return { pullBannerMap: names, ownBannerMap: own }
	}, [pulls, selectedBanner, gachaBanners, server, t])

	// Every pull belongs to a run, boxed and closed by a label: the banner
	// the exporter recorded, or else every banner running at the time.
	const runOf = useCallback(
		(pull: Pull): Run => {
			const own = ownBannerMap.get(pull.uid)
			if (own) {
				return {
					key: `own:${own.name}`,
					banners: [own.name],
					themeColor: own.themeColor,
					labelled: true,
				}
			}
			const banners = pullBannerMap.get(pull.uid) ?? []
			return {
				key: `date:${banners.join("/")}`,
				banners,
				themeColor: null,
				labelled: false,
			}
		},
		[ownBannerMap, pullBannerMap]
	)

	const sameRun = useCallback(
		(a: Pull, b: Pull) => runOf(a).key === runOf(b).key,
		[runOf]
	)

	// Arc pages hold exactly one ten-pull group each, plus the labels closing
	// each run on the page, so a run going on to the next page is labelled on
	// both.
	const arcPages = useMemo(() => {
		if (!isArcLayout) return []

		const pages: ListRow[][] = []
		let currentPage: ListRow[] = []
		let pullCountInPage = 0

		for (let i = 0; i < visiblePulls.length; i++) {
			const pull = visiblePulls[i]
			const prev = visiblePulls[i - 1]

			if (prev && !sameRun(prev, pull)) {
				currentPage.push({ type: "label", run: runOf(prev), ending: true })
			} else if (prev && pullCountInPage === pullsPerPage) {
				currentPage.push({ type: "label", run: runOf(prev), ending: false })
			}

			if (pullCountInPage === pullsPerPage) {
				pages.push(currentPage)
				currentPage = []
				pullCountInPage = 0
			}

			currentPage.push({ type: "pull", pull })
			pullCountInPage++
		}

		const last = visiblePulls.at(-1)
		if (last) currentPage.push({ type: "label", run: runOf(last), ending: true })

		if (currentPage.length > 0) {
			pages.push(currentPage)
		}

		return pages
	}, [isArcLayout, visiblePulls, pullsPerPage, runOf, sameRun])

	// Other banners fill each page with up to rowsPerPage rows, labels
	// included, so every page is as tall as an arc page. A run always keeps a
	// row free for its label, so a run split across pages is labelled on both.
	// The permanent banner is one endless run, so it just lists its pulls.
	const regularPages = useMemo(() => {
		if (isArcLayout) return []

		const pages: ListRow[][] = []
		if (isPermanent) {
			for (let i = 0; i < visiblePulls.length; i += rowsPerPage) {
				pages.push(
					visiblePulls
						.slice(i, i + rowsPerPage)
						.map((pull): ListRow => ({ type: "pull", pull }))
				)
			}
			return pages
		}

		let currentPage: ListRow[] = []
		const closePage = () => {
			if (currentPage.length > 0) pages.push(currentPage)
			currentPage = []
		}
		const addRow = (row: ListRow) => {
			if (currentPage.length >= rowsPerPage) closePage()
			currentPage.push(row)
		}

		visiblePulls.forEach((pull, i) => {
			const prev = visiblePulls[i - 1]
			if (prev && !sameRun(prev, pull)) {
				addRow({ type: "label", run: runOf(prev), ending: true })
			}

			if (currentPage.length >= rowsPerPage - 1) {
				const lastRow = currentPage.at(-1)
				if (lastRow?.type === "pull" && sameRun(lastRow.pull, pull)) {
					currentPage.push({ type: "label", run: runOf(pull), ending: false })
				}
				closePage()
			}

			addRow({ type: "pull", pull })
		})

		const last = visiblePulls.at(-1)
		if (last) addRow({ type: "label", run: runOf(last), ending: true })
		closePage()

		return pages
	}, [isArcLayout, isPermanent, visiblePulls, rowsPerPage, runOf, sameRun])

	const listPages = isArcLayout ? arcPages : regularPages
	const maxPages = Math.max(listPages.length - 1, 0)

	const clampedPage = Math.min(page, maxPages)

	// The page's rows gathered into one box per run, each with its label.
	const pageGroups = useMemo(() => {
		const groups: Group[] = []
		for (const row of listPages[clampedPage] ?? []) {
			const last = groups.at(-1)
			const open = last && !last.label ? last : undefined

			if (row.type === "label") {
				if (open) open.label = row
			} else if (open && sameRun(open.pulls[0], row.pull)) {
				open.pulls.push(row.pull)
			} else {
				groups.push({ run: runOf(row.pull), pulls: [row.pull] })
			}
		}
		return groups
	}, [listPages, clampedPage, runOf, sameRun])

	// What a box's label says. A run without a recorded banner keeps the old
	// "End of ..." wording where it ends.
	const labelText = ({ run, ending }: LabelRow) => {
		const names = run.banners.map((banner) => `"${banner}"`).join(" / ")
		return run.labelled || !ending
			? names
			: t("pulls.list.endOf", { banners: names })
	}

	const renderPull = (pull: MiracleBoxPull | ScarboroughFairPull) => (
		<PullEntry
			key={pull.uid}
			pull={pull}
			pity={pityMap[selectedBanner].get(pull.uid) ?? 0}
			pullNumber={pullNumberMap[selectedBanner].get(pull.uid) ?? -1}
		/>
	)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPageInput(String(clampedPage + 1))
	}, [clampedPage])

	useEffect(() => {
		if (measureRef.current) {
			setInputWidth(measureRef.current.offsetWidth)
		}
	}, [pageInput])

	return (
		<div
			className={`metallic-panel ${pageStyles.section} ${styles.pullsSection}`}>
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
						onChange={(e) => {
							setSearch(e.currentTarget.value)
							setPage(0)
						}}
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
							onClick={() => {
								setSearch("")
								setPage(0)
							}}
						/>
					)}
				</div>
			</div>
			<div
				data-bannertype={selectedBanner}
				style={{
					gridTemplateRows: `auto repeat(${rowsPerPage}, 1fr)`,
				}}
				className={`inset-control ${styles.pullsList}`}>
				<div className={styles.listHeader}>
					<div className={styles.pullNumber}>#</div>
					{selectedBanner !== "arcsBanner" && (
						<div
							className={`${styles.pullDice} ${styles.showDivider}`}>
							{t("pulls.list.dice")}
						</div>
					)}
					<div
						className={`${styles.pullName} ${(selectedBanner === "arcsBanner" && styles.showDivider) || ""}`}>
						{t("pulls.list.item")}
					</div>
					<div className={styles.pullPity}>{t("pulls.list.pity")}</div>
				</div>
				{pageGroups.map((group) => isPermanent ? group.pulls.map(renderPull) : (
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
				))}
				{pageGroups.length <= 0 && (
					<div className={styles.bannerDivider}>
						{isSearching ? t("pulls.list.noMatches") : t("pulls.list.noHistory")}
					</div>
				)}
			</div>
			{mounted && (
				<div className={styles.pageChangeRow}>
					<button
						className={`pill-button ${styles.pageChangeBtn}`}
						data-type="prev"
						disabled={clampedPage === 0}
						onClick={(e) => {
							e.stopPropagation()
							setPage((current) => {
								return Math.max(current - 1, 0)
							})
						}}>
						{t("pulls.list.prev")}
					</button>
					<div className={`inset-control ${styles.pageChangeCounter}`}>
						<span
							ref={measureRef}
							className={styles.pageChangeMeasure}>
							{pageInput || "0"}
						</span>
						<input
							className={styles.pageChangeInput}
							type="text"
							inputMode="numeric"
							value={pageInput}
							style={{ width: inputWidth + 4 || "1ch" }}
							onChange={(e) => {
								setPageInput(e.target.value)
							}}
							onBlur={() => {
								const parsed = parseInt(pageInput, 10)
								if (!isNaN(parsed)) {
									setPage(
										Math.min(
											Math.max(parsed - 1, 0),
											maxPages
										)
									)
								} else {
									setPageInput(String(clampedPage + 1))
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
							setPage((current) => {
								return Math.min(current + 1, maxPages)
							})
						}}>
						{t("pulls.list.next")}
					</button>
				</div>
			)}
		</div>
	)
}
