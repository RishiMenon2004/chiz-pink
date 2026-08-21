"use client"

import { useState } from "react"
import { createPortal } from "react-dom"

import { ActivityData, getAllActivitiesList } from "@/data/activities/activities"

import { useChecklistStore, useNow, useSettingsStore } from "@/hooks"

import type { ChecklistEntry, ChecklistRecord } from "@/types/checklist"

import {
	formatTimeRemaining,
	getBiWeeklyMondayResetBoundaries,
	getBiWeeklyWednesdayResetBoundaries,
	getDailyResetBoundaries,
	getMonthlyResetBoundaries,
	getSeasonalResetBoundaries,
	getWeeklyResetBoundaries,
	stopPropogation,
} from "@/helpers"

import { ModalContainer, PullOutToolbar } from "@/components/layout"
import { DashDailyActivity } from "@/components/home"

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
							className={`inset-control ${styles.itemCheckbox} ${checked ? styles.checked : ""}`}
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
			onClick={stopPropogation}>
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
					</div>
				</div>
			</main>
		</>
	)
}
