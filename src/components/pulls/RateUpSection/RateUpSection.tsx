"use client"

import { CSSProperties, useState } from "react"

import { Material } from "@/types/item"
import { Arc } from "@/types/weapon"
import { Character } from "@/types/character"
import { PullsRecord } from "@/types/pulls"

import { findPullItem, isArcRateUp, isScarboroughPull } from "@/helpers"

import { RateUpPull, usePullTrackerContext } from "@/contexts"

import { ArcIcon, CharacterAvatar } from "@/components/layout"

import pageStyles from "@/app/pulls/page.module.css"
import styles from "./rateUpSection.module.css"
import { ConfigCheckbox } from "@/app/settings/RenderSettings"

const hardPity: Record<keyof PullsRecord, number> = {
	arcsBanner: 80,
	limitedBanner: 90,
	permanentBanner: 90,
}

function isCharacter(item: Arc | Material | Character): item is Character {
	return Boolean(item && "abilities" in item)
}

function isArc(item: Arc | Material | Character): item is Arc {
	return Boolean(item && "effect" in item)
}

function isNotMaterial(
	item: Arc | Material | Character
): item is Exclude<Arc | Material | Character, Material> {
	return isCharacter(item) || isArc(item)
}

function ItemImage({ item }: { item: Arc | Character }) {
	return isCharacter(item) ? (
		<CharacterAvatar
			character={item}
			height={256}
			width={256}
			className={styles.rateupItemImage}
		/>
	) : (
		<ArcIcon
			arc={item}
			width={256}
			height={256}
			className={styles.rateupItemImage}
		/>
	)
}

export function RateUpSection() {
	const { rateUpPulls } = usePullTrackerContext()
	const [onlyRateUp, setOnlyRateUp] = useState<boolean>(false)

	const bannerNames = {
		limitedBanner: "Limited Character Board",
		arcsBanner: "Arc Miracle Box",
		permanentBanner: "Strange Encounters",
	}

	return (
		<div
			className={`metallic-panel ${pageStyles.section} ${styles.rateupSection}`}>
			<div className={pageStyles.sectionTitleRow}>
				<span className={pageStyles.sectionTitle}>RECENT S-RANKS</span>
				<label className={pageStyles.sectionConfig}>
					<ConfigCheckbox
						checked={onlyRateUp}
						onChange={(e) => setOnlyRateUp(e.target.checked)}
						name="Only show Rate-Up Arcs"
					/>
				</label>
			</div>
			<div className={`inset-control ${styles.rateupBannerList}`}>
				{(
					Object.entries(rateUpPulls) as [
						keyof PullsRecord,
						RateUpPull[],
					][]
				).map(([banner, pulls]) => {
					const displayPulls =
						banner === "arcsBanner" && onlyRateUp
							? pulls.filter(({ pull }) => isArcRateUp(pull))
							: pulls

					return (
						pulls.length > 0 && (
							<div key={banner} className={styles.rateupBanner}>
								<div className={styles.rateupBannerNameRow}>
									<div className={styles.rateupBannerName}>
										{bannerNames[banner]}
									</div>
								</div>
								<hr />
								<div className={styles.rateupList} key={banner}>
									{displayPulls.map(
										({ pull, pity, themeColor }) => {
											const isScarborough =
												isScarboroughPull(pull)
											const item = findPullItem(
												pull.rewardId,
												isScarborough
													? pull.rewardType
													: "arc"
											)
											const bannerColor = themeColor
											return (
												isNotMaterial(item) && (
													<div
														className={`epic ${styles.rateupItem}`}
														key={pull.uid}
														style={
															{
																"--mix-percent": `${((pity - 0) / hardPity[banner]) * 100}%`,
																"--theme-color":
																	bannerColor,
															} as CSSProperties
														}>
														<ItemImage item={item} />
														<span
															className={
																styles.rateupPity
															}>
															{pity}
														</span>
													</div>
												)
											)
										}
									)}
								</div>
							</div>
						)
					)
				})}
			</div>
		</div>
	)
}
