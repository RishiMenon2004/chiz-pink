"use client"

import {
	createContext,
	CSSProperties,
	Ref,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"

import { useNow, useSettingsStore } from "@/hooks"

import { BTRTimeline, EventData, Events } from "@/data/activities/events"

import { SettingsRecord } from "@/types/settings"
import {
	getDayBoundaryLabel,
	SERVER_UTC_OFFSET_HOURS,
} from "@/helpers/serverTime"
import { ConfigCheckbox } from "@/app/settings/RenderSettings"

import styles from "./EventCalendar.module.css"
import pageStyles from "@/app/page.module.css"
import { CalendarEventItem } from "./CalendarEventItem"

export type DayBoundaryMode =
	SettingsRecord["behaviour"]["calendar-day-boundary"]

export const CalendarContext = createContext<{
	daySize: number
	msPerDay: number
	monthChunks: MonthChunk[]
	server: SettingsRecord["userdata"]["server"]
	dayBoundaryMode: DayBoundaryMode
	windowStart: number
	windowEnd: number
	calendarOrigin: number
	calendarEnd: number
	now: number | null
	scrollToPos: (el: HTMLElement, behavior?: ScrollBehavior) => Promise<void>
}>(null!)

export const useCalendarContext = () => {
	return useContext(CalendarContext)
}

const MONTHS_BEFORE = 2
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
	const { daySize } = useCalendarContext()
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
	const { monthChunks } = useCalendarContext()

	return (
		<div className={styles.calendarBackground}>
			{monthChunks.map((chunk, index) => (
				<CalendarMonth chunk={chunk} key={index} />
			))}
		</div>
	)
}

function CalendarNowMarker({ ref }: { ref?: Ref<HTMLDivElement> }) {
	const { msPerDay, daySize, calendarOrigin, now } = useCalendarContext()

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
		settings.behaviour["calendar-day-boundary"] ?? "server"

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

	const now = useNow()

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

	function scrollToPos(el: HTMLElement, behavior: ScrollBehavior = "smooth") {
		const container = calendarContainerRef.current
		const content = calendarContentRef.current
		if (!container || !content) return Promise.resolve()
		if (container.clientWidth === 0 || content.offsetWidth === 0)
			return Promise.resolve()

		const maxScrollLeft = Math.max(
			0,
			content.offsetWidth - container.clientWidth
		)
		const targetScrollLeft = Math.min(
			Math.max(
				el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2,
				0
			),
			maxScrollLeft
		)

		if (Math.round(container.scrollLeft) === Math.round(targetScrollLeft)) {
			return Promise.resolve()
		}

		return new Promise<void>((resolve) => {
			// If the requested scroll turns out to be a no-op (e.g. a sub-pixel
			// delta the browser doesn't act on), "scrollend" never fires and
			// this would hang forever without a fallback.
			const finish = () => {
				clearTimeout(timeoutId)
				container.removeEventListener("scrollend", finish)
				resolve()
			}
			const timeoutId = setTimeout(finish, 1000)

			container.addEventListener("scrollend", finish)
			container.scrollTo({ left: targetScrollLeft, behavior })
		})
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
		return (
			<div
				className={styles.calendarRow}
				key={`${rowEvents[0].type}_${key}`}>
				{rowEvents.map((eventData, index) => {
					const previousEnd =
						index > 0
							? rowEvents[Math.max(index - 1, 0)].getEndDate(server)
							: calendarOrigin
					return (
						<CalendarEventItem
							key={`${eventData.name}_${index}`}
							eventData={eventData}
							previousEnd={previousEnd}
							rowId={id}
						/>
					)
				})}
			</div>
		)
	}

	return (
		<div className={`metallic-panel ${pageStyles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>Event Calendar</h2>
				<label className={pageStyles.sectionConfig}>
					<ConfigCheckbox
						checked={dayBoundaryMode === "local"}
						onChange={(e) =>
							actions.setConfig("behaviour", {
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
						className={`pill-button ${pageStyles.sectionButton}`}
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
						dayBoundaryMode,
						windowStart,
						windowEnd,
						calendarOrigin,
						calendarEnd,
						now,
						scrollToPos,
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
								case 0:
									id = styles.version
									break
								case 1:
									id = styles.gacha
									break
								default:
									id = undefined
									break
							}
							return renderRow(rowEvents, index, id)
						})}
						{renderRow(BTRTimeline, 99, styles.btr)}
						<CalendarNowMarker ref={nowMarkerRef} />
					</div>
				</CalendarContext.Provider>
			</div>
		</div>
	)
}
