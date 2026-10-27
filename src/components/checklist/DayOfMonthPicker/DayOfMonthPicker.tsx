"use client"

import { KeyboardEvent, useEffect, useRef, useState } from "react"

import styles from "./dayOfMonthPicker.module.css"

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

// Arrow keys move like a calendar: a row is a week.
const KEY_STEPS: Record<string, number> = {
	ArrowLeft: -1,
	ArrowRight: 1,
	ArrowUp: -7,
	ArrowDown: 7,
}

/**
 * A dropdown that picks a day of the month (1-31) from a calendar-style
 * grid. Built by hand rather than as a <select> so the grid looks the same
 * in every browser - Firefox and Safari can't lay out a native picker.
 */
export function DayOfMonthPicker({
	value,
	onChange,
	formatValue,
	"aria-labelledby": labelledBy,
}: {
	value: number
	onChange: (day: number) => void
	formatValue: (day: number) => string
	"aria-labelledby"?: string
}) {
	const [open, setOpen] = useState(false)
	// The day with keyboard focus while the grid is open.
	const [focusedDay, setFocusedDay] = useState(value)

	const rootRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const gridRef = useRef<HTMLDivElement>(null)

	const close = (returnFocus: boolean) => {
		setOpen(false)
		if (returnFocus) triggerRef.current?.focus()
	}

	useEffect(() => {
		if (!open) return

		const handlePointerDown = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
		}
		const handleKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key !== "Escape") return
			// Runs before the modal's window listener, so the first Escape
			// only closes the picker.
			e.stopPropagation()
			setOpen(false)
			triggerRef.current?.focus()
		}
		document.addEventListener("pointerdown", handlePointerDown)
		document.addEventListener("keydown", handleKeyDown)
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown)
			document.removeEventListener("keydown", handleKeyDown)
		}
	}, [open])

	// Keep DOM focus on the roving-tabindex day.
	useEffect(() => {
		if (!open) return
		gridRef.current
			?.querySelector<HTMLElement>(`[data-day="${focusedDay}"]`)
			?.focus()
	}, [open, focusedDay])

	const pick = (day: number) => {
		onChange(day)
		close(true)
	}

	const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const step = KEY_STEPS[e.key]
		if (step !== undefined) {
			e.preventDefault()
			setFocusedDay((day) => Math.min(31, Math.max(1, day + step)))
		} else if (e.key === "Home" || e.key === "End") {
			e.preventDefault()
			setFocusedDay(e.key === "Home" ? 1 : 31)
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			pick(focusedDay)
		} else if (e.key === "Tab") {
			setOpen(false)
		}
	}

	return (
		<div ref={rootRef} className={styles.picker}>
			<button
				ref={triggerRef}
				type="button"
				className={`inset-control ${styles.trigger}`}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-labelledby={labelledBy}
				data-open={open}
				onClick={() => {
					setFocusedDay(value)
					setOpen((current) => !current)
				}}
				onKeyDown={(e) => {
					if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
					e.preventDefault()
					setFocusedDay(value)
					setOpen(true)
				}}>
				{formatValue(value)}
			</button>

			{open && (
				<div
					ref={gridRef}
					className={styles.grid}
					role="listbox"
					aria-labelledby={labelledBy}
					onKeyDown={handleGridKeyDown}>
					{DAYS.map((day) => (
						<div
							key={day}
							className={styles.day}
							role="option"
							aria-selected={day === value}
							aria-label={formatValue(day)}
							tabIndex={day === focusedDay ? 0 : -1}
							data-day={day}
							// 29th-31st fall back to the last day in shorter months.
							data-clamped={day > 28 || undefined}
							onClick={() => pick(day)}>
							{day}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
