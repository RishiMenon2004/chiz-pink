"use client"

import { CSSProperties, ReactNode, useMemo, useState } from "react"
import Link from "next/link"

import type { Character } from "@/types/character"
import type { Arc } from "@/types/weapon"
import type { Item } from "@/types/item"

import { getItemRarityStyle } from "@/data/items"
import { getAllCharactersList } from "@/data/characters/characterList"
import { getAllArcsList } from "@/data/arcs"

import { useNow } from "@/hooks"

import { fuzzyScoreAny } from "@/helpers/fuzzyMatch"
import { getRarityName } from "@/helpers/getRarityName"

import {
	getArcBannerThemeColor,
	getItemStatus,
	sortByStatus,
	type ItemStatus,
} from "@/helpers/bannerStatus"

import { ArcIcon } from "@/components/layout/ArcIcon"
import { CharacterAvatar, CharacterElement } from "@/components/layout/CharacterAvatar"

import { InfoBox } from "@/components/layout/InfoBox"
import { MaterialGroup } from "@/components/inventory/MaterialGroup"

import {
	CatalogFilterToolbar,
	DEFAULT_SORT,
	NO_FILTERS,
	type CatalogFilters,
	type CatalogGroupBy,
	type CatalogSort,
} from "./CatalogFilterToolbar"
import { CatalogSwitch } from "./CatalogSwitch"
import styles from "./catalog.module.css"
import pageStyles from "@/app/page.module.css"

const MINUTE_MS = 60_000

type WithStatus<T> = { item: T; status: ItemStatus }

function FeatureTag({ status }: { status: ItemStatus }) {
	if (!status) return null

	return (
		<div className={styles.featureTag}>
			{status === "preview" ? "Preview" : "Featured"}
		</div>
	)
}

function CharacterCard({
	character,
	status,
}: {
	character: Character
	status: ItemStatus
}) {
	return (
		<Link
			href={`/characters/${character.id}`}
			className={`${styles.card} ${getItemRarityStyle(character)}`}>
			<FeatureTag status={status} />
			<div className={styles.avatarContainer}>
				<div className={styles.avatarFrame}>
					<CharacterAvatar
						character={character}
						className={styles.avatar}
						height={256}
						width={256}
					/>
				</div>
				<CharacterElement
					element={character.element}
					className={styles.element}
					height={64}
					width={64}
				/>
			</div>
			<div className={styles.name}>{character.name}</div>
		</Link>
	)
}

// Rate-up arcs take their banner's theme colour (same as the profile page);
// the rest keep their rarity colour.
const arcThemeColors = new Map(
	getAllArcsList().map((arc) => [arc.id, getArcBannerThemeColor(arc.id)])
)

function ArcCard({ arc, status }: { arc: Arc; status: ItemStatus }) {
	const themeColor = arcThemeColors.get(arc.id)

	return (
		<Link
			href={`/arcs/${arc.id}`}
			className={`${styles.card} ${styles.arcCard} ${getItemRarityStyle(arc)}`}
			style={
				themeColor
					? ({
							"--rarity-color": themeColor,
							"--rarity-color-highlight": `color-mix(in srgb, ${themeColor}, white 45%)`,
						} as CSSProperties)
					: undefined
			}>
			<FeatureTag status={status} />
			<div className={styles.arcImageContainer}>
				<div className={styles.arcFrame}>
					<ArcIcon arc={arc} className={styles.arcImage} height={256} width={256} />
				</div>
			</div>
			<div className={styles.name}>{arc.name}</div>
		</Link>
	)
}

function useCatalogItems<T extends Item>(items: T[], onlyFlagged: boolean) {
	const now = useNow()
	const minute = now === null ? null : Math.floor(now / MINUTE_MS)

	return useMemo(() => {
		const at = minute === null ? null : minute * MINUTE_MS
		return sortByStatus(items, at)
			.map((item) => ({ item, status: getItemStatus(item, at) }))
			.filter(({ status }) => !onlyFlagged || status !== null)
	}, [items, onlyFlagged, minute])
}

