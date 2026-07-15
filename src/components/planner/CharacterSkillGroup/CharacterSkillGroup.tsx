import { ChangeEvent } from "react"

import { CharacterRecord } from "@/types/planner"

import { findCharacter } from "@/data/characters/characterList"

import styles from "./chatracterSkillGroup.module.css"

export function CharacterSkillGroup({
	charRecord,
	skill,
	label,
	handleToggleSkill,
	handleCurrentLvlChange,
	handleTargetLvlChange,
}: {
	charRecord: CharacterRecord
	skill: keyof CharacterRecord["abilitySet"]
	label: string
	handleToggleSkill: (
		e: ChangeEvent<HTMLInputElement>,
		ability: keyof CharacterRecord["abilitySet"]
	) => void
	handleCurrentLvlChange: (
		e: ChangeEvent<HTMLSelectElement>,
		ability: typeof skill
	) => void
	handleTargetLvlChange: (
		e: ChangeEvent<HTMLSelectElement>,
		ability: typeof skill
	) => void
}) {
	const char = findCharacter(charRecord.id)
	const { abilitySet } = charRecord
	const ability = abilitySet[skill]

	const maxLvl = char.abilities[skill]?.maxLvl || 1

	if (ability) {
		return (
			<div
				className={`${styles.charStatInputGroup} ${ability.isDisabled && styles.disabled}`}>
				<input
					type="checkbox"
					checked={!ability.isDisabled}
					onChange={(e) => handleToggleSkill(e, skill)}
				/>
				<div className={styles.charStatInputLabels}>
					<label className={styles.charStatInputSkill}>{label}</label>
					<span className={styles.charStatInputName}>
						{char.abilities[skill]?.name}
					</span>
				</div>
				{!["passive1", "passive2", "passive3"].includes(skill) && (
					<div className={styles.charStatInputSelects}>
						<select
							value={ability.currentLvl}
							onChange={(e) => handleCurrentLvlChange(e, skill)}
							tabIndex={1}>
							{Array.from({
								length: maxLvl,
							}).map((_, opt) => (
								<option key={opt} value={opt + 1}>
									{opt + 1}
								</option>
							))}
						</select>
						<select
							value={ability.targetLvl}
							onChange={(e) => handleTargetLvlChange(e, skill)}
							tabIndex={1}>
							{Array.from({
								length: maxLvl,
							}).map((_, opt) => (
								<option key={opt} value={opt + 1}>
									{opt + 1}
								</option>
							))}
						</select>
					</div>
				)}
			</div>
		)
	}

	return <></>
}
