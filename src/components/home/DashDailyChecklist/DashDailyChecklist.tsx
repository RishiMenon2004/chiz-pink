"use client"

import { allActivities } from "@/data/activities/activities"

import { useChecklistStore } from "@/hooks"

import pageStyles from "@/app/page.module.css"
import styles from "./DashDailyChecklist.module.css"

export function DashDailyChecklist() {
	const { checklist, actions } = useChecklistStore()
	const tasks = checklist.activities.daily ?? {}
	return (
		<div className={`metallic-panel ${pageStyles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>Daily Checklist</h2>
			</div>
			<div className={`inset-control ${styles.checklistGrid}`}>
				<div className={styles.checklistScroll}>
					{Object.values(allActivities)
						.slice(1)
						/* .toSorted((a, b) => {
							const aChecked = tasks[a.id]?.checked ?? 0
							const bChecked = tasks[b.id]?.checked ?? 0
							return aChecked - bChecked
						}) */
						.map((item) => {
							const checked = tasks[item.id]?.checked ?? 0
							return (
								<label
									htmlFor={item.name}
									key={item.id}
									className={styles.checklistItem}
									onClick={() =>
										actions.setChecklist(
											"activities",
											(current) => {
												return {
													daily: {
														...current.daily,
														[item.id]: {
															checked: checked ? 0 : 1,
														},
													},
												}
											}
										)
									}>
									<input
										type="checkbox"
										name={item.name}
										checked={checked > 0}
										readOnly
									/>
									<span className={styles.checklistItemLabel}>
										<div className={styles.checklistItemName}>{item.name}</div>
										<div className={styles.checklistItemDesc}>{item.description}</div>
									</span>
								</label>
							)
						})}
				</div>
			</div>
		</div>
	)
}
