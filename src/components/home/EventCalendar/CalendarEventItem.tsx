"use client"

import Image from "next/image"
import { CSSProperties, MouseEventHandler, useRef, useState } from "react"

import { EventData } from "@/data/activities/events"
import { formatEventDateTime } from "@/helpers/serverTime"

import { useCalendarContext } from "@/contexts"

import { EventDetails, getInitialDetailsStyle } from "@/components/layout/EventDetails"

import styles from "./EventCalendar.module.css"

export function CalendarEventItem({
	eventData,
	previousEnd,
}: {
	eventData: EventData
	previousEnd: number
}) {
	const {
		daySize,
		msPerDay,
		calendarOrigin,
		calendarEnd,
		server,
		dayBoundaryMode,
		scrollToPos,
	} = useCalendarContext()

	const [showDetails, setShowDetails] = useState(false)
	const [detailsInitialStyle, setDetailsInitialStyle] =
		useState<CSSProperties | null>(null)

	const start = eventData.getStartDate(server)
	const end = eventData.getEndDate(server)

	const marginDays = ((start - previousEnd) / msPerDay) * daySize
	const widthDays = ((end - start) / msPerDay) * daySize

	const overflowsLeft = start < calendarOrigin
	const overflowsRight = end > calendarEnd

	// BTR items have no eventImage in data; their artwork is hardcoded in CSS
	const eventImageSrc =
		eventData.type === "BTR"
			? "/events/btr.webp"
			: eventData.eventImage
				? `/events/${eventData.eventImage}`
				: null

	let eventType = undefined
	let cursor = "var(--pointer-cursor)"
	switch (eventData.type) {
		case "Patch":
			eventType = styles.version
			break

		case "BTR":
			eventType = styles.btr
			break

		case "Gacha":
			eventType = styles.gacha
			cursor = "var(--resize-ne-cursor, pointer)"
			break

		case "Event":
			cursor = "var(--resize-ne-cursor, pointer)"
			break

		case "Mystery Box":
			cursor = "var(--resize-ne-cursor, pointer)"
			break

		default:
		case "Circle Gift":
			break
	}

	const eventStyles = {
		width: `${widthDays}rem`,
		marginLeft: `${marginDays}rem`,
		"--theme-color": eventData.themeColor ?? "",
		// only Patch/Gacha crops honour the custom offset, matching the
		// previous per-type background-position rules
		"--y-offset":
			eventData.type === "Patch" || eventData.type === "Gacha"
				? eventData.yOffset
				: undefined,
		"--radius-left": overflowsLeft ? "0" : undefined,
		"--radius-right": overflowsRight ? "0" : undefined,
		"--fade-left": overflowsLeft ? "3rem" : undefined,
		"--fade-right": overflowsRight ? "3rem" : undefined,
		cursor,
	} as CSSProperties

	const dateFormat: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
	}

	const closeDetails: MouseEventHandler = () => {
		setShowDetails(false)
	}

	const eventBoxRef = useRef<HTMLDivElement>(null!)

	return (
		<div
			ref={eventBoxRef}
			onClick={async (e) => {
				e.stopPropagation()
				await scrollToPos(eventBoxRef.current)
				if (
					["Patch", "Circle Gift", "BTR"].includes(eventData.type) ||
					!eventData.eventImage ||
					overflowsLeft ||
					overflowsRight
				) {
					return
				}

				setDetailsInitialStyle(
					getInitialDetailsStyle(eventBoxRef.current)
				)
				setShowDetails(true)
			}}
			className={`${styles.calendarEvent} ${eventType ? eventType : ""}`}
			style={eventStyles}>
			{eventImageSrc && (
				<Image
					className={styles.eventImage}
					src={eventImageSrc}
					alt={`${eventData.name} event banner`}
					width={1920}
					height={1080}
				/>
			)}
			<div className={styles.eventName}>
				{eventData.type === "BTR" && "Beyond the Rails: "}
				{eventData.name}
			</div>
			<div className={styles.eventDates}>
				{formatEventDateTime(start, dayBoundaryMode, server, dateFormat)}
				{" ▸ "}
				{formatEventDateTime(end, dayBoundaryMode, server, dateFormat)}
			</div>
			{showDetails &&
				detailsInitialStyle &&
				<EventDetails
					sourceRef={eventBoxRef}
					onClose={closeDetails}
					eventData={eventData}
					initialStyle={detailsInitialStyle}
					server={server}
					dayBoundaryMode={dayBoundaryMode}
				/>}
		</div>
	)
}
