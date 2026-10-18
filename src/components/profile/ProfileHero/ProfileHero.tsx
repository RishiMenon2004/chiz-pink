import { CSSProperties, ReactNode } from "react"
import Image from "next/image"

import type { EnumRarity } from "@/data/items/item"
import { getItemRarityStyle } from "@/data/items/item"

import { getRarityName } from "@/helpers/getRarityName"

import pageStyles from "@/app/page.module.css"
import styles from "../profile.module.css"

export type ProfileStat = {
	label: string
	value: ReactNode
}

type ProfileHeroProps = {
	name: string
	rarity: EnumRarity
	variant: "character" | "arc"
	art: ReactNode
	background?: ReactNode
	badge?: ReactNode
	// Overrides the rarity colour (e.g. an arc's banner theme colour).
	themeColor?: string | null
	// Colour for just the quote marks (characters), when it differs from
	// the card's colour.
	quoteColor?: string | null
	stats: ProfileStat[]
	description?: ReactNode
}

export function ProfileHero({
	name,
	rarity,
	variant,
	art,
	background,
	badge,
	themeColor,
	quoteColor,
	stats,
	description,
}: ProfileHeroProps) {
	const rarityStyle = getItemRarityStyle({ rarity })

	return (
		<aside
			className={`metallic-panel ${pageStyles.section} ${styles.hero} ${rarityStyle}`}
			style={
				{
					...(themeColor && {
						"--rarity-color": themeColor,
						"--rarity-color-highlight": `color-mix(in srgb, ${themeColor}, white 45%)`,
					}),
					...(quoteColor && { "--quote-color": quoteColor }),
				} as CSSProperties
			}>
			<div className={`inset-control ${styles.heroFrame}`} data-variant={variant}>
				{background && <div className={styles.heroBackground}>{background}</div>}
				<div className={styles.heroArt}>{art}</div>
				<Image
					className={styles.heroRank}
					src={`/icons/ranks/${rarityStyle}.png`}
					alt={getRarityName(rarity)}
					width={64}
					height={64}
				/>
				{badge && <div className={styles.heroBadge}>{badge}</div>}
				<h1
					className={styles.heroName}
					style={{ "--name-length": name.length } as CSSProperties}>
					{name}
				</h1>
			</div>

			<dl className={`inset-control ${styles.stats}`}>
				{stats.map(({ label, value }) => (
					<div key={label} className={styles.statRow}>
						<dt>{label}</dt>
						<dd>{value}</dd>
					</div>
				))}
			</dl>

			{description && <blockquote className={styles.heroQuote}>{description}</blockquote>}
		</aside>
	)
}
