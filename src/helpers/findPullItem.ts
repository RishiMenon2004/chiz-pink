import { Item } from "@/types/item"
import { ScarboroughFairPull } from "@/types/pulls"

import { EnumRarity, findReward } from "@/data/items"
import { findArc } from "@/data/arcs"
import { findCharacter } from "@/data/characters"

export function findPullItem(
		itemId: string,
		type?: ScarboroughFairPull["rewardType"]
	) {
		const fallback = { name: itemId, rarity: EnumRarity.Epic } as Item

		if (type === undefined) {
			return findArc(itemId) ?? fallback
		}

		switch (type) {
			case "arc":
				return findArc(itemId) ?? fallback
			case "item":
			case "cosmetic":
				return findReward(itemId) ?? fallback
			case "character":
				return findCharacter(itemId) ?? fallback
		}
	}