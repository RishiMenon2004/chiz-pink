import type { Item } from "@/types/item"

import { Events } from "@/data/activities/events"
import { arcBanners } from "@/data/activities/banners"

export type ItemStatus = "featured" | "preview" | null

type BannerWindow = {
	start: number
	end: number
}

// Gacha banners run on global patch times (globalPatchStart/End), so the
// server argument their date getters accept doesn't change the result.
const ANY_SERVER = "Asia"

let windowsByItem: Map<string, BannerWindow[]> | null = null

// Every character and arc banner window, keyed by rate-up item id. Built
// once on first use - banner data is static for the life of the bundle.
function getBannerWindows() {
	if (windowsByItem) return windowsByItem

	windowsByItem = new Map()
	const add = (id: string, start: number, end: number) => {
		const list = windowsByItem!.get(id) ?? []
		list.push({ start, end })
		windowsByItem!.set(id, list)
	}

	for (const event of Events) {
		if (event.type !== "Gacha" || !event.rateupItem) continue
		add(
			event.rateupItem,
			event.getStartDate(ANY_SERVER),
			event.getEndDate(ANY_SERVER)
		)
	}

	for (const banner of arcBanners) {
		add(banner.rateupItem, banner.getStartDate(), banner.getEndDate())
	}

	return windowsByItem
}

// "featured" while one of the item's banners is running. "preview" when it
// hasn't had a banner start yet but either has one scheduled or is flagged
// isPreview by hand (announced before its banner dates are known). Reruns
// coming up later don't count as previews - the item is already out.
//
// `now` is null during server render and the first client render (see
// useNow), so only the hand-set preview flag applies until the clock is
// known - keeps hydration consistent.
export function getItemStatus(item: Item, now: number | null): ItemStatus {
	if (now === null) return item.isPreview ? "preview" : null

	const windows = getBannerWindows().get(item.id) ?? []

	if (windows.some(({ start, end }) => start <= now && now < end)) {
		return "featured"
	}

	const hasStarted = windows.some(({ start }) => start <= now)
	const hasUpcoming = windows.some(({ start }) => start > now)

	if (!hasStarted && (item.isPreview || hasUpcoming)) return "preview"

	return null
}

const STATUS_RANK = { preview: 0, featured: 1 }

export function sortByStatus<T extends Item>(items: T[], now: number | null) {
	const rank = (item: T) => {
		const status = getItemStatus(item, now)
		return status ? STATUS_RANK[status] : 2
	}
	return items.toSorted((a, b) => rank(a) - rank(b))
}
