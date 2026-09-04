"use client"

import { CSSProperties, useMemo } from "react"

import {
	getPhase2End,
	getPhase2Start,
} from "@/data/activities/events"
import { arcBanners } from "@/data/activities/banners"
import { findArc } from "@/data/arcs"

import { useNow } from "@/hooks"

import { formatTimeRemaining } from "@/helpers"

import {
	usePullTrackerContext,
	useSettingsConfigContext,
} from "@/contexts"

import styles from "./bannerSelector.module.css"

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
