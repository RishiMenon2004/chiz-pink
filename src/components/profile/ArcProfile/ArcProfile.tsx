import Image from "next/image"
import Link from "next/link"

import type { Arc } from "@/types/weapon"

import { arcLevelStats } from "@/data/arcs"

import { getArcBannerThemeColor } from "@/helpers/bannerStatus"
import { formatAttributeValue } from "@/helpers/formatAttributeValue"
import { parseDescription } from "@/helpers/parseDescription"

import { InfoBox } from "@/components/layout/InfoBox"

import { ArcEffect } from "../ArcEffect"
import { ProfileHero } from "../ProfileHero"
import { LevelStatValue, ProfileLevelProvider } from "../ProfileLevel"
import { ProfileMaterials } from "../ProfileMaterials"

import pageStyles from "@/app/page.module.css"
import styles from "../profile.module.css"

export function ArcProfile({ arc }: { arc: Arc }) {
	// Follow the Materials slider's level when the game data has the
	// per-level values; otherwise show the level 1 stats.
	const levelStats = arcLevelStats[arc.id]
	const atk = levelStats ? (
		<LevelStatValue values={levelStats.atk.map(String)} />
	) : (
		arc.baseAtk
	)
	const mainStat = levelStats ? (
		<LevelStatValue values={levelStats.mainStat.map(formatAttributeValue)} />
	) : (
		formatAttributeValue(arc.mainAttribute.baseValue)
	)

	return (
		<ProfileLevelProvider>
			<main role="main" className={`page ${pageStyles.page}`}>
				<div className={styles.layout}>
					<div className={styles.heroColumn}>
						<Link href="/arcs" className={`pill-button ${styles.backLink}`}>
							ALL ARCS
						</Link>
						<ProfileHero
							name={arc.name}
							rarity={arc.rarity}
							variant="arc"
							themeColor={getArcBannerThemeColor(arc.id)}
							art={
								<Image
									src={`/arcs/${arc.imageSrc}`}
									alt={arc.name}
									width={512}
									height={512}
									sizes="(max-width: 1000px) 100vw, 26rem"
									loading="eager"
									fetchPriority="high"
								/>
							}
							stats={
								arc.isPlaceholder
									? [
											{ label: "Type", value: arc.type },
											{ label: "Base ATK", value: "TBD" },
											{ label: "Main Stat", value: "TBD" },
										]
									: [
											{ label: "Type", value: arc.type },
											{ label: levelStats ? "ATK" : "Base ATK", value: atk },
											{ label: arc.mainAttribute.attribute, value: mainStat },
										]
							}
							description={
								arc.description && parseDescription(arc.description, 1)
							}
						/>
					</div>

					<div className={styles.content}>
						<ArcEffect effect={arc.effect} />
						{arc.isPlaceholder ? (
							<InfoBox sticker="peek">
								{`U-um... I don't have ${arc.name}'s stats or materials on file yet. I'll a-add them once it's out, I promise!`}
							</InfoBox>
						) : (
							<ProfileMaterials
								kind="arc"
								id={arc.id}
								levelStats={
									levelStats && [
										{ label: "ATK", values: levelStats.atk.map(String) },
										{
											label: arc.mainAttribute.attribute,
											values: levelStats.mainStat.map(formatAttributeValue),
										},
									]
								}
							/>
						)}
					</div>
				</div>
			</main>
		</ProfileLevelProvider>
	)
}
