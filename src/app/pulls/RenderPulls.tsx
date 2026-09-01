"use client"

import { CSSProperties, useEffect, useMemo, useState } from "react"
import Image from "next/image"

import { Item } from "@/types/item"
import {
	ScarboroughFairPull,
	ImportedPullsResult,
	PullsRecord,
	MiracleBoxPull,
} from "@/types/pulls"

import { EnumRarity, findReward, getItemRarityStyle } from "@/data/items"
import { findArc } from "@/data/arcs"
import { findCharacter } from "@/data/characters"
import {
	EventData,
	Events,
	getPhase2End,
	getPhase2Start,
} from "@/data/activities/events"
import { arcBanners, permanentBanner } from "@/data/activities/banners"

import { useNow, useGachaStore } from "@/hooks"

import { formatTimeRemaining } from "@/helpers"
import {
	importParsedPulls,
	isNteExporterData,
	parseNteExporterImport,
} from "@/helpers/importNteExporterPulls"

import {
	PullTrackerContext,
	usePullTrackerContext,
	useSettingsConfigContext,
} from "@/contexts"

import styles from "./page.module.css"
import { SettingsRecord } from "@/types/settings"

function isScarboroughPull(
	pull: MiracleBoxPull | ScarboroughFairPull
): pull is ScarboroughFairPull {
	return pull && "diceRoll" in pull && typeof pull.diceRoll === "number"
}

const arcBannerFallback = {
	name: "Loading",
	rateupItem: "us",
	getStartDate: getPhase2Start("version1_3"),
	getEndDate: getPhase2End("version1_3"),
}

const characterBannerFallback = {
	name: "Loading",
	rateupItem: "us",
	getStartDate: getPhase2Start("version1_3"),
	getEndDate: getPhase2End("version1_3"),
	eventImage: "version1.3/gacha_zankou.webp",
	yOffset: "50%",
	themeColor: "var(--pink)",
}

