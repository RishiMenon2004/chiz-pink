"use client"

import { CSSProperties, useMemo, useState } from "react"

import { EnumItemLvls, findMaterial, getItemRarityStyle } from "@/data/items"

import { generateNewCharacter } from "@/helpers/generateNewCharacter"
import {
	getCharRequiredMaterials,
	getWeaponRequiredMaterials,
} from "@/helpers/getRequiredMaterials"

import { MaterialIcon } from "@/components/layout/MaterialIcon"

import pageStyles from "@/app/page.module.css"
import styles from "../profile.module.css"

// Every level step the planner offers (1, 20, 20+, 30, ... 80); ascended
// steps ("20+") are the notches between the labelled levels.
const LEVELS = Object.keys(EnumItemLvls)
	.filter((key) => isNaN(Number(key)))
	.map((key) => ({
		value: EnumItemLvls[key as keyof typeof EnumItemLvls],
		label: key.replace("Lvl", "").replace("A", "+"),
		isAscension: key.endsWith("A"),
	}))

// Fixed locale: the server and the browser must format identically, or the
// first render won't match (e.g. en-IN groups 21,49,000 vs en-US 2,149,000).
const amountFormat = new Intl.NumberFormat("en-US")

// Level-up cost only: skills are disabled so the totals match what the
// planner shows for a character with just its level goal set.
function getLevelMaterials(
	kind: "character" | "arc",
	id: string,
	target: EnumItemLvls
) {
	if (kind === "arc") {
		return getWeaponRequiredMaterials({
			id,
			currentLvl: EnumItemLvls.Lvl1,
			targetLvl: target,
		})
	}

	const base = generateNewCharacter(id)
	const abilitySet = Object.fromEntries(
		Object.entries(base.abilitySet).map(([skill, record]) => [
			skill,
			{ ...record, isDisabled: true },
		])
	) as typeof base.abilitySet

	return getCharRequiredMaterials({ ...base, targetLvl: target, abilitySet })
}

export function ProfileMaterials({
	kind,
	id,
}: {
	kind: "character" | "arc"
	id: string
}) {
	const [index, setIndex] = useState(LEVELS.length - 1)
	const level = LEVELS[index]

	const materials = useMemo(
		() =>
			getLevelMaterials(kind, id, level.value)
				.filter(({ amount }) => amount > 0)
				.map(({ id: materialId, amount }) => ({
					material: findMaterial(materialId),
					amount,
				}))
				.filter(({ material }) => material !== undefined),
		[kind, id, level.value]
	)

	return (
		<section className={`metallic-panel ${pageStyles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>Materials</h2>
				<span className={styles.levelReadout}>
					LV. 1{" "}
					<span
						className={styles.levelArrow}
						role="img"
						aria-label="to"
					/>
					<strong>LV. {level.label}</strong>
				</span>
			</div>
			<div className={`inset-control ${styles.panelBody}`}>
				<div className={styles.levelSlider}>
					<div
						className={styles.levelTrack}
						style={
							{
								"--percentage": `${(index / (LEVELS.length - 1)) * 100}%`,
							} as CSSProperties
						}>
						<input
							type="range"
							min={0}
							max={LEVELS.length - 1}
							step={1}
							value={index}
							onChange={(e) => setIndex(Number(e.currentTarget.value))}
							aria-label="Target level"
							aria-valuetext={`Level ${level.label}`}
						/>
					</div>
					<div className={styles.levelNotches} aria-hidden>
						{LEVELS.map((step, stepIndex) => (
							<span
								key={step.value}
								data-ascension={step.isAscension}
								data-reached={stepIndex <= index}
								onClick={() => setIndex(stepIndex)}>
								{!step.isAscension && step.label}
							</span>
						))}
					</div>
				</div>

				{materials.length === 0 ? (
					<p className={styles.materialsEmpty}>
						Nothing needed at level 1.
					</p>
				) : (
					<ul className={styles.materialList}>
						{materials.map(({ material, amount }) => (
							<li
								key={material.id}
								className={`${styles.material} ${getItemRarityStyle(material)}`}>
								<span className={styles.materialFrame}>
									<MaterialIcon
										material={material}
										className={styles.materialIcon}
										width={96}
										height={96}
									/>
								</span>
								<span className={styles.materialName}>
									{material.name}
								</span>
								<span className={styles.materialAmount}>
									×{amountFormat.format(amount)}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	)
}
