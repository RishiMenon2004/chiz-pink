"use client"

import { useId, useState } from "react"

import type { CustomTask, CustomTaskSchedule } from "@/types/checklist"
import type { MessageKey } from "@/types/messages"

import { useChecklistStore, useSettingsStore } from "@/hooks"

import { getUpcomingResetDates, stopPropagation } from "@/helpers"
import { formatLocale, type Locale } from "@/helpers/locale"

import { useLocale, useT } from "@/contexts"

import { DayOfMonthPicker } from "../DayOfMonthPicker"

import checklistStyles from "@/app/[lang]/checklist/page.module.css"
import settingsStyles from "@/app/[lang]/settings/settings.module.css"
import styles from "./customTaskBox.module.css"

const SCHEDULE_TYPES: {
	type: CustomTaskSchedule["type"]
	label: MessageKey
}[] = [
	{ type: "daily", label: "checklist.sections.daily" },
	{ type: "weekly", label: "checklist.sections.weekly" },
	{ type: "biWeekly", label: "checklist.sections.biWeekly" },
	{ type: "monthly", label: "checklist.sections.monthly" },
	{ type: "seasonal", label: "checklist.sections.seasonal" },
]

// Monday-first, valued by Date.getUTCDay().
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]

// "Monday"... in the page's language, from the browser's own day names.
// 2023-01-01 was a Sunday, so day N of that week is weekday N.
function weekdayName(day: number, locale: Locale) {
	return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" })
		.format(Date.UTC(2023, 0, 1 + day))
}

const DAY_MS = 24 * 60 * 60 * 1000

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

function formatDate(date: string, locale: Locale) {
	return new Date(date).toLocaleDateString(formatLocale(locale, "en-GB"), {
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

const ORDINAL_KEYS = {
	1: "checklist.customTask.ordinal.st",
	2: "checklist.customTask.ordinal.nd",
	3: "checklist.customTask.ordinal.rd",
} as const satisfies Record<number, MessageKey>

function ordinalKey(n: number): MessageKey {
	if (n % 100 >= 11 && n % 100 <= 13) return "checklist.customTask.ordinal.th"
	return (
		ORDINAL_KEYS[(n % 10) as keyof typeof ORDINAL_KEYS] ??
		"checklist.customTask.ordinal.th"
	)
}

export function CustomTaskBox({
	task,
	onClose,
}: {
	task?: CustomTask
	onClose: () => void
}) {
	const t = useT()
	const locale = useLocale()
	const { settings } = useSettingsStore()
	const { actions } = useChecklistStore()

	// e.g. "1st", "29th (or last day)" - the 29th-31st clamp in short months.
	const formatMonthDay = (day: number) => {
		const ordinal = t(ordinalKey(day), { day })
		return day > 28
			? t("checklist.customTask.orLastDay", { day: ordinal })
			: ordinal
	}
	const server = settings.userdata.server

	// Fixed when the modal opens so the date options don't shift mid-edit.
	const [openedAt] = useState(() => Date.now())

	const initial = task?.schedule
	const defaultTitle = t("checklist.customTask.defaultTitle")
	const [title, setTitle] = useState(task?.title ?? defaultTitle)
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
			aria-label={
				task
					? t("checklist.customTask.editForm")
					: t("checklist.customTask.addForm")
			}
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
						aria-label={t("checklist.customTask.titleLabel")}
						value={title}
						maxLength={60}
						placeholder={t("checklist.customTask.titlePlaceholder")}
						autoFocus
						required
						// Typing replaces the default title instead of appending.
						onFocus={(e) => {
							if (title === defaultTitle)
								e.currentTarget.select()
						}}
						onChange={(e) => setTitle(e.currentTarget.value)}
					/>
				</div>
				<textarea
					className={`${checklistStyles.itemDescription} ${styles.inlineInput}`}
					aria-label={t("checklist.customTask.descriptionLabel")}
					value={description}
					maxLength={200}
					rows={1}
					placeholder={t("checklist.customTask.descriptionPlaceholder")}
					onChange={(e) => setDescription(e.currentTarget.value)}
				/>
			</div>

			<div className={`metallic-panel ${styles.box}`}>
				<div className={styles.body}>
					<label className={styles.field}>
						<b>{t("checklist.customTask.type")}</b>
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
									{t(option.label)}
								</option>
							))}
						</select>
					</label>

					{type === "biWeekly" && (
						<>
							<label
								className={`${styles.field} ${styles.fieldHalf}`}>
								<b>{t("checklist.customTask.onEvery")}</b>
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
										<option key={day} value={day}>
											{weekdayName(day, locale)}
										</option>
									))}
								</select>
							</label>
							<label
								className={`${styles.field} ${styles.fieldHalf}`}>
								<b>{t("checklist.customTask.nextReset")}</b>
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
												{formatDate(date, locale)}
											</option>
										))}
								</select>
							</label>
						</>
					)}

					{type === "monthly" && (
						<div className={styles.field}>
							<b id={monthDayLabelId}>{t("checklist.customTask.resetsOn")}</b>
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
							? t("checklist.customTask.hintSeasonal")
							: t("checklist.customTask.hintServerTime")}
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
							{t("checklist.customTask.delete")}
						</button>
					)}
					<button
						type="button"
						className="pill-button"
						onClick={onClose}>
						{t("checklist.customTask.cancel")}
					</button>
					<button
						type="submit"
						className="pill-button"
						disabled={!trimmedTitle}>
						{t("checklist.customTask.save")}
					</button>
				</div>
			</div>
		</form>
	)
}