function ImportSection() {
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

const isRateUp = (
	selectedBanner: keyof PullsRecord,
	gachaBanners: EventData[],
	pull: MiracleBoxPull | ScarboroughFairPull,
	server: SettingsRecord["userdata"]["server"]
) => {
	switch (selectedBanner) {
		case "arcsBanner": {
			const banner = arcBanners.find((b) => {
				return (
					b.getStartDate() < pull.timestamp &&
					b.getEndDate() > pull.timestamp
				)
			})
			return banner?.rateupItem === pull.rewardId
		}
		case "limitedBanner": {
			const banner = gachaBanners.find((b) => {
				return (
					b.getStartDate(server) < pull.timestamp &&
					b.getEndDate(server) > pull.timestamp
				)
			})
			return banner?.rateupItem === pull.rewardId
		}
		case "permanentBanner":
			return permanentBanner.rateupItems.includes(pull.rewardId)
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

function PullsListSection() {
	const { gachaPulls } = useGachaStore()
	const { selectedBanner, gachaBanners } = usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const [page, setPage] = useState<number>(0)
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

	const pulls: MiracleBoxPull[] | ScarboroughFairPull[] = useMemo(
		() => Object.values(gachaPulls[selectedBanner]) ?? [],
		[gachaPulls, selectedBanner]
	)

	const pityMap = useMemo(() => {
		const pityMap = new Map<string, number>()

		// Arc Banner: count pity in groups of 10
		if (selectedBanner === "arcsBanner") {
			let lastRateUpGroupIndex = 0
			let groupIndex = 0
			let lastRateUpGroupPity = 0

			for (let i = pulls.length - 1; i >= 0; i--) {
				const pull = pulls[i]
				// start group index from 0
				const pullGroupIndex = Math.ceil(
					(pulls.length - i) / pullsPerPage
				)

				// When entering a new group
				if (pullGroupIndex !== groupIndex) {
					groupIndex = pullGroupIndex
				}

				if (isRateUp(selectedBanner, gachaBanners, pull, server)) {
					// Rate-up shows the group pity it was pulled at
					const groupPity = (groupIndex - lastRateUpGroupIndex) * 10
					pityMap.set(pull.uid, groupPity)
					lastRateUpGroupPity = groupPity
					lastRateUpGroupIndex = groupIndex
					continue
				}

				let groupPity: number
				if (groupIndex === lastRateUpGroupIndex) {
					// keep same pity as rate-up for pulls after the rate-up pull
					groupPity = lastRateUpGroupPity
				} else if (groupIndex === lastRateUpGroupIndex + 1) {
					// reset pity after rate-up pull
					groupPity = 10
				} else {
					// count up normally from 0 from the last rate-up pull
					groupPity = (groupIndex - lastRateUpGroupIndex) * 10
				}
				pityMap.set(pull.uid, groupPity)
			}
		} else {
			// Limited/Permanent Banner: count pity normally
			let pityCounter = 1

			for (let i = pulls.length - 1; i >= 0; i--) {
				const pull = pulls[i]
				const isScarborough = isScarboroughPull(pull)

				if (isRateUp(selectedBanner, gachaBanners, pull, server)) {
					pityMap.set(pull.uid, pityCounter)
					pityCounter = 1
					continue
				}

				pityMap.set(pull.uid, pityCounter)

				const shouldSkip = isScarborough && pull.resultType !== "dice"
				if (!shouldSkip) {
					pityCounter++
				}
			}
		}

		return pityMap
	}, [pulls, gachaBanners, server, selectedBanner])

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
			</div>
			{mounted && (
				<>
					<button
						data-type="prev"
						disabled={clampedPage === 0}
						onClick={(e) => {
							e.stopPropagation()
							setPage((current) => {
								return Math.max(current - 1, 0)
							})
						}}>
						Prev
					</button>
					<span>{clampedPage + 1}</span>
					<button
						data-type="next"
						disabled={clampedPage === maxPages}
						onClick={(e) => {
							e.stopPropagation()
							setPage((current) => {
								return Math.min(current + 1, maxPages)
							})
						}}>
						Next
					</button>
				</>
			)}
		</div>
	)
}

export function BannerSelector() {
	const { selectedBanner, setSelectedBanner, gachaBanners } =
		usePullTrackerContext()
	const now = useNow()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const currentLimitedBanner = useMemo(() => {
		if (now === null) return characterBannerFallback
		return (
			gachaBanners.find((banner) => {
				return (
					banner.getStartDate(server) < now &&
					banner.getEndDate(server) > now
				)
			}) ?? characterBannerFallback
		)
	}, [gachaBanners, now, server])

	const currentArcBanner = useMemo(() => {
		if (now === null) return arcBannerFallback
		return (
			arcBanners.find((banner) => {
				return banner.getStartDate() < now && banner.getEndDate() > now
			}) ?? arcBannerFallback
		)
	}, [now])

	return (
		<div className={styles.bannerSelection}>
			<div
				style={
					{
						"--offset": currentLimitedBanner.yOffset,
						"--theme-color": currentLimitedBanner.themeColor,
						"--bg-image": `url("/events/${currentLimitedBanner.eventImage}")`,
					} as CSSProperties
				}
				className={`${styles.bannerSelect} ${selectedBanner === "limitedBanner" ? styles.selected : ""}`}
				onClick={(e) => {
					e.stopPropagation()
					setSelectedBanner("limitedBanner")
				}}>
				<div className={styles.timeRemaining}>
					{(now &&
						formatTimeRemaining(
							currentLimitedBanner.getEndDate(server) - now
						)) ||
						"-"}
				</div>
				<div className={styles.bannerName}>Limited Character Board</div>
			</div>
			<div
				style={
					{
						"--theme-color": currentLimitedBanner.themeColor,
						"--bg-image": `url("/arcs/${findArc(currentArcBanner.rateupItem).imageSrc}")`,
					} as CSSProperties
				}
				data-type="arc"
				className={`${styles.bannerSelect} ${selectedBanner === "arcsBanner" ? styles.selected : ""}`}
				onClick={(e) => {
					e.stopPropagation()
					setSelectedBanner("arcsBanner")
				}}>
				<div className={styles.timeRemaining}>
					{(now &&
						formatTimeRemaining(
							currentArcBanner.getEndDate() - now
						)) ||
						"-"}
				</div>
				<div className={styles.bannerName}>Arc Miracle Box</div>
			</div>
			<div
				style={
					{
						"--offset": "50%",
					} as CSSProperties
				}
				data-type="limited"
				className={`${styles.bannerSelect} ${selectedBanner === "permanentBanner" ? styles.selected : ""}`}
				onClick={(e) => {
					e.stopPropagation()
					setSelectedBanner("permanentBanner")
				}}>
				<div className={styles.bannerName}>Strange Encounters</div>
			</div>
		</div>
	)
}

export function RenderPulls() {
	const [selectedBanner, setSelectedBanner] =
		useState<keyof PullsRecord>("limitedBanner")

	const gachaBanners = useMemo(
		() => Events.filter((event) => event.type === "Gacha"),
		[]
	)

	return (
		<main className={`page ${styles.page}`} role="main">
			<PullTrackerContext.Provider
				value={{
					selectedBanner,
					setSelectedBanner,
					gachaBanners,
				}}>
				<BannerSelector />
				<PullsListSection />
				<ImportSection />
			</PullTrackerContext.Provider>
		</main>
	)
}
