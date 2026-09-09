"use client"

import { useState } from "react"

import { SettingsRecord } from "@/types/settings"

import { useNow } from "@/hooks"

import {
	formatTimeRemaining,
	getNextPixelRecoveryTime,
	getPixelsRefillTime,
	getWeeklyResetBoundaries,
} from "@/helpers"

const resetDayTimeConfig: Intl.DateTimeFormatOptions = {
	weekday: "long",
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
}

const formatResetDayTime = (date: number): string => {
	return new Date(date)
		.toLocaleString("en-GB", resetDayTimeConfig)
		.toUpperCase()
}

export function StaminaResetCountdown({
	server,
}: {
	server: SettingsRecord["userdata"]["server"]
}) {
	const now = useNow()

	const content =
		now === null
			? "Reset in: -"
			: (() => {
					const { nextReset } = getWeeklyResetBoundaries(server, now)
					return `Reset in: ${formatTimeRemaining(nextReset - now)} at ${formatResetDayTime(nextReset)}`
				})()

	return (
		<div
			style={{
				fontFamily: "var(--font-barlow-condensed)",
				fontStyle: "italic",
				display: "flex",
				flexDirection: "row",
				flexWrap: "wrap",
				justifyContent: "space-between",
				width: "100%",
				paddingInline: "0.5rem",
				gap: "0.25rem 0.5rem",
			}}>
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
				: formatTimeRemaining(nextRecoveryAt - now)
		fullText =
			refilledAt === null ? "-" : formatTimeRemaining(refilledAt - now)
	}

	return (
		<div
			style={{
				fontFamily: "var(--font-barlow-condensed)",
				fontStyle: "italic",
				display: "flex",
				flexDirection: "row",
				flexWrap: "wrap",
				justifyContent: "space-between",
				width: "100%",
				paddingInline: "0.5rem",
				gap: "0.25rem 0.5rem",
			}}>
			<div>{`Next: ${nextText}`}</div>
			<div>{`Full: ${fullText}`}</div>
		</div>
	)
}
