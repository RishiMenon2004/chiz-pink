"use client"

import { useState } from "react"
import { createPortal } from "react-dom"

import { ActivityData, getAllActivitiesList } from "@/data/activities/activities"

import { useChecklistStore, useNow, useSettingsStore } from "@/hooks"

import type {
	ChecklistEntry,
	ChecklistRecord,
	CustomTask,
	CustomTaskSchedule,
} from "@/types/checklist"

import {
	formatTimeRemaining,
	getBiWeeklyMondayResetBoundaries,
	getCustomTaskResetBoundaries,
	getBiWeeklyWednesdayResetBoundaries,
	getDailyResetBoundaries,
	getMonthlyResetBoundaries,
	getSeasonalResetBoundaries,
	getWeeklyResetBoundaries,
	stopPropagation,
} from "@/helpers"

import { ModalContainer, PullOutToolbar } from "@/components/layout"
import { DashDailyActivity } from "@/components/home"
import { CustomTaskBox } from "@/components/checklist"

import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import checklistStyles from "@/components/home/DashDailyChecklist/DashDailyChecklist.module.css"
import styles from "./page.module.css"

function RenderActivityList({
	type,
	recordType,
	entries,
}: {
	type: ActivityData["type"]
	recordType: keyof ChecklistRecord["activities"]
	entries: Record<string, ChecklistEntry>
}) {
	const { settings } = useSettingsStore()
	const { checklist, actions } = useChecklistStore()
	const tasks = checklist.activities[recordType] ?? {}

	const now = useNow()

	return getAllActivitiesList()
		.filter((activity) => activity.type === type)
		.filter((activity) => !(entries[activity.id]?.disabled ?? false))
		.slice(type === "Daily" ? 1 : 0)
		.map((item) => {
			const task = tasks[item.id] ?? {}
			const checked = (task?.checked ?? 0) > 0
			const formattedTime =
				now === null
					? "-"
					: item.id === "btr"
						? formatTimeRemaining(
								getBiWeeklyWednesdayResetBoundaries(
									settings.userdata.server,
									now
								).nextReset - now
							)
						: formatTimeRemaining(
								getBiWeeklyMondayResetBoundaries(
									settings.userdata.server,
									now
								).nextReset - now
							)

			return (
				<div
					className={`metallic-panel ${styles.checklistItem}`}
					key={item.id}
					onClick={(e) => {
						e.stopPropagation()
						actions.setChecklist("activities", (current) => {
							const checklistItem = {
								...current[recordType][item.id],
								checked: checked ? 0 : 1,
							}
							return {
								[recordType]: {
									...current[recordType],
									[item.id]: checklistItem,
								},
							}
						})
					}}>
					<div className={styles.itemTitleRow}>
						<input
							className={`inset-control ${styles.itemCheckbox}`}
							type="checkbox"
							checked={checked}
							readOnly
						/>
						<div className={styles.itemTitle}>{item.name}</div>
					</div>
					<div className={styles.itemDescription}>
						{item.description}
					</div>
					{type === "Bi-Weekly" && (
						<div className={styles.itemTime}>
							{`Resets in: ${formattedTime}`}
						</div>
					)}
				</div>
			)
		})
}

function RenderCustomTaskList({
	type,
	onEdit,
}: {
	type: CustomTaskSchedule["type"]
	onEdit: (task: CustomTask) => void
}) {
	const { settings } = useSettingsStore()
	const { checklist, actions } = useChecklistStore()

	const now = useNow()

	return Object.values(checklist.customTasks ?? {})
		.filter((task) => task.schedule.type === type)
		.toSorted((a, b) => a.createdAt - b.createdAt)
		.map((task) => {
			const boundaries =
				now === null
					? null
					: getCustomTaskResetBoundaries(
							task.schedule,
							settings.userdata.server,
							now
						)
			const checked =
				boundaries !== null &&
				task.checkedAt !== null &&
				task.checkedAt >= boundaries.previousReset

			// Only schedules that don't share their section's timer get their own.
			const showTime =
				task.schedule.type === "biWeekly" ||
				(task.schedule.type === "monthly" && task.schedule.day !== 1)

			return (
				<div
					className={`metallic-panel ${styles.checklistItem}`}
					key={task.id}
					onClick={(e) => {
						e.stopPropagation()
						actions.setCustomTaskChecked(task.id, !checked)
					}}>
					<div className={styles.itemTitleRow}>
						<input
							className={`inset-control ${styles.itemCheckbox}`}
							type="checkbox"
							checked={checked}
							readOnly
						/>
						<div className={styles.itemTitle}>{task.title}</div>
						<button
							type="button"
							className={`pill-button ${styles.itemEditButton}`}
							aria-label={`Edit ${task.title}`}
							onClick={(e) => {
								e.stopPropagation()
								onEdit(task)
							}}>
							EDIT
						</button>
					</div>
					{task.description && (
						<div className={styles.itemDescription}>
							{task.description}
						</div>
					)}
					{showTime && (
						<div className={styles.itemTime}>
							{`Resets in: ${
								boundaries === null || now === null
									? "-"
									: formatTimeRemaining(boundaries.nextReset - now)
							}`}
						</div>
					)}
				</div>
			)
		})
}