const allCharacters = getAllCharactersList()
const allArcs = getAllArcsList()

// `onlyFlagged` limits the list to featured and preview items (the
// dashboard showcase); otherwise every item is shown.
export function useCharacterCatalog(onlyFlagged = false) {
	return useCatalogItems(allCharacters, onlyFlagged)
}

export function useArcCatalog(onlyFlagged = false) {
	return useCatalogItems(allArcs, onlyFlagged)
}

function CharacterCards({ entries }: { entries: WithStatus<Character>[] }) {
	return entries.map(({ item, status }) => (
		<CharacterCard key={item.id} character={item} status={status} />
	))
}

function ArcCards({ entries }: { entries: WithStatus<Arc>[] }) {
	return entries.map(({ item, status }) => (
		<ArcCard key={item.id} arc={item} status={status} />
	))
}

function EmptyFilterNotice({ onReset }: { onReset: () => void }) {
	return (
		<InfoBox sticker="cry">
			<div>
				{"I-I can't seem to find anything with those filters. Would you like to "}
				<a onClick={onReset} className="btn-anchor">
					try again?
				</a>
			</div>
		</InfoBox>
	)
}

const uniqueSorted = <T extends string | number>(values: T[], descending = false) =>
	[...new Set(values)].toSorted((a, b) =>
		descending ? (a < b ? 1 : -1) : a < b ? -1 : 1
	)

const characterRarities = uniqueSorted(
	allCharacters.map((c) => c.rarity),
	true
)
const characterElements = uniqueSorted(allCharacters.map((c) => c.element))
const characterArcTypes = uniqueSorted(allCharacters.map((c) => c.arcType))
const arcRarities = uniqueSorted(
	allArcs.map((a) => a.rarity),
	true
)
const arcTypes = uniqueSorted(allArcs.map((a) => a.type))

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

type Group<T> = { key: string | number; title: string; entries: T[] }

// Buckets entries in the order `keys` lists them (empty buckets dropped);
// each bucket keeps the incoming featured/preview-first order.
function groupEntries<T, K extends string | number>(
	entries: T[],
	keys: K[],
	keyOf: (entry: T) => K,
	titleOf: (key: K) => string
): Group<T>[] {
	return keys
		.map((key) => ({
			key,
			title: titleOf(key),
			entries: entries.filter((entry) => keyOf(entry) === key),
		}))
		.filter((group) => group.entries.length > 0)
}

function CatalogGrid<T>({
	entries,
	groups,
	render,
}: {
	entries: T[]
	groups: Group<T>[] | null
	render: (entries: T[]) => ReactNode
}) {
	if (!groups) return <div className={styles.grid}>{render(entries)}</div>

	return groups.map((group) => (
		<MaterialGroup key={group.key} title={`${group.title} (${group.entries.length})`}>
			<div className={`inset-control ${styles.grid} ${styles.groupGrid}`}>
				{render(group.entries)}
			</div>
		</MaterialGroup>
	))
}

// Drops entries that don't fuzzy-match the search and, while searching,
// orders the rest best match first (ties keep featured/preview-first).
function applySearch<T extends Item>(
	entries: WithStatus<T>[],
	search: string
): WithStatus<T>[] {
	if (!search.trim()) return entries

	return entries
		.map((entry) => ({
			entry,
			score: fuzzyScoreAny(search, [entry.item.name, entry.item.id]),
		}))
		.filter((scored) => scored.score !== null)
		.toSorted((a, b) => b.score! - a.score!)
		.map(({ entry }) => entry)
}

const byName = (a: Item, b: Item) => a.name.localeCompare(b.name)

// Highest rank first, then A-Z within a rank.
const byRarity = (a: Item, b: Item) => b.rarity - a.rarity || byName(a, b)

