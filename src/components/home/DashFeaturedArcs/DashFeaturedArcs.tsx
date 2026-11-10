"use client"

import { CSSProperties, PointerEventHandler } from "react"
import Image from "next/image"

import type { Arc } from "@/types/weapon"

import { getItemRarityStyle } from "@/data/items"

import { useNow } from "@/hooks"
import { useTooltip } from "@/hooks/useTooltip"

import {
	formatBannerCountdown,
	getActiveBannerWindow,
	getArcBannerThemeColor,
	type ItemStatus,
} from "@/helpers/bannerStatus"

import { useT } from "@/contexts"

import { LocaleLink } from "@/components/layout"

import styles from "./DashFeaturedArcs.module.css"

type Entry = { item: Arc; status: ItemStatus }

function BannerTiming({ arc }: { arc: Arc }) {
	const t = useT()
	const now = useNow()
	if (now === null) return null

	const banner = getActiveBannerWindow(arc.id, now)
	if (!banner) return <span>{t("home.featured.bannerTba")}</span>

	return banner.start <= now ? (
		<span>
			{t.rich("home.featured.bannerEnds", {
				b: (text) => <strong>{text}</strong>,
				time: formatBannerCountdown(banner.end - now),
			})}
		</span>
	) : (
		<span>
			{t.rich("home.featured.bannerStarts", {
				b: (text) => <strong>{text}</strong>,
				time: formatBannerCountdown(banner.start - now),
			})}
		</span>
	)
}

function ArcRow({
	entry: { item: arc, status },
	onPointerEnter,
	onPointerLeave,
}: {
	entry: Entry
	onPointerEnter: PointerEventHandler<HTMLElement>
	onPointerLeave: () => void
}) {
	const t = useT()
	const themeColor = getArcBannerThemeColor(arc.id)

	return (
		<LocaleLink
			href={`/arcs/${arc.id}`}
			className={`${styles.row} ${getItemRarityStyle(arc)}`}
			style={themeColor ? ({ "--theme-color": themeColor } as CSSProperties) : undefined}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}>
			<div className={styles.art}>
				<Image
					src={`/arcs/${arc.imageSrc}`}
					alt={t("home.featuredArcs.artAlt", { name: arc.name })}
					width={512}
					height={512}
					sizes="10rem"
				/>
			</div>
			<div className={styles.info}>
				<div className={styles.tag}>
					{status === "preview"
						? t("home.featured.preview")
						: t("home.featured.featured")}
				</div>
				<h3 className={styles.name}>{arc.name}</h3>
				<div className={styles.meta}>
					<span>{arc.type}</span>
					<span className={styles.divider} />
					<BannerTiming arc={arc} />
				</div>
			</div>
		</LocaleLink>
	)
}

export function DashFeaturedArcs({ entries }: { entries: Entry[] }) {
	const t = useT()
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	return (
		<div className={`inset-control ${styles.list}`}>
			{entries.map((entry) => (
				<ArcRow
					key={entry.item.id}
					entry={entry}
					onPointerEnter={showTooltip}
					onPointerLeave={hideTooltip}
				/>
			))}

			<Tooltip offset={{ x: 6, y: 0 }}>{t("home.featuredArcs.viewIndex")}</Tooltip>
		</div>
	)
}
