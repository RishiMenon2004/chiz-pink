"use client"

import { CSSProperties, KeyboardEvent, ReactNode, useId, useMemo, useRef, useState } from "react"
import Image from "next/image"

import type { Arc } from "@/types/weapon"
import type { Character } from "@/types/character"
import type { Material } from "@/types/item"
import type { BannerType, Pull } from "@/types/pulls"
import type { MessageKey } from "@/types/messages"

import { annulith } from "@/data/items/materials"

import {
	countUnloggedPulls,
	findPullBanner,
	findPullItem,
	getResolvedGachaBanners,
	isRateUp,
	isScarboroughPull,
} from "@/helpers"

import {
	usePullTrackerContext,
	useSettingsConfigContext,
	useT,
} from "@/contexts"

import { ArcIcon, CharacterAvatar, InfoBox } from "@/components/layout"

import pageStyles from "@/app/[lang]/pulls/page.module.css"
import styles from "./statsSection.module.css"

// Arc pity counts ten-pull groups; its soft pity isn't known.
const pityRules: Record<BannerType, { soft?: number; hard: number }> = {
	limitedBanner: { soft: 70, hard: 90 },
	permanentBanner: { soft: 70, hard: 90 },
	arcsBanner: { hard: 80 },
}

// What one pull costs in Annulith, the price of a dice (see CurrencyBox).
const ANNULITH_PER_PULL = 160

type Tab = "overview" | "sRanks" | "banners"

const tabLabels: Record<Tab, MessageKey> = {
	overview: "pulls.stats.tabs.overview",
	sRanks: "pulls.stats.tabs.sRanks",
	banners: "pulls.stats.tabs.banners",
}

type BannerStats = {
	name: string
	themeColor: string | null
	pulls: number
	sRanks: number
}

type SRank = {
	uid: string
	item: Arc | Character | Material
	pity: number
}

// Where a pity value sits on a scale running from 0 to hard pity.
const scaleAt = (value: number, hard: number) => Math.min(value / hard, 1)

// The green-to-red pity colour Recent S-Ranks uses, keyed off --pity-share.
const pityStyle = (pity: number, hard: number) =>
	({ "--pity-share": `${scaleAt(pity, hard) * 100}%` }) as CSSProperties

function ItemPortrait({ item }: { item: SRank["item"] }) {
	if ("abilities" in item) {
		return (
			<CharacterAvatar
				character={item}
				width={256}
				height={256}
				className={styles.portrait}
			/>
		)
	}
	if ("effect" in item) {
		return <ArcIcon arc={item} width={256} height={256} className={styles.portrait} />
	}
	return null
}

// Pity so far, on a track running to hard pity with the soft pity stretch
// shaded at its end.
function PityMeter({
	current,
	average,
	soft,
	hard,
}: {
	current: number
	// Average pity per S-rank, drawn as a line in the Average Pity tile's
	// colour. Undefined before the first S-rank.
	average?: number
	soft?: number
	hard: number
}) {
	const t = useT()
	const at = (value: number) => `${scaleAt(value, hard) * 100}%`

	const toHard = Math.max(hard - current, 0)
	const toSoft = soft !== undefined ? Math.max(soft - current, 0) : undefined

	return (
		<div className={styles.meter}>
			<div className={styles.meterHeading}>
				<span className={styles.meterCurrent}>
					{t("pulls.stats.currentPity")}
					<strong>{current}</strong>
				</span>
				<span className={styles.meterRemaining}>
					{toSoft !== undefined && toSoft > 0 && (
						<span>{t("pulls.stats.toSoftPity", { count: toSoft })}</span>
					)}
					<span>{t("pulls.stats.toHardPity", { count: toHard })}</span>
				</span>
			</div>
			<div
				className={styles.meterTrack}
				role="img"
				aria-label={t("pulls.stats.meterLabel", { current, hard })}>
				{soft !== undefined && (
					<div className={styles.softZone} style={{ left: at(soft) }} />
				)}
				<div
					className={styles.meterFill}
					style={{ ...pityStyle(current, hard), width: at(current) }}
				/>
				{average !== undefined && (
					<div className={styles.averageMark} style={{ left: at(average) }} />
				)}
			</div>
			<div className={styles.meterScale}>
				<span style={{ left: 0 }}>0</span>
				{average !== undefined && (
					<span className={styles.averageLabel} style={{ left: at(average) }}>
						{t("pulls.stats.averageShort")}
					</span>
				)}
				{soft !== undefined && (
					<span className={styles.softLabel} style={{ left: at(soft) }}>
						{t("pulls.stats.softPityAt", { pity: soft })}
					</span>
				)}
				<span style={{ left: "100%" }}>{hard}</span>
			</div>
		</div>
	)
}

