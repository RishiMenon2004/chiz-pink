"use client"

import {
	createContext,
	CSSProperties,
	Ref,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"

import { useSettingsStore } from "@/hooks"

import { EventData, Events } from "@/data/activities/events"

import { SettingsRecord } from "@/types/settings"
import {
	getDayBoundaryLabel,
	SERVER_UTC_OFFSET_HOURS,
} from "@/helpers/serverTime"
import { ConfigCheckbox } from "@/app/settings/RenderSettings"

import styles from "./EventCalendar.module.css"

type DayBoundaryMode = SettingsRecord["appearance"]["calendar-day-boundary"]

const CalendarContext = createContext<{
	daySize: number
	msPerDay: number
	monthChunks: MonthChunk[]
	server: SettingsRecord["userdata"]["server"]
	windowStart: number
	windowEnd: number
	calendarOrigin: number
	now: number | null
}>(null!)

const MONTHS_BEFORE = 1
const MONTHS_AFTER = 1
const BUFFER_DAYS = 3

const monthNames = [
	"JAN",
	"FEB",
	"MAR",
	"APR",
	"MAY",
	"JUN",
	"JUL",
	"AUG",
	"SEP",
	"OCT",
	"NOV",
	"DEC",
]

// Reads the (year, month, day) civil-calendar date a UTC instant falls on,
// as seen from the wall clock of the given day-boundary mode.
function toWallDateParts(
	timestamp: number,
	mode: DayBoundaryMode,
	server: SettingsRecord["userdata"]["server"]
) {
	if (mode === "local") {
		const date = new Date(timestamp)
		return {
			year: date.getFullYear(),
			month: date.getMonth(),
			day: date.getDate(),
		}
	}

	const offsetMs = SERVER_UTC_OFFSET_HOURS[server] * 60 * 60 * 1000
	const date = new Date(timestamp + offsetMs)
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		day: date.getUTCDate(),
	}
}

// Inverse of toWallDateParts: the UTC instant that a given civil-calendar
// date's midnight refers to, under the given day-boundary mode.
function fromWallDate(
	year: number,
	month: number,
	day: number,
	mode: DayBoundaryMode,
	server: SettingsRecord["userdata"]["server"]
) {
	if (mode === "local") return new Date(year, month, day).getTime()

	const offsetMs = SERVER_UTC_OFFSET_HOURS[server] * 60 * 60 * 1000
	return Date.UTC(year, month, day) - offsetMs
}

// useLayoutEffect can't run on SSR. Swap useEffect for useLayoutEffect after first load.
const useIsomorphicLayoutEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect

const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function CalendarDateMarker({
	date,
	weekday,
}: {
	date: number
	weekday: string
}) {
	const weekend = ["Su", "Sa"].includes(weekday)
	return (
		<div className={styles.calenderDateMarker}>
			<div
				className={`${styles.markerWeekday} ${weekend ? styles.weekend : ""}`}>
				{weekday}
			</div>
			<div className={styles.markerNumber}>{date}</div>
		</div>
	)
}

type MonthChunk = {
	year: number
	month: number
	firstDay: number
	lastDay: number
}

