"use client"

import { useMemo, useState } from "react"

import { MiracleBoxPull, PullsRecord, ScarboroughFairPull } from "@/types/pulls"
import { SettingsRecord } from "@/types/settings"

import { EnumRarity } from "@/data/items"
import { Events } from "@/data/activities/events"

import { useGachaStore } from "@/hooks"

import {
	calculatePityMap,
	getBannerThemeColor,
	getResolvedGachaBanners,
	permanentRateupSet,
	staticArcBanners,
} from "@/helpers"

import {
	PullTrackerContext,
	RateUpPull,
	useSettingsConfigContext,
} from "@/contexts"

import {
	BannerSelector,
	PullsListSection,
	ImportSection,
	RateUpSection,
} from "@/components/pulls"

import styles from "./page.module.css"

const staticGachaBanners = Events.filter((event) => event.type === "Gacha")

function extractBannerRateUps(
	banner: keyof PullsRecord,
	pulls: (MiracleBoxPull | ScarboroughFairPull)[],
	bannerPityMap: Map<string, number>,
	server: SettingsRecord["userdata"]["server"]
): RateUpPull[] {
	const list: RateUpPull[] = []
	const isArc = banner === "arcsBanner"
	const isPerm = banner === "permanentBanner"
	const resolvedLimited =
		isArc || isPerm
			? null
			: getResolvedGachaBanners(staticGachaBanners, server)

	for (let i = 0; i < pulls.length; i++) {
		const pull = pulls[i]
		let rateUp = false
		let themeColor: string | undefined

		if (isArc) {
			const arcBanner = staticArcBanners.find(
				(b) => b.startDate < pull.timestamp && b.endDate > pull.timestamp
			)
			rateUp = arcBanner?.rateupItem === pull.rewardId
			if (rateUp) {
				themeColor =
					arcBanner?.themeColor ??
					getBannerThemeColor(pull, banner, staticGachaBanners, server)
			}
		} else if (isPerm) {
			rateUp = permanentRateupSet.has(pull.rewardId)
			if (rateUp) {
				themeColor = "#006fe2"
			}
		} else {
			const activeBanner = resolvedLimited?.find(
				(b) => b.startDate < pull.timestamp && b.endDate > pull.timestamp
			)
			rateUp = activeBanner?.rateupItem === pull.rewardId
			if (rateUp) {
				themeColor = activeBanner?.themeColor ?? "var(--pink)"
			}
		}

		const isArcEpic = isArc && pull.rank === EnumRarity.Epic
		if (!rateUp && !isArcEpic) continue

		list.push({
			pull,
			pity: bannerPityMap.get(pull.uid) ?? 0,
			themeColor: rateUp
				? (themeColor ?? "var(--pink)")
				: "var(--rarity-color)",
		})
	}

	return list
}

export function RenderPulls() {
	const { gachaPulls } = useGachaStore()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const [selectedBanner, setSelectedBanner] =
		useState<keyof PullsRecord>("limitedBanner")

	const pullsRecord: Record<
		keyof PullsRecord,
		(MiracleBoxPull | ScarboroughFairPull)[]
	> = useMemo(
		() => ({
			limitedBanner: Object.values(gachaPulls.limitedBanner ?? {}),
			arcsBanner: Object.values(gachaPulls.arcsBanner ?? {}),
			permanentBanner: Object.values(gachaPulls.permanentBanner ?? {}),
		}),
		[gachaPulls]
	)

	const { pityMap, rateUpPulls } = useMemo(() => {
		const bannerPityMap: Record<keyof PullsRecord, Map<string, number>> = {
			limitedBanner: calculatePityMap(
				pullsRecord.limitedBanner,
				"limitedBanner",
				staticGachaBanners,
				server
			),
			arcsBanner: calculatePityMap(
				pullsRecord.arcsBanner,
				"arcsBanner",
				staticGachaBanners,
				server
			),
			permanentBanner: calculatePityMap(
				pullsRecord.permanentBanner,
				"permanentBanner",
				staticGachaBanners,
				server
			),
		}

		const bannerRateUps: Record<keyof PullsRecord, RateUpPull[]> = {
			limitedBanner: extractBannerRateUps(
				"limitedBanner",
				pullsRecord.limitedBanner,
				bannerPityMap.limitedBanner,
				server
			),
			arcsBanner: extractBannerRateUps(
				"arcsBanner",
				pullsRecord.arcsBanner,
				bannerPityMap.arcsBanner,
				server
			),
			permanentBanner: extractBannerRateUps(
				"permanentBanner",
				pullsRecord.permanentBanner,
				bannerPityMap.permanentBanner,
				server
			),
		}

		return {
			pityMap: bannerPityMap,
			rateUpPulls: bannerRateUps,
		}
	}, [pullsRecord, server])

	const currentPity = useMemo(() => {
		const activePulls = pullsRecord[selectedBanner]
		if (!activePulls || activePulls.length === 0) return 0
		return pityMap[selectedBanner]?.get(activePulls[0].uid) ?? 0
	}, [pullsRecord, selectedBanner, pityMap])

	return (
		<main className={`page ${styles.page}`} role="main">
			<PullTrackerContext.Provider
				value={{
					selectedBanner,
					setSelectedBanner,
					gachaBanners: staticGachaBanners,
					pulls: pullsRecord[selectedBanner],
					pityMap,
					currentPity,
					rateUpPulls,
				}}>
				<BannerSelector />
				<PullsListSection />
				<ImportSection />
				<RateUpSection />
			</PullTrackerContext.Provider>
		</main>
	)
}