// Applies a non-default sort (the default keeps the incoming featured /
// best-match order). Reverse flips whichever order is in effect.
function applySort<T extends Item>(
	entries: WithStatus<T>[],
	sort: CatalogSort,
	compare: Partial<Record<CatalogSort["by"], (a: T, b: T) => number>>
): WithStatus<T>[] {
	const compareFn = compare[sort.by]
	const sorted = compareFn
		? entries.toSorted((a, b) => compareFn(a.item, b.item))
		: entries
	return sort.reverse ? sorted.toReversed() : sorted
}

const characterSorts = {
	rarity: byRarity,
	name: byName,
	element: (a: Character, b: Character) =>
		a.element.localeCompare(b.element) || byRarity(a, b),
}

const arcSorts = { rarity: byRarity, name: byName }

export function CharacterCatalog() {
	const entries = useCharacterCatalog()
	const [filters, setFilters] = useState<CatalogFilters>(NO_FILTERS)
	const [groupBy, setGroupBy] = useState<CatalogGroupBy>(null)
	const [sort, setSort] = useState<CatalogSort>(DEFAULT_SORT)

	const filtered = applySearch(
		entries.filter(
			({ item }) =>
				(filters.rarity === null || item.rarity === filters.rarity) &&
				(filters.element === null || item.element === filters.element) &&
				(filters.arcType === null || item.arcType === filters.arcType)
		),
		filters.search
	)
	const sorted = applySort(filtered, sort, characterSorts)

	const groups =
		groupBy === "rarity"
			? groupEntries(sorted, characterRarities, (e) => e.item.rarity, getRarityName)
			: groupBy === "element"
				? groupEntries(sorted, characterElements, (e) => e.item.element, capitalise)
				: groupBy === "arcType"
					? groupEntries(sorted, characterArcTypes, (e) => e.item.arcType, String)
					: null

	return (
		<>
			<CatalogFilterToolbar
				filters={filters}
				onChange={setFilters}
				groupBy={groupBy}
				onGroupByChange={setGroupBy}
				sort={sort}
				onSortChange={setSort}
				rarities={characterRarities}
				elements={characterElements}
				arcTypes={characterArcTypes}
			/>
			<CatalogSwitch active="characters" />
			<main role="main" className={`page ${pageStyles.page}`}>
				{filtered.length === 0 ? (
					<EmptyFilterNotice onReset={() => setFilters(NO_FILTERS)} />
				) : (
					<CatalogGrid
						entries={sorted}
						groups={groups}
						render={(entries) => <CharacterCards entries={entries} />}
					/>
				)}
			</main>
		</>
	)
}

export function ArcCatalog() {
	const entries = useArcCatalog()
	const [filters, setFilters] = useState<CatalogFilters>(NO_FILTERS)
	const [groupBy, setGroupBy] = useState<CatalogGroupBy>(null)
	const [sort, setSort] = useState<CatalogSort>(DEFAULT_SORT)

	const filtered = applySearch(
		entries.filter(
			({ item }) =>
				(filters.rarity === null || item.rarity === filters.rarity) &&
				(filters.arcType === null || item.type === filters.arcType)
		),
		filters.search
	)
	const sorted = applySort(filtered, sort, arcSorts)

	const groups =
		groupBy === "rarity"
			? groupEntries(sorted, arcRarities, (e) => e.item.rarity, getRarityName)
			: groupBy === "arcType"
				? groupEntries(sorted, arcTypes, (e) => e.item.type, String)
				: null

	return (
		<>
			<CatalogFilterToolbar
				filters={filters}
				onChange={setFilters}
				groupBy={groupBy}
				onGroupByChange={setGroupBy}
				sort={sort}
				onSortChange={setSort}
				rarities={arcRarities}
				arcTypes={arcTypes}
			/>
			<CatalogSwitch active="arcs" />
			<main role="main" className={`page ${pageStyles.page}`}>
				{filtered.length === 0 ? (
					<EmptyFilterNotice onReset={() => setFilters(NO_FILTERS)} />
				) : (
					<CatalogGrid
						entries={sorted}
						groups={groups}
						render={(entries) => <ArcCards entries={entries} />}
					/>
				)}
			</main>
		</>
	)
}
