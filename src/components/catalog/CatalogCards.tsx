"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import type { Character } from "@/types/character"
import type { Arc } from "@/types/weapon"
import type { Item } from "@/types/item"

import { getItemRarityStyle } from "@/data/items"
import { getAllCharactersList } from "@/data/characters/characterList"
import { getAllArcsList } from "@/data/arcs"

import { useNow } from "@/hooks"

import {
	getItemStatus,
	sortByStatus,
	type ItemStatus,
} from "@/helpers/bannerStatus"

import { ArcIcon } from "@/components/layout/ArcIcon"
import {
	CharacterAvatar,
	CharacterElement,
} from "@/components/layout/CharacterAvatar"

import { InfoBox } from "@/components/layout/InfoBox"

import {
	CatalogFilterToolbar,
	NO_FILTERS,
	type CatalogFilters,
} from "./CatalogFilterToolbar"
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

function CharacterCard({ character, status }: { character: Character; status: ItemStatus }) {
	return (
		<Link
			href={`/characters/${character.id}`}
			className={`${styles.card} ${getItemRarityStyle(character)}`}>
			<FeatureTag status={status} />
			<div className={styles.avatarContainer}>
				<CharacterAvatar
					character={character}
					className={styles.avatar}
					height={256}
					width={256}
				/>
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

function ArcCard({ arc, status }: { arc: Arc; status: ItemStatus }) {
	return (
		<Link
			href={`/arcs/${arc.id}`}
			className={`${styles.card} ${styles.arcCard} ${getItemRarityStyle(arc)}`}>
			<FeatureTag status={status} />
			<div className={styles.arcImageContainer}>
				<ArcIcon
					arc={arc}
					className={styles.arcImage}
					height={256}
					width={256}
				/>
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

export function CharacterCards({ entries }: { entries: WithStatus<Character>[] }) {
	return entries.map(({ item, status }) => (
		<CharacterCard key={item.id} character={item} status={status} />
	))
}

export function ArcCards({ entries }: { entries: WithStatus<Arc>[] }) {
	return entries.map(({ item, status }) => (
		<ArcCard key={item.id} arc={item} status={status} />
	))
}

function EmptyFilterNotice({ onReset }: { onReset: () => void }) {
	return (
		<InfoBox>
			<div>
				{
					"I-I can't seem to find anything with those filters. Would you like to "
				}
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

const characterRarities = uniqueSorted(allCharacters.map((c) => c.rarity), true)
const characterElements = uniqueSorted(allCharacters.map((c) => c.element))
const characterArcTypes = uniqueSorted(allCharacters.map((c) => c.arcType))
const arcRarities = uniqueSorted(allArcs.map((a) => a.rarity), true)
const arcTypes = uniqueSorted(allArcs.map((a) => a.type))

export function CharacterCatalog() {
	const entries = useCharacterCatalog()
	const [filters, setFilters] = useState<CatalogFilters>(NO_FILTERS)

	const filtered = entries.filter(
		({ item }) =>
			(filters.rarity === null || item.rarity === filters.rarity) &&
			(filters.element === null || item.element === filters.element) &&
			(filters.arcType === null || item.arcType === filters.arcType)
	)

	return (
		<>
			<CatalogFilterToolbar
				filters={filters}
				onChange={setFilters}
				rarities={characterRarities}
				elements={characterElements}
				arcTypes={characterArcTypes}
			/>
			<main role="main" className={`page ${pageStyles.page}`}>
				{filtered.length === 0 ? (
					<EmptyFilterNotice onReset={() => setFilters(NO_FILTERS)} />
				) : (
					<div className={styles.grid}>
						<CharacterCards entries={filtered} />
					</div>
				)}
			</main>
		</>
	)
}

export function ArcCatalog() {
	const entries = useArcCatalog()
	const [filters, setFilters] = useState<CatalogFilters>(NO_FILTERS)

	const filtered = entries.filter(
		({ item }) =>
			(filters.rarity === null || item.rarity === filters.rarity) &&
			(filters.arcType === null || item.type === filters.arcType)
	)

	return (
		<>
			<CatalogFilterToolbar
				filters={filters}
				onChange={setFilters}
				rarities={arcRarities}
				arcTypes={arcTypes}
			/>
			<main role="main" className={`page ${pageStyles.page}`}>
				{filtered.length === 0 ? (
					<EmptyFilterNotice onReset={() => setFilters(NO_FILTERS)} />
				) : (
					<div className={styles.grid}>
						<ArcCards entries={filtered} />
					</div>
				)}
			</main>
		</>
	)
}