// Every S-rank in the order it was pulled, each standing as tall as the
// pity it took with its portrait on top. Recent S-Ranks lists the same
// numbers, so nothing here is only readable on hover.
function PityLineup({
	sRanks,
	soft,
	hard,
}: {
	sRanks: SRank[]
	soft?: number
	hard: number
}) {
	const t = useT()
	const at = (value: number) => `${scaleAt(value, hard) * 100}%`
	const ticks = soft !== undefined ? [0, soft, hard] : [0, hard / 2, hard]

	return (
		<div
			className={styles.lineup}
			role="group"
			aria-label={t("pulls.stats.pityChartTitle")}>
			<div className={styles.lineupPlot}>
				{soft !== undefined && (
					<div className={styles.softZone} style={{ bottom: at(soft) }}>
						<span className={styles.softLabel}>{t("pulls.stats.softPity")}</span>
					</div>
				)}
				{ticks.map((tick) => (
					<div key={tick} className={styles.tick} style={{ bottom: at(tick) }}>
						<span>{tick}</span>
					</div>
				))}
				<div className={styles.columns}>
					{sRanks.map((sRank) => (
						<div
							key={sRank.uid}
							className={styles.column}
							tabIndex={0}
							aria-label={t("pulls.stats.columnLabel", {
								name: sRank.item.name,
								pity: sRank.pity,
							})}>
							<div
								className={styles.columnBar}
								style={{ ...pityStyle(sRank.pity, hard), height: at(sRank.pity) }}>
								<div className={styles.columnHead}>
									<ItemPortrait item={sRank.item} />
								</div>
								<div className={styles.columnTip} aria-hidden>
									<strong>{sRank.pity}</strong>
									<span>{sRank.item.name}</span>
								</div>
							</div>
						</div>
					))}
				</div>
				{soft !== undefined && (
					<div className={styles.softLine} style={{ bottom: at(soft) }} />
				)}
			</div>
		</div>
	)
}

function Stat({
	label,
	value,
	icon,
	className,
}: {
	label: string
	value: string | number
	icon?: ReactNode
	className?: string
}) {
	return (
		<div className={`${styles.stat} ${className ?? ""}`}>
			{icon}
			<span className={styles.statValue}>{value}</span>
			<span className={styles.statLabel}>{label}</span>
		</div>
	)
}

