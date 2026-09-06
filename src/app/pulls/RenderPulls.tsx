"use client"

import { useMemo, useState } from "react"

import { MiracleBoxPull, PullsRecord, ScarboroughFairPull } from "@/types/pulls"

import { Events } from "@/data/activities/events"

import {
	PullTrackerContext,
	RateUpPull,
	useSettingsConfigContext,
} from "@/contexts"
import { useGachaStore } from "@/hooks"
import { calculatePityMap, isRateUp } from "@/helpers"

import {
	BannerSelector,
	PullsListSection,
	ImportSection,
} from "@/components/pulls"

import styles from "./page.module.css"

export function RenderPulls() {
	const { gachaPulls } = useGachaStore()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const [selectedBanner, setSelectedBanner] =
		useState<keyof PullsRecord>("limitedBanner")

	const gachaBanners = useMemo(
		() => Events.filter((event) => event.type === "Gacha"),
		[]
	)

	const pulls: (MiracleBoxPull | ScarboroughFairPull)[] = useMemo(
		() => Object.values(gachaPulls[selectedBanner]) ?? [],
		[gachaPulls, selectedBanner]
	)

	const pityMap = useMemo(() => {
		return calculatePityMap(pulls, selectedBanner, gachaBanners, server)
	}, [pulls, selectedBanner, gachaBanners, server])

	const currentPity = useMemo(() => {
		if (pulls.length === 0) return 0
		return pityMap.get(pulls[0].uid) ?? 0
	}, [pulls, pityMap])

	const rateUpPulls: RateUpPull[] = useMemo(() => {
		return pulls
			.filter((pull) =>
				isRateUp(selectedBanner, gachaBanners, pull, server)
			)
			.map((pull) => ({
				pull,
				pity: pityMap.get(pull.uid) ?? 0,
			}))
	}, [pulls, selectedBanner, gachaBanners, server, pityMap])

	return (
		<main className={`page ${styles.page}`} role="main">
			<PullTrackerContext.Provider
				value={{
					selectedBanner,
					setSelectedBanner,
					gachaBanners,
					pulls,
					pityMap,
					currentPity,
					rateUpPulls,
				}}>
				<BannerSelector />
				<PullsListSection />
				<ImportSection />
			</PullTrackerContext.Provider>
		</main>
	)
}
