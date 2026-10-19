import Image from "next/image"
import Link from "next/link"

import type { Arc } from "@/types/weapon"

import { getArcBannerThemeColor } from "@/helpers/bannerStatus"
import { formatAttributeValue } from "@/helpers/formatAttributeValue"
import { parseDescription } from "@/helpers/parseDescription"

import { ArcEffect } from "../ArcEffect"
import { ProfileHero } from "../ProfileHero"
import { ProfileMaterials } from "../ProfileMaterials"

import pageStyles from "@/app/page.module.css"
import styles from "../profile.module.css"

export function ArcProfile({ arc }: { arc: Arc }) {
	return (
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
						stats={[
							{ label: "Type", value: arc.type },
							{ label: "Base ATK", value: arc.baseAtk },
							{
								label: arc.mainAttribute.attribute,
								value: formatAttributeValue(arc.mainAttribute.baseValue),
							},
						]}
						description={
							arc.description && parseDescription(arc.description, 1)
						}
					/>
				</div>

				<div className={styles.content}>
					<ArcEffect effect={arc.effect} />
					<ProfileMaterials kind="arc" id={arc.id} />
				</div>
			</div>
		</main>
	)
}
