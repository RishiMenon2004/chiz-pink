"use client"

import { CSSProperties, useRef, useState } from "react"

import { Feedback } from "@dnd-kit/dom"
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/dom"
import { DragDropProvider, useDraggable } from "@dnd-kit/react"

import type { ContentFile } from "@/types/content"

import { calendarRange, snakeCase } from "@/helpers/contentJson"

import pageStyles from "@/app/page.module.css"
import styles from "./page.module.css"

type CalendarItem = {
	key: string
	// Position in content.events.
	index: number
	label: string
	first: number
	last: number
	src?: string
	themeColor?: string
	yOffset?: string
}

type DragTarget = { key: string; row: number; insert: boolean }

// The event calendar's row packing (EventCalendar.tsx): each item takes the
// first row from the current one down where it starts after that row's
// last item ends. Rows only ever move down, so the list order decides the
// layout.
function packRows(items: CalendarItem[]) {
	const rows: CalendarItem[][] = []
	const rowEnds: number[] = []
	let row = 0

	for (const item of items) {
		while (rows[row]?.length && item.first < rowEnds[row]) row++
		;(rows[row] ??= []).push(item)
		rowEnds[row] = item.last + 1
	}
	return rows
}

// The version's dated events, in list order. The patch and banners aren't
// drawn: on the site they sit above, and the banners fill their rows to the
// version's end, so events always pack from the row below them, the same
// as packing the events on their own.
function calendarItems(content: ContentFile, imageUrl: (file: string) => string | undefined) {
	const items: CalendarItem[] = []
	const { patch } = content

	for (const [index, event] of (content.events ?? []).entries()) {
		const range = calendarRange(patch, event.start, event.end)
		if (!range) continue
		items.push({
			key: `event-${index}`,
			index,
			label: event.name || "New event",
			first: range[0],
			last: range[1],
			src: event.name ? imageUrl(`${event.image || `event_${snakeCase(event.name)}`}.webp`) : undefined,
			themeColor: event.themeColor,
		})
	}

	return items
}

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

