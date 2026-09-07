"use client"

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"

import { ScarboroughFairPull, MiracleBoxPull } from "@/types/pulls"

import { getItemRarityStyle } from "@/data/items"
import { permanentBanner } from "@/data/activities/banners"

import {
	isScarboroughPull,
	isRateUp,
	findPullItem,
	staticArcBanners,
	getResolvedGachaBanners,
} from "@/helpers"

import { usePullTrackerContext, useSettingsConfigContext } from "@/contexts"

import pageStyles from "@/app/pulls/page.module.css"
import styles from "./pullsListSection.module.css"

function DiceRoll({ pull }: { pull: MiracleBoxPull | ScarboroughFairPull }) {
	const { selectedBanner } = usePullTrackerContext()

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
							alt={`Dice Roll: ${pull.diceRoll}`}
						/>
					)
				case "pointsGift":
					return <div className={styles.nonDice}>Points Gift</div>
				case "slumberland":
					return <div className={styles.nonDice}>Slumberland</div>
			}
		}
		return <div className={styles.pullDice}>{pullDice()}</div>
	}
}

function PullEntry({
	pull,
	pity,
}: {
	pull: MiracleBoxPull | ScarboroughFairPull
	pity: number
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

	const sourceDir: Record<ScarboroughFairPull["rewardType"], string> = {
		arc: "/arcs/",
		item: "/materials/",
		cosmetic: "/materials/",
		character: "/characters/avatar/",
	}

	const isRateup = useMemo(
		() => isRateUp(selectedBanner, gachaBanners, pull, server),
		[selectedBanner, gachaBanners, pull, server]
	)

	return (
		<>
			<div className={styles.pullNumber}>
				{pull.pullIndex > 0 ? pull.pullIndex : "-"}
			</div>
			<div
				key={pull.uid}
				data-rateup={isRateup}
				data-rewardtype={isScarborough ? pull.rewardType : "arc"}
				style={
					isScarborough
						? ({
								"--bg-image": `url("${sourceDir[pull.rewardType]}${item.imageSrc}")`,
							} as CSSProperties)
						: {}
				}
				className={`${styles.pullEntry} ${getItemRarityStyle(item)}`}>
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
					{pull.pullIndex > 0 ? pity : "-"}
				</div>
			</div>
		</>
	)
}

export function PullsListSection() {
	const { selectedBanner, gachaBanners, pulls, pityMap } =
		usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const [page, setPage] = useState<number>(0)
	const [pageInput, setPageInput] = useState<string>("")
	const [inputWidth, setInputWidth] = useState<number>(0)
	const measureRef = useRef<HTMLSpanElement>(null)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true)
	}, [])

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPage(0)
	}, [selectedBanner])
	const pullsPerPage = 10

	const pullBannerMap = useMemo(() => {
		const map = new Map<string, string[]>()
		const limitedBanners =
			selectedBanner === "limitedBanner"
				? getResolvedGachaBanners(gachaBanners, server)
				: []

		pulls.forEach((pull) => {
			let bannerNames: string[]
			if (selectedBanner === "arcsBanner") {
				bannerNames = staticArcBanners
					.filter(
						(b) =>
							b.startDate < pull.timestamp &&
							b.endDate > pull.timestamp
					)
					.map((b) => b.name)
			} else if (selectedBanner === "limitedBanner") {
				bannerNames = limitedBanners
					.filter(
						(b) =>
							b.startDate < pull.timestamp &&
							b.endDate > pull.timestamp
					)
					.map((b) => b.name)
			} else {
				bannerNames = [permanentBanner.name]
			}
			map.set(pull.uid, bannerNames.length > 0 ? bannerNames : ["Unknown"])
		})

		return map
	}, [pulls, selectedBanner, gachaBanners, server])

	const arcPages = useMemo(() => {
		if (selectedBanner !== "arcsBanner") return []

		const pages: Array<
			Array<
				| { type: "pull"; pull: MiracleBoxPull | ScarboroughFairPull }
				| { type: "divider"; banners: string[] }
				| { type: "placeholder"; banners: string[] }
			>
		> = []
		let currentPage: Array<
			| { type: "pull"; pull: MiracleBoxPull | ScarboroughFairPull }
			| { type: "divider"; banners: string[] }
			| { type: "placeholder"; banners: string[] }
		> = []
		let pullCountInPage = 0

		for (let i = 0; i < pulls.length; i++) {
			const pull = pulls[i]

			if (i > 0) {
				const prevBanners = pullBannerMap.get(pulls[i - 1].uid)
				const currentBanners = pullBannerMap.get(pull.uid)
				if (prevBanners?.[0] !== currentBanners?.[0]) {
					currentPage.push({
						type: "divider",
						banners: prevBanners ?? [],
					})
				}

				if (
					prevBanners?.[0] === currentBanners?.[0] &&
					pullCountInPage === pullsPerPage
				) {
					currentPage.push({
						type: "placeholder",
						banners: currentBanners ?? [],
					})
				}
			}

			if (pullCountInPage === pullsPerPage) {
				pages.push(currentPage)
				currentPage = []
				pullCountInPage = 0
			}

			currentPage.push({ type: "pull", pull })
			pullCountInPage++
		}

		if (pulls.length > 0) {
			const lastBanners = pullBannerMap.get(pulls[pulls.length - 1].uid)
			currentPage.push({
				type: "divider",
				banners: lastBanners ?? [],
			})
		}

		if (currentPage.length > 0) {
			pages.push(currentPage)
		}

		return pages
	}, [selectedBanner, pulls, pullBannerMap, pullsPerPage])

	const regularRows = useMemo(() => {
		if (selectedBanner === "arcsBanner") return []

		const result: Array<
			| { type: "pull"; pull: MiracleBoxPull | ScarboroughFairPull }
			| { type: "divider"; banners: string[] }
		> = []

		pulls.forEach((pull, i) => {
			if (i > 0) {
				const prevBanners = pullBannerMap.get(pulls[i - 1].uid)
				const currentBanners = pullBannerMap.get(pull.uid)
				if (prevBanners?.[0] !== currentBanners?.[0]) {
					result.push({
						type: "divider",
						banners: prevBanners ?? [],
					})
				}
			}
			result.push({ type: "pull", pull })
		})

		if (pulls.length > 0 && selectedBanner !== "permanentBanner") {
			const lastBanners = pullBannerMap.get(pulls[pulls.length - 1].uid)
			result.push({
				type: "divider",
				banners: lastBanners ?? [],
			})
		}

		return result
	}, [selectedBanner, pulls, pullBannerMap])

	const maxPages = useMemo(() => {
		if (selectedBanner === "arcsBanner") {
			return Math.max(arcPages.length - 1, 0)
		}
		return Math.floor(
			Math.max(
				regularRows.length -
					(selectedBanner === "permanentBanner" ? 0 : 1),
				0
			) / pullsPerPage
		)
	}, [selectedBanner, arcPages.length, regularRows.length, pullsPerPage])

	const clampedPage = Math.min(page, maxPages)

	const pageRows = useMemo(() => {
		if (selectedBanner === "arcsBanner") {
			return arcPages[clampedPage] ?? []
		}
		const pageStart = clampedPage * pullsPerPage
		const pageEnd = pageStart + pullsPerPage
		return regularRows.slice(pageStart, pageEnd)
	}, [selectedBanner, arcPages, regularRows, clampedPage, pullsPerPage])

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
				<span className={pageStyles.sectionTitle}>PULLS</span>
			</div>
			<div
				data-bannertype={selectedBanner}
				style={{
					gridTemplateRows: `auto repeat(${pullsPerPage + (selectedBanner === "arcsBanner" ? 1 : 0)}, 1fr)`,
				}}
				className={`inset-control ${styles.pullsList}`}>
				<div className={styles.listHeader}>
					<div className={styles.pullNumber}>#</div>
					{selectedBanner !== "arcsBanner" && (
						<div
							className={`${styles.pullDice} ${styles.showDivider}`}>
							Dice
						</div>
					)}
					<div
						className={`${styles.pullName} ${(selectedBanner === "arcsBanner" && styles.showDivider) || ""}`}>
						Item
					</div>
					<div className={styles.pullPity}>Pity</div>
				</div>
				{pageRows.map((row) => {
					if (row.type === "divider" || row.type === "placeholder") {
						return (
							<div
								data-type={row.type}
								key={`divider-${row.banners.join("/")}`}
								className={styles.bannerDivider}>
								{`${row.type === "divider" ? "End of " : ""}${row.banners.map((banner) => `"${banner}"`).join(" / ")}`}
							</div>
						)
					}

					const pull = row.pull
					return (
						<PullEntry
							key={pull.uid}
							pull={pull}
							pity={pityMap[selectedBanner].get(pull.uid) ?? 0}
						/>
					)
				})}
				{pageRows.length <= 0 && (
					<div className={styles.bannerDivider}>No Pull History</div>
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
						PREV
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
						NEXT
					</button>
				</div>
			)}
		</div>
	)
}
