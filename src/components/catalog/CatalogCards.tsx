"use client"

import { useMemo } from "react"
import Link from "next/link"

import type { Character } from "@/types/character"
import type { Arc } from "@/types/weapon"
import type { Item } from "@/types/item"

import { getItemRarityStyle } from "@/data/items"
import { getAllCharactersList } from "@/data/characters/characterList"
import { getAllArcsList } from "@/data/arcs"

import { useNow } from "@/hooks"

import { getItemStatus, type ItemStatus } from "@/helpers/bannerStatus"

import { ArcIcon } from "@/components/layout/ArcIcon"
import {
	CharacterAvatar,
	CharacterElement,
} from "@/components/layout/CharacterAvatar"

import styles from "./catalog.module.css"

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

const STATUS_RANK: Record<string, number> = { preview: 0, featured: 1 }

// Banner status for every item, sorted previews first, then featured, then
// by rarity (highest first) and name. useNow ticks every second, so the
// work is keyed to the minute instead.
function useCatalogItems<T extends Item>(items: T[], onlyFlagged: boolean) {
	const now = useNow()
	const minute = now === null ? null : Math.floor(now / MINUTE_MS)

	return useMemo(() => {
		const at = minute === null ? null : minute * MINUTE_MS
		const withStatus: WithStatus<T>[] = items
			.map((item) => ({ item, status: getItemStatus(item, at) }))
			.filter(({ status }) => !onlyFlagged || status !== null)

		const rank = (status: ItemStatus) => (status ? STATUS_RANK[status] : 2)

		return withStatus.toSorted(
			(a, b) =>
				rank(a.status) - rank(b.status) ||
				b.item.rarity - a.item.rarity ||
				a.item.name.localeCompare(b.item.name)
		)
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

export function CharacterCatalog() {
	const entries = useCharacterCatalog()
	return (
		<div className={styles.grid}>
			<CharacterCards entries={entries} />
		</div>
	)
}

export function ArcCatalog() {
	const entries = useArcCatalog()
	return (
		<div className={styles.grid}>
			<ArcCards entries={entries} />
		</div>
	)
}