function getDaysInMonth(year: number, month: number) {
	return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

function buildMonthChunks(
	rangeStart: number,
	rangeEnd: number,
	mode: DayBoundaryMode,
	server: SettingsRecord["userdata"]["server"]
): MonthChunk[] {
	const start = toWallDateParts(rangeStart, mode, server)
	const end = toWallDateParts(rangeEnd, mode, server)

	let year = start.year
	let month = start.month
	const endYear = end.year
	const endMonth = end.month

	const chunks: MonthChunk[] = []
	while (year < endYear || (year === endYear && month <= endMonth)) {
		const isFirst = chunks.length === 0
		const isLast = year === endYear && month === endMonth

		chunks.push({
			year,
			month,
			firstDay: isFirst ? start.day : 1,
			lastDay: isLast ? end.day : getDaysInMonth(year, month),
		})

		month++
		if (month > 11) {
			month = 0
			year++
		}
	}
	return chunks
}

function CalendarMonth({ chunk }: { chunk: MonthChunk }) {
	const { daySize } = useContext(CalendarContext)
	const dayCount = chunk.lastDay - chunk.firstDay + 1

	return (
		<div className={styles.calendarMonth}>
			<div className={styles.monthName}>{monthNames[chunk.month]}</div>
			<div
				className={styles.datesContainer}
				style={{ gridAutoColumns: `${daySize}rem` }}>
				{Array.from({ length: dayCount }).map((_, day) => {
					const dayOfMonth = chunk.firstDay + day
					const weekday =
						weekdayNames[
							new Date(
								Date.UTC(chunk.year, chunk.month, dayOfMonth)
							).getUTCDay()
						]
					return (
						<CalendarDateMarker
							date={dayOfMonth}
							weekday={weekday}
							key={day}
						/>
					)
				})}
			</div>
		</div>
	)
}

function CalendarBackground() {
	const { monthChunks } = useContext(CalendarContext)

	return (
		<div className={styles.calendarBackground}>
			{monthChunks.map((chunk, index) => (
				<CalendarMonth chunk={chunk} key={index} />
			))}
		</div>
	)
}

function CalendarNowMarker({ ref }: { ref?: Ref<HTMLDivElement> }) {
	const { msPerDay, daySize, calendarOrigin, now } = useContext(CalendarContext)

	const marginDays = useMemo(
		() => (now === null ? 0 : ((now - calendarOrigin) / msPerDay) * daySize),
		[now, calendarOrigin, daySize, msPerDay]
	)

	return (
		<div
			ref={ref}
			className={styles.calenderNowMarker}
			style={{
				marginLeft: `${marginDays}rem`,
			}}></div>
	)
}

export function EventCalendar() {
	const { settings, actions } = useSettingsStore()
	const { server } = settings.userdata
	const dayBoundaryMode: DayBoundaryMode =
		settings.appearance["calendar-day-boundary"] ?? "server"

	const calendarContainerRef = useRef<HTMLDivElement>(null)
	const calendarContentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const container = calendarContainerRef.current
		if (!container) return

		function getMaxScrollLeft() {
			const contentWidth =
				calendarContentRef.current?.offsetWidth ?? container!.scrollWidth
			return Math.max(0, contentWidth - container!.clientWidth)
		}

		function onWheel(event: WheelEvent) {
			if (event.deltaY === 0) return
			event.preventDefault()
			container!.scrollLeft = Math.min(
				Math.max(container!.scrollLeft + event.deltaY, 0),
				getMaxScrollLeft()
			)
		}

		function onScroll() {
			const maxScrollLeft = getMaxScrollLeft()
			if (container!.scrollLeft > maxScrollLeft) {
				container!.scrollLeft = maxScrollLeft
			}
		}

		container.addEventListener("wheel", onWheel, { passive: false })
		container.addEventListener("scroll", onScroll)
		return () => {
			container.removeEventListener("wheel", onWheel)
			container.removeEventListener("scroll", onScroll)
		}
	}, [])

	const nowMarkerRef = useRef<HTMLDivElement>(null)
	const [nowMarkerOutOfView, setNowMarkerOutOfView] = useState<
		"left" | "right" | false
	>(false)

	const [now, setNow] = useState<number | null>(null)

	useIsomorphicLayoutEffect(() => {
		setNow(Date.now())
		const interval = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		const container = calendarContainerRef.current
		const marker = nowMarkerRef.current
		if (!container || !marker) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting || !entry.rootBounds) {
					setNowMarkerOutOfView(false)
					return
				}
				setNowMarkerOutOfView(
					entry.boundingClientRect.left < entry.rootBounds.left
						? "left"
						: "right"
				)
			},
			{ root: container, threshold: 0 }
		)
		observer.observe(marker)
		return () => observer.disconnect()
	}, [])

	function scrollToNow(behavior: ScrollBehavior = "smooth") {
		const container = calendarContainerRef.current
		const marker = nowMarkerRef.current
		const content = calendarContentRef.current
		if (!container || !marker || !content) return
		if (container.clientWidth === 0 || content.offsetWidth === 0) return

		const maxScrollLeft = Math.max(
			0,
			content.offsetWidth - container.clientWidth
		)
		const targetScrollLeft = Math.min(
			Math.max(
				marker.offsetLeft -
					container.clientWidth / 2 +
					marker.offsetWidth / 2,
				0
			),
			maxScrollLeft
		)

		container.scrollTo({ left: targetScrollLeft, behavior })
	}

	const msPerDay = useMemo(() => 24 * 60 * 60 * 1000, [])
	const daySize = 2.5
	const leftMargin = 2

	const [mountTime] = useState(() => Date.now())
	const nowParts = toWallDateParts(mountTime, dayBoundaryMode, server)

	const windowStart = fromWallDate(
		nowParts.year,
		nowParts.month - MONTHS_BEFORE,
		1,
		dayBoundaryMode,
		server
	)
	const windowEndMonth = nowParts.month + MONTHS_AFTER
	const windowEnd = fromWallDate(
		nowParts.year,
		windowEndMonth,
		getDaysInMonth(nowParts.year, windowEndMonth),
		dayBoundaryMode,
		server
	)

	const visibleStart = windowStart - BUFFER_DAYS * msPerDay
	const visibleEnd = windowEnd + BUFFER_DAYS * msPerDay

	const monthChunks = buildMonthChunks(
		visibleStart,
		visibleEnd,
		dayBoundaryMode,
		server
	)
	const calendarOrigin = fromWallDate(
		monthChunks[0].year,
		monthChunks[0].month,
		monthChunks[0].firstDay,
		dayBoundaryMode,
		server
	)

	const lastChunk = monthChunks[monthChunks.length - 1]
	const calendarEnd = fromWallDate(
		lastChunk.year,
		lastChunk.month,
		lastChunk.lastDay + 1,
		dayBoundaryMode,
		server
	)
	const calendarWidthDays = (calendarEnd - calendarOrigin) / msPerDay

	const visibleEvents = Events.filter((eventData) => {
		const start = eventData.getStartDate(server)
		const end = eventData.getEndDate(server)
		return end > visibleStart && start < visibleEnd
	})

	const nowReady = now !== null

	useEffect(() => {
		if (!nowReady) return

		const container = calendarContainerRef.current
		const content = calendarContentRef.current
		if (!container || !content) return

		// wait for first load, then scroll to the now marker
		let didScroll = false

		function tryScrollToNow() {
			if (didScroll) return
			if (container!.clientWidth === 0 || content!.offsetWidth === 0) return
			scrollToNow("smooth")
			didScroll = true
		}

		tryScrollToNow()

		const observer = new ResizeObserver(() => tryScrollToNow())
		observer.observe(container)
		observer.observe(content)

		return () => observer.disconnect()
	}, [calendarOrigin, msPerDay, daySize, nowReady])

	const rows: EventData[][] = []
	const rowEnds: number[] = []
	let rowIndex = 0

	for (const eventData of visibleEvents) {
		if (eventData.type === "Patch") {
			rowIndex = 0
		}

		const start = eventData.getStartDate(server)
		while (rows[rowIndex]?.length && start < rowEnds[rowIndex]) {
			rowIndex++
		}

		if (!rows[rowIndex]) rows[rowIndex] = []
		rows[rowIndex].push(eventData)
		rowEnds[rowIndex] = eventData.getEndDate(server)
	}

	function renderRow(rowEvents: typeof Events, key: number, id?: string) {
		let previousEnd = calendarOrigin
		return (
			<div
				className={styles.calendarRow}
				key={`${rowEvents[0].type}_${key}`}>
				{rowEvents.map((eventData, index) => {
					const start = eventData.getStartDate(server)
					const end = eventData.getEndDate(server)
					const marginDays =
						((start - previousEnd) / msPerDay) * daySize
					const widthDays = ((end - start) / msPerDay) * daySize
					previousEnd = end
					const overflowsLeft = start < calendarOrigin
					const overflowsRight = end > calendarEnd
					const eventStyles = {
						width: `${widthDays}rem`,
						marginLeft: `${marginDays}rem`,
						"--event-image": eventData.eventImage
							? `url('/events/${eventData.eventImage}')`
							: "",
						"--theme-color": eventData.themeColor ?? "",
						"--y-offset": eventData.yOffset ?? "",
						"--radius-left": overflowsLeft ? "0" : undefined,
						"--radius-right": overflowsRight ? "0" : undefined,
						"--fade-left": overflowsLeft ? "3rem" : undefined,
						"--fade-right": overflowsRight ? "3rem" : undefined,
					} as CSSProperties

					return (
						<div
							className={`${styles.calendarEvent} ${id ? id : ""}`}
							key={`${eventData.name}_${index}`}
							style={eventStyles}>
							<div className={styles.eventName}>
								{eventData.name}
							</div>
							{
								<div className={styles.eventDates}>
									{new Date(
										eventData.getStartDate(server)
									).toLocaleString("en-US", {
										month: "short",
										day: "numeric",
									})}
									{" ▸ "}
									{new Date(
										eventData.getEndDate(server)
									).toLocaleString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</div>
							}
						</div>
					)
				})}
			</div>
		)
	}

	return (
		<div className={`metallic-panel ${styles.section}`}>
			<div className={styles.sectionTitleRow}>
				<h2 className={styles.sectionTitle}>Event Calendar</h2>
				<label
					className={styles.dayBoundaryToggle}
					style={{
						flexGrow: 1,
					}}>
					<ConfigCheckbox
						checked={dayBoundaryMode === "local"}
						onChange={(e) =>
							actions.setConfig("appearance", {
								"calendar-day-boundary": e.currentTarget.checked
									? "local"
									: "server",
							})
						}
						name={getDayBoundaryLabel(dayBoundaryMode, server)}
					/>
				</label>
				{nowMarkerOutOfView && (
					<button
						type="button"
						style={{
							fontSize: "0.8em",
							marginBlock: "0.25em",
						}}
						className="pill-button"
						onClick={() => scrollToNow()}>
						{"TODAY"}
					</button>
				)}
			</div>
			<div
				className={`raised-control ${styles.calendarContainer}`}
				style={
					{
						"--day-size": `${daySize}rem`,
						"--left-margin": `${leftMargin}rem`,
					} as CSSProperties
				}
				ref={calendarContainerRef}>
				<CalendarContext.Provider
					value={{
						daySize,
						msPerDay,
						monthChunks,
						server,
						windowStart,
						windowEnd,
						calendarOrigin,
						now,
					}}>
					<div
						ref={calendarContentRef}
						className={styles.calendarContent}
						style={{
							width: `${calendarWidthDays * daySize + leftMargin}rem`,
						}}>
						<CalendarBackground />
						{rows.map((rowEvents, index) => {
							let id: string | undefined = undefined
							switch (index) {
								default:
									id = undefined
									break
								case 0:
									id = styles.version
									break
								case 1:
									id = styles.gacha
									break
							}
							return renderRow(rowEvents, index, id)
						})}
						<CalendarNowMarker ref={nowMarkerRef} />
					</div>
				</CalendarContext.Provider>
			</div>
		</div>
	)
}