export function StatsSection() {
	const { selectedBanner, gachaBanners, pulls, pityMap, pullNumberMap } =
		usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()
	const t = useT()

	const [activeTab, setActiveTab] = useState<Tab>("overview")
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
	const baseId = useId()

	// The permanent board is a single banner, so it has nothing to break down.
	const tabs: Tab[] =
		selectedBanner === "permanentBanner"
			? ["overview", "sRanks"]
			: ["overview", "sRanks", "banners"]
	const currentTab = tabs.includes(activeTab) ? activeTab : "overview"
	const activeIndex = tabs.indexOf(currentTab)

	const stats = useMemo(() => {
		const pity = pityMap[selectedBanner]
		const numbers = pullNumberMap[selectedBanner]
		const limitedBanners = getResolvedGachaBanners(gachaBanners, server)

		// Points gifts and the like come with a pull rather than being one.
		const counted = pulls.filter((pull) => (numbers.get(pull.uid) ?? -1) > 0)
		const isSRank = (pull: Pull) =>
			isRateUp(selectedBanner, gachaBanners, pull, server)

		// Oldest first, the order they were pulled in.
		const sRanks: SRank[] = counted
			.filter(isSRank)
			.reverse()
			.map((pull) => ({
				uid: pull.uid,
				item: findPullItem(
					pull.rewardId,
					isScarboroughPull(pull) ? pull.rewardType : "arc"
				),
				pity: pity.get(pull.uid) ?? 0,
			}))

		// Newest first, so the first pull is the latest. Nothing counts towards
		// pity yet when that was an S-rank.
		const latest = counted[0]
		const currentPity =
			latest && !isSRank(latest) ? (pity.get(latest.uid) ?? 0) : 0

		const banners = new Map<string, BannerStats>()
		for (const pull of counted) {
			const banner = findPullBanner(selectedBanner, pull, limitedBanners)
			const name = banner?.name ?? t("pulls.list.unknownBanner")
			const entry = banners.get(name) ?? {
				name,
				themeColor: banner?.themeColor ?? null,
				pulls: 0,
				sRanks: 0,
			}
			entry.pulls++
			if (isSRank(pull)) entry.sRanks++
			banners.set(name, entry)
		}

		// Pities set by hand can stand for pulls that weren't logged, too.
		const unloggedPulls = countUnloggedPulls(pulls, selectedBanner, gachaBanners, server)

		return {
			totalPulls: counted.length + unloggedPulls,
			sRanks,
			currentPity,
			banners: [...banners.values()],
		}
	}, [pulls, pityMap, pullNumberMap, selectedBanner, gachaBanners, server, t])

	const rules = pityRules[selectedBanner]
	const sRankPities = stats.sRanks.map((sRank) => sRank.pity)
	const averagePity =
		sRankPities.length > 0
			? sRankPities.reduce((sum, p) => sum + p, 0) / sRankPities.length
			: undefined
	const average = averagePity?.toFixed(1) ?? "-"
	const best = sRankPities.length > 0 ? Math.min(...sRankPities) : "-"
	const worst = sRankPities.length > 0 ? Math.max(...sRankPities) : "-"

	const selectTab = (index: number) => {
		setActiveTab(tabs[index])
		tabRefs.current[index]?.focus()
	}

	// Standard tablist keys: arrows move between tabs, Home/End jump.
	const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		const last = tabs.length - 1
		const next = {
			ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
			ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
			Home: 0,
			End: last,
		}[e.key]
		if (next === undefined) return
		e.preventDefault()
		selectTab(next)
	}

	const sRanksLabel =
		selectedBanner === "arcsBanner"
			? t("pulls.stats.rateUpArcs")
			: t("pulls.stats.sRanks")

	return (
		<div
			className={`metallic-panel ${pageStyles.section} ${styles.statsSection}`}>
			<div className={pageStyles.sectionTitleRow}>
				<span className={pageStyles.sectionTitle}>{t("pulls.stats.title")}</span>
				<div
					role="tablist"
					aria-label={t("pulls.stats.title")}
					className={`inset-control ${pageStyles.sectionTabs}`}>
					{tabs.map((tab, index) => (
						<button
							key={tab}
							ref={(el) => {
								tabRefs.current[index] = el
							}}
							type="button"
							role="tab"
							id={`${baseId}-tab-${tab}`}
							aria-selected={tab === currentTab}
							aria-controls={`${baseId}-panel`}
							tabIndex={tab === currentTab ? 0 : -1}
							className={pageStyles.sectionTab}
							onClick={() => setActiveTab(tab)}
							onKeyDown={onTabKeyDown}>
							{t(tabLabels[tab])}
						</button>
					))}
				</div>
			</div>
			<div
				role="tabpanel"
				id={`${baseId}-panel`}
				aria-labelledby={`${baseId}-tab-${currentTab}`}
				className={`inset-control ${styles.statsContent}`}>
				{stats.totalPulls === 0 ? (
					<InfoBox sticker="rich" className={styles.notice}>
						<div>{t("pulls.stats.empty")}</div>
					</InfoBox>
				) : currentTab === "overview" ? (
					<>
						<div className={styles.statGrid}>
							<Stat label={t("pulls.stats.totalPulls")} value={stats.totalPulls} />
							<Stat label={sRanksLabel} value={sRankPities.length} />
							<Stat
								label={t("pulls.stats.averagePity")}
								value={average}
								className={styles.averageStat}
							/>
							<Stat
								label={t("pulls.stats.annulithSpent")}
								value={(stats.totalPulls * ANNULITH_PER_PULL).toLocaleString()}
								icon={
									<Image
										src={`/materials/${annulith.imageSrc}`}
										width={24}
										height={24}
										alt={annulith.name}
										className={styles.statIcon}
									/>
								}
							/>
						</div>
						<PityMeter
							current={stats.currentPity}
							average={averagePity}
							soft={rules.soft}
							hard={rules.hard}
						/>
					</>
				) : currentTab === "sRanks" ? (
					<>
						<div className={styles.statGrid}>
							<Stat label={t("pulls.stats.averagePity")} value={average} />
							<Stat label={t("pulls.stats.luckiest")} value={best} />
							<Stat label={t("pulls.stats.unluckiest")} value={worst} />
							{rules.soft !== undefined && (
								<>
									<Stat
										label={t("pulls.stats.beforeSoftPity")}
										value={sRankPities.filter((p) => p < rules.soft!).length}
									/>
									<Stat
										label={t("pulls.stats.inSoftPity")}
										value={sRankPities.filter((p) => p >= rules.soft!).length}
									/>
								</>
							)}
						</div>
						{stats.sRanks.length > 0 && (
							<PityLineup sRanks={stats.sRanks} soft={rules.soft} hard={rules.hard} />
						)}
					</>
				) : (
					<div className={styles.bannerTable}>
						<div className={styles.bannerHeader}>
							<span>{t("pulls.stats.banner")}</span>
							<span>{t("pulls.stats.totalPulls")}</span>
							<span>{sRanksLabel}</span>
						</div>
						{stats.banners.map((banner) => (
							<div
								key={banner.name}
								className={styles.bannerRow}
								style={
									{
										"--banner-color": banner.themeColor ?? "var(--pink)",
									} as CSSProperties
								}>
								<span className={styles.bannerName}>{banner.name}</span>
								<span>{banner.pulls}</span>
								<span>{banner.sRanks}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
