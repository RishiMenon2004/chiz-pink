"use client"

import { useMemo, useState } from "react"

import { PullsRecord } from "@/types/pulls"

import { Events } from "@/data/activities/events"

import { PullTrackerContext } from "@/contexts"

import {
	BannerSelector,
	PullsListSection,
	ImportSection,
} from "@/components/pulls"

import styles from "./page.module.css"

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
