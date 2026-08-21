"use client"

import { CSSProperties } from "react"

import { ChecklistEntry } from "@/types/checklist"

import { getAllActivities } from "@/data/activities/activities"

import { useChecklistStore, useInventoryStore, useSettingsStore } from "@/hooks"

import { ConfigCheckbox } from "@/app/settings/RenderSettings"

import pageStyles from "@/app/page.module.css"
import styles from "./DashDailyActivity.module.css"

const EMPTY_ENTRY: ChecklistEntry = {
	checked: 0,
	claimed: 0,
	claimedAt: null,
	disabled: false,
}

export function DashDailyActivity({
	checklistClassname,
}: {
	checklistClassname?: string
}) {
	const dailyTasksId = getAllActivities().dailyTasks.id
	const { checklist, actions: checklistActions } = useChecklistStore()
	const entry = checklist.activities.daily?.[dailyTasksId] ?? EMPTY_ENTRY
	const { checked, claimed } = entry

	// Merges against the store's current value (not the `entry` captured by
	// this render) so back-to-back calls in the same tick - e.g. setCheckedStep
	// updating `checked` then `claimUpTo` updating `claimed` right after -
	// don't clobber each other with a stale pre-update snapshot.
	function updateEntry(patch: Partial<ChecklistEntry>) {
		checklistActions.setChecklist("activities", (current) => {
			const currentEntry = current.daily?.[dailyTasksId] ?? EMPTY_ENTRY
			return {
				daily: {
					...current.daily,
					[dailyTasksId]: { ...currentEntry, ...patch },
				},
			}
		})
	}

	const parts = getAllActivities().dailyTasks.parts
	const { inventory, updateInventory } = useInventoryStore()
	const { settings, actions } = useSettingsStore()

	function applyRewards(fromIndex: number, toIndex: number, sign: 1 | -1) {
		const delta: Record<string, number> = {}
		for (let i = fromIndex; i < toIndex; i++) {
			for (const { material, amount } of parts[i].rewards) {
				delta[material.id] = (delta[material.id] ?? 0) + sign * amount
			}
		}

		const updates: Record<string, number> = {}
		for (const id in delta) {
			updates[id] = Math.max((inventory[id] || 0) + delta[id], 0)
		}
		updateInventory(updates)
	}

	function claimUpTo(target: number) {
		const clamped = Math.max(0, Math.min(target, parts.length))
		if (clamped > claimed!) applyRewards(claimed!, clamped, 1)
		else if (clamped < claimed!) applyRewards(clamped, claimed!, -1)
		updateEntry({
			claimed: clamped,
			claimedAt: clamped > 0 ? Date.now() : null,
		})
	}

	function setCheckedStep(next: number) {
		// Stamped here unconditionally - even with auto-claim off (so no
		// reward is actually granted yet) we still want a record of when
		// progress was last touched.
		updateEntry({ checked: next, claimedAt: next > 0 ? Date.now() : null })

		if (settings.behaviour["auto-claim"] || next < claimed!) {
			claimUpTo(next)
		}
	}

	return (
		<div
			className={`metallic-panel ${pageStyles.section} ${styles.section} ${checklistClassname ?? ""}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>Daily Tasks</h2>
				<label className={pageStyles.sectionConfig}>
					<ConfigCheckbox
						checked={settings.behaviour["auto-claim"]}
						onChange={(e) =>
							actions.setConfig("behaviour", {
								"auto-claim": e.currentTarget.checked,
							})
						}
						name="Add to Inventory"
					/>
				</label>
				<button
					type="button"
					className={`pill-button ${pageStyles.sectionButton}`}
					onClick={() => setCheckedStep(parts.length)}>
					{"QUICK CLAIM"}
				</button>
			</div>
			<div className={styles.partsContainer}>
				<div
					className={`${styles.partCheckbox} ${styles.zero}`}
					onClick={() => setCheckedStep(0)}>
					<p className={styles.partName}>0</p>
				</div>
				<div
					className={styles.partConnector}
					style={
						{
							"--percentage": `${(checked / parts.length) * 100}%`,
						} as CSSProperties
					}
				/>
				{parts.map((part, index) => {
					const isChecked = index + 1 <= checked
					return (
						<div key={part.name} className={styles.part}>
							<div
								className={`${styles.partCheckbox} ${isChecked ? styles.checked : ""} `}
								role="checkbox"
								aria-checked={isChecked}
								onClick={() =>
									setCheckedStep(
										checked === index + 1 ? index : index + 1
									)
								}>
								<p className={styles.partName}>{part.name}</p>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
