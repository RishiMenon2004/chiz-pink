"use client"

import Image from "next/image"
import {
	CSSProperties,
	MouseEventHandler,
	ReactNode,
	RefObject,
	useEffect,
	useRef,
	useState,
} from "react"
import { createPortal } from "react-dom"

import { EventData } from "@/data/activities/events"
import { stopPropogation } from "@/helpers"
import { formatEventDateTime } from "@/helpers/serverTime"

import { useCalendarContext } from "./EventCalendar"

import styles from "./EventCalendar.module.css"

function EventDetailsModal({
	onClickOut,
	children,
}: {
	onClickOut: MouseEventHandler
	children: ReactNode
}) {
	const [mountStyles, setMountStyles] = useState({
		"--blur-radius": "0px",
		opacity: 0,
	})

	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		const mount = setTimeout(
			() =>
				setMountStyles({
					"--blur-radius": "2px",
					opacity: 1,
				}),
			100
		)
		return () => {
			clearTimeout(mount)
			if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		}
	}, [])

	return (
		<div
			style={mountStyles as CSSProperties}
			className="modal-container blur no-body-scroll"
			onScroll={(e) => e.stopPropagation()}
			onClick={(e) => {
				e.stopPropagation()
				setMountStyles((prev) => {
					return {
						...prev,
						opacity: 0,
					}
				})
				closeTimeoutRef.current = setTimeout(() => onClickOut(e), 250)
			}}>
			{children}
		</div>
	)
}

const DETAILS_IMAGE_ASPECT = 1080 / 1920 // matches the <Image width={1920} height={1080}> below

function getMatchingImageOffsetPercent(eventBox: HTMLDivElement) {
	const yPercent = parseFloat(getComputedStyle(eventBox).backgroundPositionY)
	const containerHeight = eventBox.clientHeight
	const imageHeight = eventBox.clientWidth * DETAILS_IMAGE_ASPECT
	if (!yPercent || !imageHeight) return 0
	return yPercent * (containerHeight / imageHeight - 1)
}

// initial styles are set up on click to avoid snappy or jittery movement
// when the component mounts and transitions take effect
function getInitialDetailsStyle(eventBox: HTMLDivElement): CSSProperties {
	const rect = eventBox.getBoundingClientRect()
	return {
		left: rect.x + eventBox.clientWidth / 2,
		top: rect.y,
		height: eventBox.clientHeight,
		width: eventBox.clientWidth,
		maxWidth: "200vw",
		opacity: 0,
		"--gradient-opening": "100%",
		"--image-offset": `translateY(${getMatchingImageOffsetPercent(eventBox)}%)`,
	} as CSSProperties
}

function EventDetailsBox({
	eventData,
	eventBoxRef,
	initialStyle,
}: {
	eventData: EventData
	eventBoxRef: RefObject<HTMLDivElement>
	initialStyle: CSSProperties
}) {
	const [finalSize, setFinalSize] = useState<CSSProperties>(initialStyle)

	useEffect(() => {
		const mount1 = setTimeout(
			() =>
				setFinalSize((prev) => {
					return {
						...prev,
						opacity: 1,
					}
				}),
			300
		)

		const mount2 = setTimeout(() => {
			const eventRect = eventBoxRef.current.getBoundingClientRect()
			const rootFontSizePx = parseFloat(
				getComputedStyle(document.documentElement).fontSize
			)
			const viewportMarginRem = 2
			const maxWidthFromViewportWidth =
				window.innerWidth / rootFontSizePx - viewportMarginRem
			const maxWidthFromViewportHeight =
				(window.innerHeight / rootFontSizePx - viewportMarginRem) /
				DETAILS_IMAGE_ASPECT
			const widthRem = Math.min(
				48,
				maxWidthFromViewportWidth,
				maxWidthFromViewportHeight
			)
			const heightRem = widthRem * DETAILS_IMAGE_ASPECT
			const heightPx = heightRem * rootFontSizePx

			const top =
				eventRect.top + heightPx > window.innerHeight
					? Math.max(eventRect.bottom - heightPx, 0)
					: eventRect.top

			setFinalSize((prev) => {
				return {
					...prev,
					left: "calc(50% + var(--sidebar-width)/2)",
					top:
						window.innerHeight <= 800
							? (window.innerHeight - heightPx) / 2
							: top,
					height: `${heightRem}rem`,
					width: `${widthRem}rem`,
					borderRadius: "1rem",
					clipPath: `inset(0px)`,
					fontSize: "1.5em",
					"--gradient-opening": "600%",
					"--image-offset": "translateY(0%)",
				} as CSSProperties
			})
		}, 300)
		return () => {
			clearTimeout(mount1)
			clearTimeout(mount2)
		}
	}, [eventBoxRef, eventData.yOffset])

	const { server, dayBoundaryMode } = useCalendarContext()

	return (
		<div
			onClick={stopPropogation}
			className={styles.eventDetailsBox}
			style={
				{
					"--theme-color": eventData.themeColor,
					...finalSize,
				} as CSSProperties
			}>
			<Image
				className={styles.eventDetailsImage}
				style={{
					transform: "var(--image-offset)",
				}}
				src={`/events/${eventData.eventImage!}`}
				width={1920}
				height={1080}
				alt={eventData.name}
			/>
			<div className={styles.eventDates}>
				{formatEventDateTime(
					eventData.getStartDate(server),
					dayBoundaryMode,
					server
				)}
				{" ▸ "}
				{formatEventDateTime(
					eventData.getEndDate(server),
					dayBoundaryMode,
					server
				)}
				<span
					style={{
						textTransform: "capitalize",
					}}>
					{dayBoundaryMode === "local"
						? " (Local Time)"
						: " (Server Time)"}
				</span>
			</div>
		</div>
	)
}

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

	const eventImage = eventData.eventImage
		? `url('/events/${eventData.eventImage}')`
		: ""

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
		"--event-image": eventImage,
		"--theme-color": eventData.themeColor ?? "",
		"--y-offset": eventData.yOffset ?? "",
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
				createPortal(
					<EventDetailsModal onClickOut={closeDetails}>
						<EventDetailsBox
							eventBoxRef={eventBoxRef}
							eventData={eventData}
							initialStyle={detailsInitialStyle}
						/>
					</EventDetailsModal>,
					document.body
				)}
		</div>
	)
}
