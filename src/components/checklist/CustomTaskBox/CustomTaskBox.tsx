"use client"

import { useId, useState } from "react"

import type { CustomTask, CustomTaskSchedule } from "@/types/checklist"

import { useChecklistStore, useSettingsStore } from "@/hooks"

import { getUpcomingResetDates, stopPropagation } from "@/helpers"

import { DayOfMonthPicker } from "../DayOfMonthPicker"

import checklistStyles from "@/app/checklist/page.module.css"
import settingsStyles from "@/app/settings/settings.module.css"
import styles from "./customTaskBox.module.css"

const SCHEDULE_TYPES: { type: CustomTaskSchedule["type"]; label: string }[] = [
	{ type: "daily", label: "Daily" },
	{ type: "weekly", label: "Weekly" },
	{ type: "biWeekly", label: "Bi-Weekly" },
	{ type: "monthly", label: "Monthly" },
	{ type: "seasonal", label: "Seasonal" },
]

// Monday-first, valued by Date.getUTCDay().
const WEEKDAYS = [
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
	{ value: 0, label: "Sunday" },
]

const DAY_MS = 24 * 60 * 60 * 1000

const DEFAULT_TITLE = "New Title"

function weekdayOf(date: string) {
	return new Date(date).getUTCDay()
}

// Whether two "YYYY-MM-DD" dates land on the same every-other-week cycle.
function isSameBiWeeklyCycle(a: string, b: string) {
	const days = Math.round(
		(new Date(a).getTime() - new Date(b).getTime()) / DAY_MS
	)
	return days % 14 === 0
}

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		timeZone: "UTC",
	})
}

