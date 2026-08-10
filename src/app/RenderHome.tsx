"use client"

import {
	DashDailyActivity,
	DashFarmingList,
	DashStaminaGauge,
	EventCalendar,
} from "@/components/home"

import styles from "./page.module.css"

export function RenderHome() {
	return (
		<main role="main" className={`page ${styles.page}`}>
			<div className={`${styles.twoColumns} ${styles.homeGrid}`}>
				<DashStaminaGauge />
				<DashDailyActivity />
				<DashFarmingList />
			</div>
			<EventCalendar />
		</main>
	)
}
