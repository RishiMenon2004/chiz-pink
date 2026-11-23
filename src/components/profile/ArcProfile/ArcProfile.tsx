import Image from "next/image"

import type { Arc } from "@/types/weapon"

import { arcLevelStats } from "@/data/arcs"

import { getArcBannerThemeColor } from "@/helpers/bannerStatus"
import { formatAttributeValue } from "@/helpers/formatAttributeValue"
import { getArcName, getArcTypeLabel, getRankLabel } from "@/helpers/gameLabels"
import type { Locale } from "@/helpers/locale"
import { getTranslator } from "@/helpers/messages"
import { parseDescription } from "@/helpers/parseDescription"

import { InfoBox } from "@/components/layout/InfoBox"

import { ArcEffect } from "../ArcEffect"
import { ProfileHero } from "../ProfileHero"
import { LevelStatValue, ProfileLevelProvider } from "../ProfileLevel"
import { ProfileMaterials } from "../ProfileMaterials"

import { LocaleLink } from "@/components/layout/LocaleLink"

import pageStyles from "@/app/[lang]/page.module.css"
import styles from "../profile.module.css"

export async function ArcProfile({ arc, locale }: { arc: Arc; locale: Locale }) {
	const t = await getTranslator(locale)
	const arcName = getArcName(arc, t)
	const arcTypeLabel = getArcTypeLabel(arc.type, t)
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
						<LocaleLink href="/arcs" className={`pill-button ${styles.backLink}`}>
							{t("profile.arc.allArcs")}
						</LocaleLink>
						<ProfileHero
							name={arcName}
							rarity={arc.rarity}
							rankAlt={getRankLabel(arc.rarity, t)}
							variant="arc"
							themeColor={getArcBannerThemeColor(arc.id)}
							art={
								<Image
									src={`/arcs/${arc.imageSrc}`}
									alt={arcName}
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
											{ label: t("profile.stats.type"), value: arcTypeLabel },
											{ label: t("profile.stats.baseAtk"), value: t("profile.stats.tbd") },
											{ label: t("profile.stats.mainStat"), value: t("profile.stats.tbd") },
										]
									: [
											{ label: t("profile.stats.type"), value: arcTypeLabel },
											{
												label: levelStats ? t("profile.stats.atk") : t("profile.stats.baseAtk"),
												value: atk,
											},
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
								{t("profile.arc.placeholderNote", { name: arcName })}
							</InfoBox>
						) : (
							<ProfileMaterials
								kind="arc"
								id={arc.id}
								levelStats={
									levelStats && [
										{ label: t("profile.stats.atk"), values: levelStats.atk.map(String) },
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
