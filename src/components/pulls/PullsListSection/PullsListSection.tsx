"use client"

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"

import { Item } from "@/types/item"
import { ScarboroughFairPull, MiracleBoxPull } from "@/types/pulls"

import { EnumRarity, findReward, getItemRarityStyle } from "@/data/items"
import { findArc } from "@/data/arcs"
import { findCharacter } from "@/data/characters"
import { arcBanners, permanentBanner } from "@/data/activities/banners"

import {
	isScarboroughPull,
	isRateUp,
} from "@/helpers"

import { usePullTrackerContext, useSettingsConfigContext } from "@/contexts"

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

	function findPullItem(
		itemId: string,
		type?: ScarboroughFairPull["rewardType"]
	) {
		const fallback = { name: itemId, rarity: EnumRarity.Epic } as Item

		if (type === undefined) {
			return findArc(itemId) ?? fallback
		}

		switch (type) {
			case "arc":
				return findArc(itemId) ?? fallback
			case "item":
			case "cosmetic":
				return findReward(itemId) ?? fallback
			case "character":
				return findCharacter(itemId) ?? fallback
		}
	}

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
		const map = new Map<string, string>()

		pulls.forEach((pull) => {
			let bannerName: string
			if (selectedBanner === "arcsBanner") {
				const banner = arcBanners.find((b) => {
					return (
						b.getStartDate() < pull.timestamp &&
						b.getEndDate() > pull.timestamp
					)
				})
				bannerName = banner?.name ?? "Unknown"
			} else if (selectedBanner === "limitedBanner") {
				const banner = gachaBanners.find((b) => {
					return (
						b.getStartDate(server) < pull.timestamp &&
						b.getEndDate(server) > pull.timestamp
					)
				})
				bannerName = banner?.name ?? "Unknown"
			} else {
				bannerName = permanentBanner.name
			}
			map.set(pull.uid, bannerName)
		})

		return map
	}, [pulls, selectedBanner, gachaBanners, server])

	const rows = useMemo(() => {
		const result: Array<
			| { type: "pull"; pull: MiracleBoxPull | ScarboroughFairPull }
			| { type: "divider"; banner: string }
		> = []

		pulls.forEach((pull, i) => {
			if (i > 0) {
				const prevBanner = pullBannerMap.get(pulls[i - 1].uid)
				const currentBanner = pullBannerMap.get(pull.uid)
				if (prevBanner !== currentBanner) {
					result.push({ type: "divider", banner: prevBanner ?? "" })
				}
			}
			result.push({ type: "pull", pull })
		})

		if (pulls.length > 0) {
			const lastBanner = pullBannerMap.get(pulls[pulls.length - 1].uid)
			result.push({ type: "divider", banner: lastBanner ?? "" })
		}

		return result
	}, [pulls, pullBannerMap])

	const maxPages = Math.floor(Math.max(rows.length - 1, 0) / pullsPerPage)
	const clampedPage = Math.min(page, maxPages)
	const pageStart = clampedPage * pullsPerPage
	const pageEnd = pageStart + pullsPerPage
	const pageRows = rows.slice(pageStart, pageEnd)

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
			className={`metallic-panel ${styles.section} ${styles.pullsSection}`}>
			<div className={styles.sectionTitleRow}>
				<span className={styles.sectionTitle}>PULLS</span>
			</div>
			<div
				data-bannertype={selectedBanner}
				style={{
					gridTemplateRows: `auto repeat(${pullsPerPage}, 1fr)`,
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
					if (row.type === "divider") {
						return (
							<div
								key={`divider-${row.banner}`}
								className={styles.bannerDivider}>
								{`End of "${row.banner}"`}
							</div>
						)
					}

					const pull = row.pull
					return (
						<PullEntry
							key={pull.uid}
							pull={pull}
							pity={pityMap.get(pull.uid) ?? 0}
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
