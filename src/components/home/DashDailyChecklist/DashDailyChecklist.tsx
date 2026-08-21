"use client"

import { ReactNode, useState } from "react"
import { createPortal } from "react-dom"

import { ActivityData, getAllActivitiesList } from "@/data/activities/activities"

import { useChecklistStore } from "@/hooks"

import { stopPropogation } from "@/helpers"

import { ModalContainer } from "@/components/layout"

import pageStyles from "@/app/page.module.css"
import styles from "./DashDailyChecklist.module.css"

function ChecklistItem({
	item,
	toggle,
}: {
	item: ActivityData
	toggle?: boolean
}) {
	const { checklist, actions } = useChecklistStore()
	const tasks = checklist.activities.daily ?? {}
	const task = tasks[item.id]
	const checked = toggle ? !(task?.disabled ?? false) : (task?.checked ?? 0) > 0

	return (
		<label
			htmlFor={item.name}
			className={styles.checklistItem}
			onClick={(e) => {
				e.stopPropagation()
				actions.setChecklist("activities", (current) => {
					const checklistItem = {
						...current.daily[item.id],
					}

					if (toggle) {
						checklistItem.disabled = checked
					} else {
						checklistItem.checked = checked ? 0 : 1
					}
					return {
						daily: {
							...current.daily,
							[item.id]: checklistItem,
						},
					}
				})
			}}>
			<input type="checkbox" name={item.name} checked={checked} readOnly />
			<span className={styles.checklistItemLabel}>
				<div className={styles.checklistItemName}>{item.name}</div>
				<div className={styles.checklistItemDesc}>
					{toggle ? (checked ? "Visible" : "Hidden") : item.description}
				</div>
			</span>
		</label>
	)
}

export function EditTasksBox({ children }: { children: ReactNode }) {
	return (
		<div
			className={`metallic-panel ${styles.editTasksBox}`}
			onClick={stopPropogation}>
			<div className={styles.editTasksTitle}>Edit Daily Tasks</div>
			<div
				className={`inset-control ${styles.checklistGrid} ${styles.editTasksList}`}>
				<div className={styles.checklistScroll}>{children}</div>
			</div>
		</div>
	)
}

export function DashDailyChecklist() {
	const { checklist } = useChecklistStore()
	const tasks = checklist.activities.daily ?? {}

	const [showEditTasksModal, setShowEditTasksModal] = useState<boolean>(false)

	return (
		<div className={`metallic-panel ${pageStyles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>Daily Checklist</h2>
				<button
					type="button"
					className={`pill-button ${pageStyles.sectionButton}`}
					onClick={() => setShowEditTasksModal(true)}>
					{"EDIT TASKS"}
				</button>
				{showEditTasksModal &&
					createPortal(
						<ModalContainer
							onClickOut={() => setShowEditTasksModal(false)}>
							<EditTasksBox>
								{getAllActivitiesList()
									.filter(
										(activity) => activity.type === "Daily"
									)
									.slice(1)
									.map((item) => {
										return (
											<ChecklistItem
												item={item}
												toggle
												key={item.id}
											/>
										)
									})}
							</EditTasksBox>
						</ModalContainer>,
						document.body
					)}
			</div>
			<div className={`inset-control ${styles.checklistGrid}`}>
				<div className={styles.checklistScroll}>
					{getAllActivitiesList()
						.filter((activity) => activity.type === "Daily")
						.filter(
							(activity) => !(tasks[activity.id]?.disabled ?? false)
						)
						.slice(1)
						/* .toSorted((a, b) => {
							const aChecked = tasks[a.id]?.checked ?? 0
							const bChecked = tasks[b.id]?.checked ?? 0
							return aChecked - bChecked
						}) */
						.map((item) => {
							return <ChecklistItem item={item} key={item.id} />
						})}
				</div>
			</div>
		</div>
	)
}
