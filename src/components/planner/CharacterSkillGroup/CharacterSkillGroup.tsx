import { CharacterRecord } from "@/types/planner"

import { findCharacter } from "@/data/characters/characterList"

import { usePlannerBoxContext } from "@/contexts"

import styles from "./chatracterSkillGroup.module.css"

export function CharacterSkillGroup({
	skill,
	label,
}: {
	skill: keyof CharacterRecord["abilitySet"]
	label: string
}) {
	const { itemRecord: charRecord, changeHandlers } = usePlannerBoxContext()

	const [handleCurrentLvlChange, handleTargetLvlChange, handleToggleSkill] =
		changeHandlers

	const char = findCharacter(charRecord.id)
	const { abilitySet } = charRecord as CharacterRecord
	const ability = abilitySet[skill]

	const maxLvl = char.abilities[skill]?.maxLvl || 1

	const isPassive = ["passive1", "passive2", "passive3"].includes(skill)
	const isLifeSkill = ["lifeSkill1", "lifeSkill2"].includes(skill)
	const LS2SkipLvl1 = skill === "lifeSkill2" && maxLvl === 1

	if (ability) {
		return (
			<div
				className={`${styles.charStatInputGroup} ${ability.isDisabled && styles.disabled} ${charRecord.isDisabled && styles.noInteract}`}>
				<input
					type="checkbox"
					tabIndex={0}
					checked={!ability.isDisabled}
					onChange={() => handleToggleSkill(skill)}
				/>
				<div
					className={styles.charStatInputLabels}
					onClick={() => handleToggleSkill(skill)}>
					<label className={styles.charStatInputSkill}>{label}</label>
					<span className={styles.charStatInputName}>
						{char.abilities[skill]?.name}
					</span>
				</div>
				{!isPassive && (
					<div className={styles.charStatInputSelects}>
						<select
							className="raised-control"
							value={ability.currentLvl}
							onChange={(e) => handleCurrentLvlChange(e, skill)}
							tabIndex={0}>
							{isLifeSkill && <option value={0}>{0}</option>}
							{Array.from({ length: maxLvl }).map((_, opt) => (
								<option
									key={opt}
									value={opt + 1 + (LS2SkipLvl1 ? 1 : 0)}>
									{opt + 1}
								</option>
							))}
						</select>
						<span className={styles.charStatInputSelectArrow} />
						<select
							className="raised-control"
							value={ability.targetLvl}
							onChange={(e) => handleTargetLvlChange(e, skill)}
							tabIndex={0}>
							{isLifeSkill && <option value={0}>{0}</option>}
							{Array.from({ length: maxLvl }).map((_, opt) => (
								<option
									key={opt}
									value={opt + 1 + (LS2SkipLvl1 ? 1 : 0)}>
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
