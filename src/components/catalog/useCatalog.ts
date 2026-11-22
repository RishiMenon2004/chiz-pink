"use client"

import { useMemo } from "react"

import type { Item } from "@/types/item"

import { getAllArcsList } from "@/data/arcs"
import { getAllCharactersList } from "@/data/characters/characterList"

import { useNow } from "@/hooks/useNow"

import {
	getItemStatus,
	isItemRevealed,
	sortByStatus,
} from "@/helpers/bannerStatus"

const MINUTE_MS = 60_000

const allCharacters = getAllCharactersList()
const allArcs = getAllArcsList()

function useCatalogItems<T extends Item>(items: T[], onlyFlagged: boolean) {
	const now = useNow(MINUTE_MS)
	const minute = now === null ? null : Math.floor(now / MINUTE_MS)

	return useMemo(() => {
		const at = minute === null ? null : minute * MINUTE_MS
		return sortByStatus(items, at)
			.filter((item) => isItemRevealed(item, at))
			.map((item) => ({ item, status: getItemStatus(item, at) }))
			.filter(({ status }) => !onlyFlagged || status !== null)
	}, [items, onlyFlagged, minute])
}

// `onlyFlagged` limits the list to featured and preview items (the
// dashboard showcase); otherwise every item is shown.
export function useCharacterCatalog(onlyFlagged = false) {
	return useCatalogItems(allCharacters, onlyFlagged)
}

export function useArcCatalog(onlyFlagged = false) {
	return useCatalogItems(allArcs, onlyFlagged)
}
