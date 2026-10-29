"use client"

import { CSSProperties, PointerEventHandler } from "react"
import Image from "next/image"
import Link from "next/link"

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

import styles from "./DashFeaturedArcs.module.css"

type Entry = { item: Arc; status: ItemStatus }

function BannerTiming({ arc }: { arc: Arc }) {
	const now = useNow()
	if (now === null) return null

	const banner = getActiveBannerWindow(arc.id, now)
	if (!banner) return <span>Banner dates TBA</span>

	return banner.start <= now ? (
		<span>
			Banner ends in <strong>{formatBannerCountdown(banner.end - now)}</strong>
		</span>
	) : (
		<span>
			Banner starts in <strong>{formatBannerCountdown(banner.start - now)}</strong>
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
	const themeColor = getArcBannerThemeColor(arc.id)

	return (
		<Link
			href={`/arcs/${arc.id}`}
			className={`${styles.row} ${getItemRarityStyle(arc)}`}
			style={themeColor ? ({ "--theme-color": themeColor } as CSSProperties) : undefined}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}>
			<div className={styles.art}>
				<Image
					src={`/arcs/${arc.imageSrc}`}
					alt={`${arc.name} arc art`}
					width={512}
					height={512}
					sizes="10rem"
				/>
			</div>
			<div className={styles.info}>
				<div className={styles.tag}>
					{status === "preview" ? "Preview" : "Featured"}
				</div>
				<h3 className={styles.name}>{arc.name}</h3>
				<div className={styles.meta}>
					<span>{arc.type}</span>
					<span className={styles.divider} />
					<BannerTiming arc={arc} />
				</div>
			</div>
		</Link>
	)
}

export function DashFeaturedArcs({ entries }: { entries: Entry[] }) {
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

			<Tooltip offset={{ x: 6, y: 0 }}>View Index</Tooltip>
		</div>
	)
}
