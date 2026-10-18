"use client"

import { CSSProperties, useState } from "react"

import type { Arc } from "@/types/weapon"

import { parseDescription } from "@/helpers/parseDescription"

import pageStyles from "@/app/page.module.css"
import styles from "../profile.module.css"

export function ArcEffect({ effect }: { effect: Arc["effect"] }) {
	const tiers = Object.keys(effect.values)
		.map(Number)
		.toSorted((a, b) => a - b)
	const [tier, setTier] = useState(tiers[0] ?? 1)

	return (
		<section className={`metallic-panel ${pageStyles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>Effect</h2>
				{tiers.length > 1 && (
					<div
						className={styles.tierSelector}
						role="group"
						aria-label="Arc tier">
						<span className={styles.tierLabel}>TIER</span>
						<div className={styles.tierTrack}>
							<div
								className={styles.tierConnector}
								style={
									{
										"--percentage": `${(tiers.indexOf(tier) / (tiers.length - 1)) * 100}%`,
									} as CSSProperties
								}
							/>
							{tiers.map((value) => (
								<button
									key={value}
									type="button"
									aria-pressed={value === tier}
									data-reached={value <= tier}
									className={styles.tierNode}
									onClick={() => setTier(value)}>
									{value}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
			<div className={`inset-control ${styles.panelBody}`}>
				<article className={styles.ability}>
					<header className={styles.abilityHeader}>
						<span className={styles.abilityKind}>Tier {tier}</span>
						<h3 className={styles.abilityName}>{effect.name}</h3>
					</header>
					<p className={styles.descriptionText}>
						{parseDescription(effect.description, tier, effect.values)}
					</p>
				</article>
			</div>
		</section>
	)
}
