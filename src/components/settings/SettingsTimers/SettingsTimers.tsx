"use client"

import { useState } from "react"

import { SettingsRecord } from "@/types/settings"

import { useT } from "@/contexts"

import { useNow } from "@/hooks"

import {
	formatMinutesSeconds,
	formatTimeRemaining,
	getNextPixelRecoveryTime,
	getPixelsRefillTime,
	getWeeklyResetBoundaries,
} from "@/helpers"

import styles from "@/app/[lang]/settings/settings.module.css"

export function StaminaResetCountdown({
	server,
}: {
	server: SettingsRecord["userdata"]["server"]
}) {
	const t = useT()
	const now = useNow(60_000)

	const content =
		now === null
			? t("settings.timers.resetInUnknown")
			: (() => {
					const { nextReset } = getWeeklyResetBoundaries(server, now)
					return t("settings.timers.resetIn", {
						time: formatTimeRemaining(nextReset - now),
					})
				})()

	return (
		<div className={styles.timerRow}>
			<div>{content}</div>
		</div>
	)
}

export function PixelRefillCountdown({
	current,
	max,
	lastEdited,
}: {
	current: number
	max: number
	lastEdited: number
}) {
	const t = useT()
	const now = useNow()
	// Lazy initializer (not an effect) so this is captured once on mount,
	// same value on the server and the first client render.
	const [mountTime] = useState(() => Date.now())

	let nextText = "-"
	let fullText = "-"

	if (now !== null) {
		const baseline = lastEdited || mountTime

		const refilledAt = getPixelsRefillTime({
			current,
			max,
			lastEdited: baseline,
		})

		const nextRecoveryAt = getNextPixelRecoveryTime({
			current,
			max,
			lastEdited: baseline,
			now,
		})

		nextText =
			nextRecoveryAt === null
				? "-"
				: formatMinutesSeconds(nextRecoveryAt - now)
		fullText =
			refilledAt === null ? "-" : formatTimeRemaining(refilledAt - now)
	}

	return (
		<div className={styles.timerRow}>
			<div>{t("settings.timers.next", { time: nextText })}</div>
			<div>{t("settings.timers.full", { time: fullText })}</div>
		</div>
	)
}