function ChecklistItem({
	item,
	type,
}: {
	item: ActivityData
	type: keyof ChecklistRecord["activities"]
}) {
	const { checklist, actions } = useChecklistStore()
	const tasks = checklist.activities[type] ?? {}
	const task = tasks[item.id] ?? {}
	const checked = !(task?.disabled ?? false)

	return (
		<label
			htmlFor={item.name}
			className={checklistStyles.checklistItem}
			onClick={(e) => {
				e.stopPropagation()
				actions.setChecklist("activities", (current) => {
					const checklistItem = {
						...current[type][item.id],
						disabled: checked,
					}

					return {
						[type]: {
							...current[type],
							[item.id]: checklistItem,
						},
					}
				})
			}}>
			<input type="checkbox" name={item.name} checked={checked} readOnly />
			<span className={checklistStyles.checklistItemLabel}>
				<div className={checklistStyles.checklistItemName}>
					{item.name}
				</div>
				<div className={checklistStyles.checklistItemDesc}>
					{checked ? "Visible" : "Hidden"}
				</div>
			</span>
		</label>
	)
}

function RenderChecklistItems({
	type,
	recordType,
}: {
	type: ActivityData["type"]
	recordType: keyof ChecklistRecord["activities"]
}) {
	return getAllActivitiesList()
		.filter((activity) => activity.type === type)
		.slice(type === "Daily" ? 1 : 0)
		.map((item) => {
			return <ChecklistItem item={item} type={recordType} key={item.id} />
		})
}

