"use client"

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
import Image from "next/image"
import Link from "next/link"

import type { DayBoundaryMode } from "@/types/calendar"
import type { SettingsRecord } from "@/types/settings"

import { EventData } from "@/data/activities/events"
import { findCharacter } from "@/data/characters"

import { stopPropagation } from "@/helpers"
import { formatEventDateTime } from "@/helpers/serverTime"

import styles from "./eventDetails.module.css"

type EventDetailsProps = {
	eventData: EventData
	initialStyle: CSSProperties
	server: SettingsRecord["userdata"]["server"]
	dayBoundaryMode: DayBoundaryMode
	// Rate-up banners link to their character; off where that's the page
	// already open.
	showProfileLink?: boolean
	// Open in the middle of the viewport rather than level with the source
	// (the calendar keeps it beside the row that was clicked).
	centered?: boolean
	// The theme-colour gradient that sweeps open over the art. Matches the
	// calendar rows' tint; off where the source art has no tint of its own.
	themeOverlay?: boolean
}

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

// measures how far the event item's own <Image> is shifted inside the box,
// as a percentage of the image height, so the details box can start with
// the exact same crop (equivalent to the old background-position-y)
function getMatchingImageOffsetPercent(eventBox: HTMLElement) {
	const eventImage = eventBox.querySelector("img")
	if (!eventImage) return 0
	const boxRect = eventBox.getBoundingClientRect()
	const imageRect = eventImage.getBoundingClientRect()
	if (!imageRect.height) return 0
	return ((imageRect.top - boxRect.top) / imageRect.height) * 100
}

// initial styles are set up on click to avoid snappy or jittery movement
// when the component mounts and transitions take effect
export function getInitialDetailsStyle(eventBox: HTMLElement): CSSProperties {
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
	server,
	dayBoundaryMode,
	showProfileLink,
	centered,
	themeOverlay = true,
}: EventDetailsProps & { eventBoxRef: RefObject<HTMLElement> }) {
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
						centered || window.innerHeight <= 800
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
	}, [eventBoxRef, eventData.yOffset, centered])

	// Character banners link to the rate-up character's profile.
	const rateUpCharacter =
		showProfileLink && eventData.type === "Gacha" && eventData.rateupItem
			? findCharacter(eventData.rateupItem)
			: undefined

	return (
		<div
			onClick={stopPropagation}
			className={styles.box}
			data-theme-overlay={themeOverlay}
			style={
				{
					"--theme-color": eventData.themeColor,
					...finalSize,
				} as CSSProperties
			}>
			<Image
				className={styles.image}
				style={{
					transform: "var(--image-offset)",
				}}
				src={`/events/${eventData.eventImage!}`}
				width={1920}
				height={1080}
				loading="eager"
				alt={eventData.name}
			/>
			<div className={styles.dates}>
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
			{rateUpCharacter && (
				<Link
					href={`/characters/${rateUpCharacter.id}`}
					className={`pill-button ${styles.profileLink}`}>
					{`VIEW ${rateUpCharacter.name.toUpperCase()}`}
				</Link>
			)}
		</div>
	)
}

// An event's art expanding out of `sourceRef` (the element it was clicked
// from) into a centred details card over a blurred backdrop. Seed
// `initialStyle` with getInitialDetailsStyle(source) at click time.
export function EventDetails({
	sourceRef,
	onClose,
	showProfileLink = true,
	...props
}: Omit<EventDetailsProps, "showProfileLink"> & {
	sourceRef: RefObject<HTMLElement>
	onClose: MouseEventHandler
	showProfileLink?: boolean
}) {
	return createPortal(
		<EventDetailsModal onClickOut={onClose}>
			<EventDetailsBox
				eventBoxRef={sourceRef}
				showProfileLink={showProfileLink}
				{...props}
			/>
		</EventDetailsModal>,
		document.body
	)
}
