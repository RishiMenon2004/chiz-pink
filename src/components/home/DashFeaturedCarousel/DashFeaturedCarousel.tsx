"use client"

import { CSSProperties, PointerEventHandler, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import type { Character } from "@/types/character"

import { getItemRarityStyle } from "@/data/items"

import { useNow } from "@/hooks"
import { useTooltip } from "@/hooks/useTooltip"

import {
	formatBannerCountdown,
	getCharacterActiveBanner,
	getCharacterBannerThemeColor,
	type ItemStatus,
} from "@/helpers/bannerStatus"

import { CharacterAvatar, CharacterElement } from "@/components/layout/CharacterAvatar"

import styles from "./DashFeaturedCarousel.module.css"

type Entry = { item: Character; status: ItemStatus }

// Horizontal travel (px) a touch has to cover to count as a swipe.
const SWIPE_THRESHOLD = 40

function BannerTiming({ character }: { character: Character }) {
	const now = useNow()
	if (now === null) return null

	const banner = getCharacterActiveBanner(character.id, now)
	if (!banner) return <span>Banner dates TBA</span>

	return banner.start <= now ? (
		<span>
			Ends in <strong>{formatBannerCountdown(banner.end - now)}</strong>
		</span>
	) : (
		<span>
			Starts in <strong>{formatBannerCountdown(banner.start - now)}</strong>
		</span>
	)
}

function Slide({
	entry: { item: character, status },
	active,
	onPointerEnter,
	onPointerLeave,
}: {
	entry: Entry
	active: boolean
	onPointerEnter: PointerEventHandler<HTMLElement>
	onPointerLeave: () => void
}) {
	const themeColor = getCharacterBannerThemeColor(character.id)

	return (
		<Link
			href={`/characters/${character.id}`}
			className={`${styles.slide} ${getItemRarityStyle(character)}`}
			data-active={active}
			inert={!active}
			aria-label={`${character.name} - ${status === "preview" ? "preview" : "featured"}`}
			style={themeColor ? ({ "--theme-color": themeColor } as CSSProperties) : undefined}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}>
			<div className={styles.background}>
				<Image
					src={`/characters/background/${character.id}.png`}
					alt=""
					width={1384}
					height={830}
					sizes="(max-width: 800px) 100vw, 50vw"
					onError={(e) => (e.currentTarget.style.display = "none")}
				/>
			</div>
			<div className={styles.art}>
				<Image
					src={`/characters/full/${character.imageSrc}`}
					alt=""
					width={1080}
					height={1280}
					sizes="(max-width: 800px) 70vw, 30vw"
					priority={active}
				/>
			</div>
			<div className={styles.info}>
				<div className={styles.tag}>
					{status === "preview" ? "Preview" : "Featured"}
				</div>
				<h3 className={styles.name}>{character.name}</h3>
				<div className={styles.meta}>
					<CharacterElement
						element={character.element}
						className={styles.element}
						width={64}
						height={64}
					/>
					<span className={styles.capitalize}>{character.element}</span>
					<span className={styles.divider} />
					<BannerTiming character={character} />
				</div>
			</div>
		</Link>
	)
}

// Hero carousel for the dashboard's featured / preview characters. Autoplay
// is driven by the active thumbnail's CSS progress bar: its animation's end
// advances the slide, so hovering/focusing (which pauses the animation in
// CSS) and reduced motion (which drops it) need no extra JS timers.
export function DashFeaturedCarousel({ entries }: { entries: Entry[] }) {
	const [index, setIndex] = useState(0)
	const touchStartX = useRef<number | null>(null)
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const count = entries.length
	const active = Math.min(index, count - 1)
	const go = (to: number) => setIndex(((to % count) + count) % count)

	return (
		<div
			className={`inset-control ${styles.carousel}`}
			role="region"
			aria-roledescription="carousel"
			aria-label="Featured characters"
			data-autoplay={count > 1}
			onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
			onTouchEnd={(e) => {
				if (touchStartX.current === null) return
				const delta = e.changedTouches[0].clientX - touchStartX.current
				touchStartX.current = null
				if (Math.abs(delta) >= SWIPE_THRESHOLD) go(active + (delta < 0 ? 1 : -1))
			}}
			onKeyDown={(e) => {
				if (e.key === "ArrowRight") go(active + 1)
				else if (e.key === "ArrowLeft") go(active - 1)
			}}>
			<div className={styles.stage}>
				{entries.map((entry, i) => (
					<Slide
						key={entry.item.id}
						entry={entry}
						active={i === active}
						onPointerEnter={showTooltip}
						onPointerLeave={hideTooltip}
					/>
				))}
			</div>

			{count > 1 && (
				<div className={styles.pager}>
					{entries.map(({ item }, i) => (
						<button
							key={item.id}
							type="button"
							className={`${styles.thumb} ${getItemRarityStyle(item)}`}
							aria-label={`Show ${item.name}`}
							aria-current={i === active}
							onClick={() => go(i)}>
							<CharacterAvatar
								character={item}
								alt=""
								className={styles.thumbAvatar}
								width={96}
								height={96}
							/>
							{i === active && (
								<span
									// Remount per slide so a manual pick restarts the timer.
									key={active}
									className={styles.progress}
									onAnimationEnd={() => go(active + 1)}
								/>
							)}
						</button>
					))}
				</div>
			)}

			<Tooltip offset={{ x: 6, y: 0 }}>View Profile</Tooltip>
		</div>
	)
}
