"use client"

import { KeyboardEvent, useId, useRef, useState } from "react"

import type { Ability } from "@/types/character"

import { ProfileAbility } from "../ProfileAbility"

import pageStyles from "@/app/page.module.css"
import styles from "../profile.module.css"

export type AbilityEntry = [kind: string, ability: Ability | undefined]

// A titled panel (Combat, Passives, ...) showing one ability at a time,
// picked from tabs in the title row. Groups with a single ability skip the
// tabs and show it with its usual kind tag.
export function ProfileAbilityGroup({
	title,
	entries,
}: {
	title: string
	entries: AbilityEntry[]
}) {
	const present = entries.filter(
		(entry): entry is [string, Ability] => entry[1] !== undefined
	)
	const [activeIndex, setActiveIndex] = useState(0)
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
	const baseId = useId()

	if (present.length === 0) return null

	const hasTabs = present.length > 1
	const [activeKind, activeAbility] = present[activeIndex]

	const selectTab = (index: number) => {
		setActiveIndex(index)
		tabRefs.current[index]?.focus()
	}

	// Standard tablist keys: arrows move between tabs, Home/End jump.
	const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		const last = present.length - 1
		const next = {
			ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
			ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
			Home: 0,
			End: last,
		}[e.key]
		if (next === undefined) return
		e.preventDefault()
		selectTab(next)
	}

	return (
		<section className={`metallic-panel ${pageStyles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>{title}</h2>
				{hasTabs && (
					<div
						role="tablist"
						aria-label={title}
						className={`inset-control ${styles.abilityTabs}`}>
						{present.map(([kind], index) => (
							<button
								key={kind}
								ref={(el) => {
									tabRefs.current[index] = el
								}}
								type="button"
								role="tab"
								id={`${baseId}-tab-${index}`}
								aria-selected={index === activeIndex}
								aria-controls={`${baseId}-panel`}
								tabIndex={index === activeIndex ? 0 : -1}
								className={styles.abilityTab}
								onClick={() => setActiveIndex(index)}
								onKeyDown={onTabKeyDown}>
								{kind}
							</button>
						))}
					</div>
				)}
			</div>
			<div
				className={`inset-control ${styles.panelBody}`}
				{...(hasTabs && {
					role: "tabpanel",
					id: `${baseId}-panel`,
					"aria-labelledby": `${baseId}-tab-${activeIndex}`,
				})}>
				<ProfileAbility kind={activeKind} ability={activeAbility} showKind={!hasTabs} />
			</div>
		</section>
	)
}
