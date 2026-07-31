"use client"

import { EventCalendar } from "@/components/home/EventCalendar"
import { DashDailyActivity } from "@/components/home/DashDailyActivity"
import { DashStaminaGauge } from "@/components/home/DashStaminaGauge"

import styles from "./page.module.css"

export function RenderHome() {
	return (
		<main role="main" className={`page ${styles.page}`}>
			<div className={styles.twoColumns}>
				<DashStaminaGauge />
				<DashDailyActivity />
			</div>
			<EventCalendar />
		</main>
	)
}
