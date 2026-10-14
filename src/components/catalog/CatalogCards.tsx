import type { ReactNode } from "react"
import Link from "next/link"

import type { Character } from "@/types/character"
import type { Arc } from "@/types/weapon"
import type { Item } from "@/types/item"

import { getItemRarityStyle } from "@/data/items"

import { ArcIcon } from "@/components/layout/ArcIcon"
import {
	CharacterAvatar,
	CharacterElement,
} from "@/components/layout/CharacterAvatar"

import styles from "./catalog.module.css"

function FeatureTag({ item }: { item: Item }) {
	if (!item.isPreview && !item.isFeatured) return null

	return (
		<div className={styles.featureTag}>
			{item.isPreview ? "Preview" : "Featured"}
		</div>
	)
}

export function CharacterCard({ character }: { character: Character }) {
	return (
		<Link
			href={`/characters/${character.id}`}
			className={`${styles.card} ${getItemRarityStyle(character)}`}>
			<FeatureTag item={character} />
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

export function ArcCard({ arc }: { arc: Arc }) {
	return (
		<Link
			href={`/arcs/${arc.id}`}
			className={`${styles.card} ${styles.arcCard} ${getItemRarityStyle(arc)}`}>
			<FeatureTag item={arc} />
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

export function CatalogGrid({ children }: { children: ReactNode }) {
	return <div className={styles.grid}>{children}</div>
}

// Previews first, then featured, then by rarity (highest first) and name,
// so the newest and most relevant items lead every list.
export function sortCatalogItems<T extends Item>(items: T[]): T[] {
	const rank = (item: Item) => (item.isPreview ? 0 : item.isFeatured ? 1 : 2)

	return items.toSorted(
		(a, b) =>
			rank(a) - rank(b) ||
			b.rarity - a.rarity ||
			a.name.localeCompare(b.name)
	)
}
