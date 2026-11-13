"use client"

import { forwardRef, KeyboardEvent, useMemo, useState } from "react"
import Image from "next/image"

import type { MessageKey } from "@/types/messages"

import { EnumRarity, getItemRarityStyle } from "@/data/items"

import { useTooltip } from "@/hooks/useTooltip"

import { fuzzyScoreAny } from "@/helpers/fuzzyMatch"

import { useT } from "@/contexts"

import type { Candidate } from "./manualPulls"

import styles from "./manualPullEntry.module.css"

type Filter = "all" | "sRank" | "aRank" | "bRank" | "items" | "cosmetics"

const FILTER_LABELS: Record<Filter, MessageKey> = {
	all: "pulls.manual.filters.all",
	sRank: "pulls.manual.filters.sRank",
	aRank: "pulls.manual.filters.aRank",
	bRank: "pulls.manual.filters.bRank",
	items: "pulls.manual.filters.items",
	cosmetics: "pulls.manual.filters.cosmetics",
}

// The rank chips cover characters, arcs and materials (dice, warp and lost
// pieces, which have their own chip too); cosmetics have only theirs.
const isRanked = (c: Candidate) => c.rewardType !== "cosmetic"
const matchesFilter: Record<Filter, (c: Candidate) => boolean> = {
	all: () => true,
	sRank: (c) => isRanked(c) && c.rarity === EnumRarity.Epic,
	aRank: (c) => isRanked(c) && c.rarity === EnumRarity.Rare,
	bRank: (c) => isRanked(c) && c.rarity === EnumRarity.Uncommon,
	items: (c) => c.rewardType === "item",
	cosmetics: (c) => c.rewardType === "cosmetic",
}

// Within a rank: characters, then arcs, cosmetics and items.
const TYPE_ORDER: Record<Candidate["rewardType"], number> = {
	character: 0,
	arc: 1,
	cosmetic: 2,
	item: 3,
}

// Narrows candidates to a search: what the banners feature first, then by
// rank, type and name.
export function searchCandidates(candidates: Candidate[], query: string) {
	return candidates
		.filter((c) => query === "" || fuzzyScoreAny(query, [c.name]) !== null)
		.toSorted(
			(a, b) =>
				(a.featured ?? Infinity) - (b.featured ?? Infinity) ||
				b.rarity - a.rarity ||
				TYPE_ORDER[a.rewardType] - TYPE_ORDER[b.rewardType] ||
				a.name.localeCompare(b.name)
		)
}

// A grid of item tiles to pick from, with chips narrowing it by rank or to
// cosmetics. `query` is the search typed elsewhere (the item's text box).
export const ItemGrid = forwardRef<
	HTMLDivElement,
	{
		id?: string
		candidates: Candidate[]
		query: string
		selected?: Candidate
		onPick: (candidate: Candidate) => void
		onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
	}
>(function ItemGrid({ id, candidates, query, selected, onPick, onKeyDown }, ref) {
	const t = useT()
	const [filter, setFilter] = useState<Filter>("all")
	// The tile under the pointer, named in the tooltip (its own label
	// can be cut short).
	const [hovered, setHovered] = useState<string | null>(null)
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	// Only chips with something under them (the arc board has just arcs).
	const filters = (Object.keys(FILTER_LABELS) as Filter[]).filter((option) =>
		candidates.some(matchesFilter[option])
	)
	const shown = useMemo(
		() => searchCandidates(candidates.filter(matchesFilter[filter]), query),
		[candidates, filter, query]
	)

	return (
		<div ref={ref} id={id} className={styles.picker} onKeyDown={onKeyDown}>
			<div className={styles.pickerFilters} role="group" aria-label={t("pulls.manual.filters.label")}>
				{filters.map((option) => (
					<button
						key={option}
						type="button"
						aria-pressed={filter === option}
						className={styles.pickerFilter}
						onClick={() => setFilter(option)}>
						{t(FILTER_LABELS[option])}
					</button>
				))}
			</div>
			{shown.length === 0 ? (
				<p className={styles.pickerEmpty}>{t("pulls.manual.noItems")}</p>
			) : (
				<div className={styles.pickerGrid}>
					{shown.map((candidate) => (
						<button
							key={`${candidate.rewardType}-${candidate.id}`}
							type="button"
							className={`${styles.pickerTile} ${getItemRarityStyle(candidate)}`}
							aria-pressed={candidate === selected}
							onPointerEnter={(e) => {
								setHovered(candidate.name)
								showTooltip(e)
							}}
							onPointerLeave={hideTooltip}
							onClick={() => onPick(candidate)}>
							<Image
								src={candidate.imageSrc}
								width={64}
								height={64}
								alt=""
								unoptimized
								className={styles.pickerImage}
							/>
							<span className={styles.pickerName}>{candidate.name}</span>
						</button>
					))}
				</div>
			)}
			{hovered && <Tooltip offset={{ x: 32, y: 0 }}>{hovered}</Tooltip>}
		</div>
	)
})