export function EditTasksBox() {
	return (
		<div
			className={`metallic-panel ${checklistStyles.editTasksBox}`}
			onClick={stopPropagation}>
			<div className={checklistStyles.editTasksTitle}>Edit Tasks</div>
			<div
				className={`inset-control ${checklistStyles.checklistGrid} ${checklistStyles.editTasksList} ${styles.editTasksList}`}>
				<div
					className={`${checklistStyles.checklistScroll} ${styles.checklistScroll}`}>
					<span className={styles.listTitle}>Daily</span>
					<div className={styles.checklistItems}>
						<RenderChecklistItems type="Daily" recordType="daily" />
					</div>
					<span className={styles.listTitle}>Weekly</span>
					<div className={styles.checklistItems}>
						<RenderChecklistItems type="Weekly" recordType="weekly" />
					</div>
					<span className={styles.listTitle}>Bi-Weekly</span>
					<div className={styles.checklistItems}>
						<RenderChecklistItems
							type="Bi-Weekly"
							recordType="biWeekly"
						/>
					</div>
					<span className={styles.listTitle}>Monthly</span>
					<div className={styles.checklistItems}>
						<RenderChecklistItems
							type="Monthly"
							recordType="monthly"
						/>
					</div>
					<span className={styles.listTitle}>Seasonal</span>
					<div className={styles.checklistItems}>
						<RenderChecklistItems
							type="Seasonal"
							recordType="seasonal"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function RenderChecklist() {
	const { settings } = useSettingsStore()
	const { checklist } = useChecklistStore()

	const now = useNow()

	const daily = checklist.activities.daily ?? {}
	const weekly = checklist.activities.weekly ?? {}
	const biWeekly = checklist.activities.biWeekly ?? {}
	const monthly = checklist.activities.monthly ?? {}
	const seasonal = checklist.activities.seasonal ?? {}

	const [showEditTasksModal, setShowEditTasksModal] = useState<boolean>(false)
	// "new" opens an empty form; a task opens it for editing.
	const [customTaskModal, setCustomTaskModal] = useState<
		CustomTask | "new" | null
	>(null)

	return (
		<>
			<PullOutToolbar>
				<button
					className={`pill-button ${toolbarStyles.toolbarButton}`}
					onClick={() => setShowEditTasksModal(true)}>
					EDIT TASKS
				</button>
				{showEditTasksModal &&
					createPortal(
						<ModalContainer
							onClickOut={() => setShowEditTasksModal(false)}>
							<EditTasksBox />
						</ModalContainer>,
						document.body
					)}
				<button
					className={`pill-button ${toolbarStyles.toolbarButton}`}
					onClick={() => setCustomTaskModal("new")}>
					ADD TASK
				</button>
				{customTaskModal !== null &&
					createPortal(
						<ModalContainer onClickOut={() => setCustomTaskModal(null)}>
							<CustomTaskBox
								// Remount per task so the form state starts fresh.
								key={
									customTaskModal === "new"
										? "new"
										: customTaskModal.id
								}
								task={
									customTaskModal === "new"
										? undefined
										: customTaskModal
								}
								onClose={() => setCustomTaskModal(null)}
							/>
						</ModalContainer>,
						document.body
					)}
			</PullOutToolbar>

			<main className={`page ${styles.page}`}>
				<div className={styles.activitySection}>
					<div className={styles.activityTitleRow}>
						<h2>Daily</h2>
						<span className={styles.activityTimer}>
							{`Resets in: ${
								now === null
									? "-"
									: formatTimeRemaining(
											getDailyResetBoundaries(
												settings.userdata.server,
												now
											).nextReset - now
										)
							}`}
						</span>
					</div>
					<div className={styles.checklistGrid}>
						<DashDailyActivity
							checklistClassname={styles.dailyActivity}
						/>
						<RenderActivityList
							type="Daily"
							recordType="daily"
							entries={daily}
						/>
						<RenderCustomTaskList
							type="daily"
							onEdit={setCustomTaskModal}
						/>
					</div>
				</div>

				<div className={styles.activitySection}>
					<div className={styles.activityTitleRow}>
						<h2>Weekly</h2>
						<span className={styles.activityTimer}>
							{`Resets in: ${
								now === null
									? "-"
									: formatTimeRemaining(
											getWeeklyResetBoundaries(
												settings.userdata.server,
												now
											).nextReset - now
										)
							}`}
						</span>
					</div>
					<div className={styles.checklistGrid}>
						<RenderActivityList
							type="Weekly"
							recordType="weekly"
							entries={weekly}
						/>
						<RenderCustomTaskList
							type="weekly"
							onEdit={setCustomTaskModal}
						/>
					</div>
				</div>

				<div className={styles.activitySection}>
					<div className={styles.activityTitleRow}>
						<h2>Bi-Weekly</h2>
					</div>
					<div className={styles.checklistGrid}>
						<RenderActivityList
							type="Bi-Weekly"
							recordType="biWeekly"
							entries={biWeekly}
						/>
						<RenderCustomTaskList
							type="biWeekly"
							onEdit={setCustomTaskModal}
						/>
					</div>
				</div>

				<div className={styles.activitySection}>
					<div className={styles.activityTitleRow}>
						<h2>Monthly</h2>
						<span className={styles.activityTimer}>
							{`Resets in: ${
								now === null
									? "-"
									: formatTimeRemaining(
											getMonthlyResetBoundaries(
												settings.userdata.server,
												now
											).nextReset - now
										)
							}`}
						</span>
					</div>
					<div className={styles.checklistGrid}>
						<RenderActivityList
							type="Monthly"
							recordType="monthly"
							entries={monthly}
						/>
						<RenderCustomTaskList
							type="monthly"
							onEdit={setCustomTaskModal}
						/>
					</div>
				</div>

				<div className={styles.activitySection}>
					<div className={styles.activityTitleRow}>
						<h2>Seasonal</h2>
						<span className={styles.activityTimer}>
							{`Resets in: ${
								now === null
									? "-"
									: formatTimeRemaining(
											getSeasonalResetBoundaries(now)
												.nextReset - now
										)
							}`}
						</span>
					</div>
					<div className={styles.checklistGrid}>
						<RenderActivityList
							type="Seasonal"
							recordType="seasonal"
							entries={seasonal}
						/>
						<RenderCustomTaskList
							type="seasonal"
							onEdit={setCustomTaskModal}
						/>
					</div>
				</div>
			</main>
		</>
	)
}
