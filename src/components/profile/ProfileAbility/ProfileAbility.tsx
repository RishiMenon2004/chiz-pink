import type { Ability } from "@/types/character"

import { parseDescription } from "@/helpers/parseDescription"

import styles from "../profile.module.css"

export function ProfileAbility({
	kind,
	ability,
	showKind = true,
}: {
	kind: string
	ability: Ability
	// Off when a tab already names the kind.
	showKind?: boolean
}) {
	return (
		<article className={styles.ability}>
			<header className={styles.abilityHeader}>
				{showKind && <span className={styles.abilityKind}>{kind}</span>}
				<h3 className={styles.abilityName}>{ability.name}</h3>
			</header>
			{ability.description.map((section, index) => (
				<div key={index} className={styles.abilitySection}>
					{section.section && (
						<h4 className={styles.abilitySectionTitle}>{section.section}</h4>
					)}
					<p className={styles.descriptionText}>
						{parseDescription(section.description, 1)}
					</p>
				</div>
			))}
		</article>
	)
}