// A small copy of the event calendar's event rows for this version, on the
// Events tab. Dragging an event to another row reorders content.events so
// the calendar packs it there, or as near as its rules allow.
export function CalendarOrderPanel({
	content,
	imageUrl,
	onReorder,
}: {
	content: ContentFile
	imageUrl: (file: string) => string | undefined
	// The new order of content.events, as old indices.
	onReorder: (order: number[]) => void
}) {
	const rowsRef = useRef<HTMLDivElement>(null)
	// Where the dragged event would go: into row `row`, or into a new row
	// opened before it (`row` = row count: after the last).
	const [drag, setDrag] = useState<DragTarget | null>(null)
	// The same target for onDragEnd, which can run before the last move
	// has rendered.
	const dragRef = useRef<DragTarget | null>(null)
	const updateDrag = (next: DragTarget | null) => {
		dragRef.current = next
		setDrag(next)
	}

	const items = calendarItems(content, imageUrl)
	const rows = packRows(items)
	const rowOf = new Map(rows.flatMap((row, index) => row.map((item) => [item.key, index] as const)))

	if (items.length === 0) {
		return (
			<section className={`metallic-panel ${styles.panel}`}>
				<h2 className={pageStyles.sectionTitle}>Calendar</h2>
				<p className={styles.note}>Add an event with dates to see the calendar.</p>
			</section>
		)
	}

	// The axis covers the whole version, or just the events without dates.
	const version = calendarRange(content.patch, "phase1", "end")
	const origin = Math.min(version?.[0] ?? Infinity, ...items.map((item) => item.first))
	const span = Math.max(version?.[1] ?? -Infinity, ...items.map((item) => item.last)) - origin + 1
	const percent = (days: number) => `${(days / span) * 100}%`

	// Week ticks from the first day.
	const ticks = Array.from({ length: Math.ceil(span / 7) }, (_, week) => origin + week * 7)

	// While dragging there's always one empty row, just above the row being
	// targeted. Over that row the event drops into it; over the empty row it
	// goes into a new row there. Both targets draw the same rows, so moving
	// between neighbours only slides the empty row past the pointer, and the
	// target can be read off the live layout without it flickering.
	const targetAt = (clientY: number) => {
		const rowElements = [...(rowsRef.current?.children ?? [])] as HTMLElement[]
		for (const element of rowElements) {
			const box = element.getBoundingClientRect()
			if (clientY < box.bottom) {
				const row = Number(element.dataset.row)
				return { row, insert: element.dataset.gap === "true" }
			}
		}
		return { row: rows.length, insert: true }
	}

	const drop = (item: CalendarItem, { row, insert }: DragTarget) => {
		const current = rowOf.get(item.key)!
		if (!insert && row === current) return
		// Opening a row moves every row from there down by one.
		const shifted = (other: CalendarItem) => {
			const otherRow = rowOf.get(other.key)!
			return insert && otherRow >= row ? otherRow + 1 : otherRow
		}
		const target = (other: CalendarItem) => (other.key === item.key ? row : shifted(other))
		const dated = items
			.toSorted((a, b) => target(a) - target(b) || a.first - b.first || a.index - b.index)
			.map((other) => other.index)

		// Entries without dates aren't on the calendar; they keep their place
		// at the end.
		const undated = (content.events ?? []).map((_, index) => index).filter((index) => !dated.includes(index))
		onReorder([...dated, ...undated])
	}

	// dnd-kit follows the pointer on the document, so the rows can move under
	// it (opening the empty row above the dragged event's own row reorders
	// the DOM) without losing the drag. Nothing follows the pointer: the
	// ghost in the target row shows where the event would go.
	const onDragStart = (e: DragStartEvent) => {
		const key = e.operation.source?.id
		if (typeof key === "string") updateDrag({ key, row: rowOf.get(key)!, insert: false })
	}
	const onDragMove = (e: DragMoveEvent) => {
		const key = e.operation.source?.id
		if (typeof key === "string") updateDrag({ key, ...targetAt(e.operation.position.current.y) })
	}
	const onDragEnd = (e: DragEndEvent) => {
		const target = dragRef.current
		const item = target && items.find((other) => other.key === target.key)
		if (!e.canceled && item) drop(item, target)
		updateDrag(null)
	}

	const dragged = drag && items.find((item) => item.key === drag.key)

	const displayRows: { key: string; items: CalendarItem[]; isGap?: boolean }[] = rows.map((row) => ({
		key: `row-${row[0].key}`,
		items: row,
	}))
	if (drag) displayRows.splice(drag.row, 0, { key: "gap", items: [], isGap: true })

	return (
		<section className={`metallic-panel ${styles.panel}`}>
			<h2 className={pageStyles.sectionTitle}>Calendar</h2>
			<div className={`inset-control ${styles.miniCalendar}`}>
				<div className={styles.miniTicks}>
					{ticks.map((day) => (
						<span key={day} style={{ left: percent(day - origin) }}>
							{shortDate.format(day * 86_400_000)}
						</span>
					))}
				</div>
				<DragDropProvider
					plugins={(defaults) => [...defaults, Feedback.configure({ feedback: "none", dropAnimation: null })]}
					onDragStart={onDragStart}
					onDragMove={onDragMove}
					onDragEnd={onDragEnd}
				>
					<div
						ref={rowsRef}
						className={styles.miniRows}
						style={{ "--row-count": displayRows.length } as CSSProperties}
					>
						{displayRows.map(({ key, items: rowItems, isGap }) => {
							// The row's index among the real rows; the empty row stands for
							// the row it sits above.
							const rowIndex = isGap ? drag!.row : rows.findIndex((row) => `row-${row[0].key}` === key)
							const isTarget = drag && drag.row === rowIndex && drag.insert === Boolean(isGap)
							return (
								<div
									key={key}
									data-row={rowIndex}
									data-gap={Boolean(isGap)}
									className={`${styles.miniRow} ${isGap ? styles.miniRowGap : ""} ${isTarget ? styles.miniRowTarget : ""}`}
								>
									{rowItems.map((item) => (
										<DraggableItem
											key={item.key}
											item={item}
											left={percent(item.first - origin)}
											width={percent(item.last - item.first + 1)}
											isDragging={drag?.key === item.key}
										/>
									))}
									{dragged && isTarget && !(rowOf.get(dragged.key) === rowIndex && !isGap) && (
										<MiniItem
											item={dragged}
											left={percent(dragged.first - origin)}
											width={percent(dragged.last - dragged.first + 1)}
											isGhost
										/>
									)}
								</div>
							)
						})}
					</div>
				</DragDropProvider>
			</div>
		</section>
	)
}

type MiniItemProps = {
	item: CalendarItem
	left: string
	width: string
	isDragging?: boolean
	isGhost?: boolean
}

function DraggableItem(props: MiniItemProps) {
	const { ref } = useDraggable({ id: props.item.key })
	return <MiniItem {...props} ref={ref} />
}

function MiniItem({
	item,
	left,
	width,
	isDragging,
	isGhost,
	ref,
}: MiniItemProps & { ref?: (element: Element | null) => void }) {
	const style = {
		left,
		width,
		"--banner": item.src ? `url("${item.src}")` : undefined,
		"--theme-color": item.themeColor || undefined,
		"--y-offset": item.yOffset || "50%",
	} as CSSProperties

	return (
		<div
			ref={ref}
			className={`${styles.miniItem} ${ref ? styles.miniDraggable : ""} ${isDragging ? styles.miniDragging : ""} ${isGhost ? styles.miniGhost : ""}`}
			style={style}
			title={item.label}
		>
			<span>{item.label}</span>
		</div>
	)
}