// crypto.randomUUID() only exists in secure contexts (HTTPS/localhost), so
// it's missing when the dev server is opened over a LAN IP; getRandomValues
// works everywhere.
function createTaskId() {
	const bytes = crypto.getRandomValues(new Uint8Array(16))
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function ordinalSuffix(n: number) {
	return n % 100 >= 11 && n % 100 <= 13
		? "th"
		: ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th")
}

// e.g. "1st", "29th (or last day)" - the 29th-31st clamp in short months.
function formatMonthDay(day: number) {
	return `${day}${ordinalSuffix(day)}${day > 28 ? " (or last day)" : ""}`
}

export function CustomTaskBox({
	task,
	onClose,
}: {
	task?: CustomTask
	onClose: () => void
}) {
	const { settings } = useSettingsStore()
	const { actions } = useChecklistStore()
	const server = settings.userdata.server

	// Fixed when the modal opens so the date options don't shift mid-edit.
	const [openedAt] = useState(() => Date.now())

	const initial = task?.schedule
	const [title, setTitle] = useState(task?.title ?? DEFAULT_TITLE)
	const [description, setDescription] = useState(task?.description ?? "")
	const [type, setType] = useState<CustomTaskSchedule["type"]>(
		initial?.type ?? "daily"
	)
	const [monthDay, setMonthDay] = useState(
		initial?.type === "monthly" ? initial.day : 1
	)
	const monthDayLabelId = useId()

	// Two weeks of dates hold each weekday twice - once per alternating
	// week - so the chosen date sets both the weekday and the cycle. When
	// editing, preselect the date in step with the saved anchor (exactly
	// one of the 14 is).
	const upcoming = getUpcomingResetDates(server, openedAt, 14)
	const [nextResetDate, setNextResetDate] = useState(() => {
		if (initial?.type !== "biWeekly") return upcoming[0]
		return (
			upcoming.find((date) =>
				isSameBiWeeklyCycle(date, initial.anchorDate)
			) ?? upcoming[0]
		)
	})
	const weekday = weekdayOf(nextResetDate)

	// Keep the saved anchor when the cycle is unchanged, so editing other
	// fields doesn't clear the task's tick (see checkedAt in save()).
	const anchorDate =
		initial?.type === "biWeekly" &&
		isSameBiWeeklyCycle(nextResetDate, initial.anchorDate)
			? initial.anchorDate
			: nextResetDate

	const trimmedTitle = title.trim()

	const buildSchedule = (): CustomTaskSchedule => {
		switch (type) {
			case "biWeekly":
				return { type, anchorDate }
			case "monthly":
				return { type, day: monthDay }
			default:
				return { type }
		}
	}

	const save = () => {
		if (!trimmedTitle) return

		actions.saveCustomTask({
			id: task?.id ?? createTaskId(),
			title: trimmedTitle,
			description: description.trim(),
			schedule: buildSchedule(),
			createdAt: task?.createdAt ?? Date.now(),
			// A schedule change could otherwise leave a task ticked off for a
			// period it was never done in.
			checkedAt:
				task &&
				JSON.stringify(task.schedule) ===
					JSON.stringify(buildSchedule())
					? task.checkedAt
					: null,
		})
		onClose()
	}

	return (
		<form
			className={styles.wrapper}
			aria-label={task ? "Edit task" : "Add task"}
			onClick={stopPropagation}
			onSubmit={(e) => {
				e.preventDefault()
				save()
			}}>
			{/* A live preview of the checklist card, edited in place. */}
			<div
				className={`metallic-panel ${checklistStyles.checklistItem} ${styles.preview}`}>
				<div className={checklistStyles.itemTitleRow}>
					<span
						className={`inset-control ${checklistStyles.itemCheckbox}`}
					/>
					<input
						className={`${checklistStyles.itemTitle} ${styles.inlineInput}`}
						type="text"
						aria-label="Title"
						value={title}
						maxLength={60}
						placeholder="Task title"
						autoFocus
						required
						// Typing replaces the default title instead of appending.
						onFocus={(e) => {
							if (title === DEFAULT_TITLE)
								e.currentTarget.select()
						}}
						onChange={(e) => setTitle(e.currentTarget.value)}
					/>
				</div>
				<textarea
					className={`${checklistStyles.itemDescription} ${styles.inlineInput}`}
					aria-label="Description"
					value={description}
					maxLength={200}
					rows={1}
					placeholder="Add a description (optional)"
					onChange={(e) => setDescription(e.currentTarget.value)}
				/>
			</div>

			<div className={`metallic-panel ${styles.box}`}>
				<div className={styles.body}>
					<label className={styles.field}>
						<b>Type</b>
						<select
							className={`inset-control ${settingsStyles.configSelect}`}
							value={type}
							onChange={(e) =>
								setType(
									e.currentTarget
										.value as CustomTaskSchedule["type"]
								)
							}>
							{SCHEDULE_TYPES.map((option) => (
								<option key={option.type} value={option.type}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					{type === "biWeekly" && (
						<>
							<label
								className={`${styles.field} ${styles.fieldHalf}`}>
								<b>On every</b>
								<select
									className={`inset-control ${settingsStyles.configSelect}`}
									value={weekday}
									onChange={(e) => {
										const day = Number(
											e.currentTarget.value
										)
										setNextResetDate(
											upcoming.find(
												(date) =>
													weekdayOf(date) === day
											) ?? upcoming[0]
										)
									}}>
									{WEEKDAYS.map((day) => (
										<option
											key={day.value}
											value={day.value}>
											{day.label}
										</option>
									))}
								</select>
							</label>
							<label
								className={`${styles.field} ${styles.fieldHalf}`}>
								<b>Next reset</b>
								<select
									className={`inset-control ${settingsStyles.configSelect}`}
									value={nextResetDate}
									onChange={(e) =>
										setNextResetDate(e.currentTarget.value)
									}>
									{upcoming
										.filter(
											(date) =>
												weekdayOf(date) === weekday
										)
										.map((date) => (
											<option key={date} value={date}>
												{formatDate(date)}
											</option>
										))}
								</select>
							</label>
						</>
					)}

					{type === "monthly" && (
						<div className={styles.field}>
							<b id={monthDayLabelId}>Resets on</b>
							<DayOfMonthPicker
								value={monthDay}
								onChange={setMonthDay}
								formatValue={formatMonthDay}
								aria-labelledby={monthDayLabelId}
							/>
						</div>
					)}

					<p className={styles.hint}>
						{type === "seasonal"
							? "Resets when a new game version goes live."
							: "Resets at 5:00 AM server time."}
					</p>
				</div>

				<div className={styles.actions}>
					{task && (
						<button
							type="button"
							className="pill-button"
							data-variant="danger"
							onClick={() => {
								actions.removeCustomTask(task.id)
								onClose()
							}}>
							DELETE
						</button>
					)}
					<button
						type="button"
						className="pill-button"
						onClick={onClose}>
						CANCEL
					</button>
					<button
						type="submit"
						className="pill-button"
						disabled={!trimmedTitle}>
						SAVE
					</button>
				</div>
			</div>
		</form>
	)
}
