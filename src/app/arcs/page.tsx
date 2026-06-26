import routes from "@/database/routes"
import { Metadata } from "next"
import Image from "next/image"
import styles from "./page.module.css"

export const metadata: Metadata = {
	title: routes["/arcs"].head,
}

import NavButton from "@/components/layout/NavButton"
import PlannerMaterialBox from "@/components/planner/PlannerMaterialBox"
import { eternalMemory } from "@/database/materials"
import { Arc } from "@/database/arcs"
import { whatsDesired } from "@/database/arcs/whats_desired"
import { theLastRose } from "@/database/arcs/the_last_rose"

function ItemPhaseStars({ starsActive }: { starsActive: number }) {
	return Array.from({ length: 6 }).map((_, index) => {
		const isActive = index + 1 === starsActive
		return (
			<div
				className={`${styles.arcPhaseStar} ${isActive ? styles.phaseActive : ""}`}
				key={index}></div>
		)
	})
}

function PlannerArcBox({
	arc,
	numberOfItems,
}: {
	arc: Arc
	numberOfItems: number
}) {
	const materialList = []

	for (let i = 0; i < numberOfItems; i++) {
		materialList.push(
			<PlannerMaterialBox key={i} material={eternalMemory} />
		)
	}

	return (
		<div className={styles.arcPlannerBox}>
			<div className={styles.arcInfoContainer}>
				<div className={styles.arcInfoTop}>
					<div className={styles.arcImageContainer}>
						<Image
							src={`/arcs/${arc.imageSrc}`}
							width={128}
							height={128}
							alt={`Arc "${arc.name}" Icon`}
							loading="eager"
						/>
					</div>
					<div className={styles.arcStatsSection}>
						<div className={styles.arcStatsName}>{arc.name}</div>
						<div className={styles.arcPhases}>
							<ItemPhaseStars starsActive={1} />
						</div>
						<div className={styles.arcStatsLvl}>
							<span>Current Lvl.</span>
							<span>1</span>
						</div>
						<div className={styles.arcPhases}>
							<ItemPhaseStars starsActive={6} />
						</div>
						<div className={styles.arcStatsLvl}>
							<span>Target Lvl.</span>
							<span>90</span>
						</div>
					</div>
				</div>
				<div className={styles.arcRequiredMaterialsList}>
					{materialList}
				</div>
			</div>
			<div className={styles.arcButtonsContainer}>
				<NavButton href="" icon="home" />
			</div>
		</div>
	)
}

export default function ArcPlanner() {
	return (
		<div className={styles.page}>
			<PlannerArcBox arc={whatsDesired} numberOfItems={3} />
			<PlannerArcBox arc={theLastRose} numberOfItems={6} />
			<PlannerArcBox arc={theLastRose} numberOfItems={10} />
		</div>
	)
}
