"use client"

import { CSSProperties, useRef, useState } from "react"
import Image from "next/image"

import type { DayBoundaryMode } from "@/types/calendar"

import { useNow, useSettingsStore } from "@/hooks"

import { formatBannerCountdown, getCharacterActiveBanner } from "@/helpers/bannerStatus"

import { useT } from "@/contexts"

import { EventDetails, getInitialDetailsStyle } from "@/components/layout/EventDetails"

import styles from "../profile.module.css"

export function ProfileBanner({ characterId }: { characterId: string }) {
	const t = useT()
	const now = useNow()
	const { settings } = useSettingsStore()
	const frameRef = useRef<HTMLDivElement>(null!)
	const [detailsStyle, setDetailsStyle] = useState<CSSProperties | null>(null)

	if (now === null) return null

	const banner = getCharacterActiveBanner(characterId, now)
	if (!banner) return null

	const { event, start, end } = banner
	const live = start <= now
	const dayBoundaryMode: DayBoundaryMode =
		settings.behaviour["calendar-day-boundary"] ?? "server"

	const openDetails = () => {
		if (event.eventImage) setDetailsStyle(getInitialDetailsStyle(frameRef.current))
	}

	return (
		<>
			<div
				ref={frameRef}
				className={styles.bannerFrame}
				style={
					{ "--theme-color": event.themeColor ?? "var(--pink)" } as CSSProperties
				}
				role="button"
				tabIndex={0}
				aria-label={t("profile.banner.expand", { name: event.name })}
				onClick={openDetails}
				onKeyDown={(e) => {
					if (e.key !== "Enter" && e.key !== " ") return
					e.preventDefault()
					openDetails()
				}}>
				{event.eventImage && (
					<Image
						src={`/events/${event.eventImage}`}
						alt={event.name}
						width={1920}
						height={1080}
						sizes="(max-width: 1000px) 100vw, 60vw"
					/>
				)}
				<div className={styles.bannerInfo}>
					<div className={styles.bannerName}>{event.name}</div>
					<div className={styles.bannerCountdown}>
						{t.rich(live ? "profile.banner.endsIn" : "profile.banner.startsIn", {
							b: (text) => <strong>{text}</strong>,
							time: formatBannerCountdown((live ? end : start) - now),
						})}
					</div>
				</div>
			</div>
			{detailsStyle && (
				<EventDetails
					sourceRef={frameRef}
					onClose={() => setDetailsStyle(null)}
					eventData={event}
					initialStyle={detailsStyle}
					server={settings.userdata.server}
					dayBoundaryMode={dayBoundaryMode}
					showProfileLink={false}
					centered
					themeOverlay={false}
				/>
			)}
		</>
	)
}
