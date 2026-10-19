import type { Item } from "@/types/item"

import { Events, type EventData } from "@/data/activities/events"
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

// Arc banners carry no colour of their own; each runs alongside a character
// banner, so an arc takes the theme colour of the character banner live when
// its first arc banner starts (the same fallback the pulls list uses).
// Returns null for arcs that never had a banner.
export function getArcBannerThemeColor(arcId: string): string | null {
	const arcBanner = arcBanners.find((b) => b.rateupItem === arcId)
	if (!arcBanner) return null

	const start = arcBanner.getStartDate()
	const companion = Events.find(
		(event) =>
			event.type === "Gacha" &&
			event.themeColor &&
			event.getStartDate(ANY_SERVER) <= start &&
			start < event.getEndDate(ANY_SERVER)
	)

	return companion?.themeColor ?? null
}

// Theme colour of a character's first rate-up banner, or null if they've
// never had one.
export function getCharacterBannerThemeColor(characterId: string): string | null {
	const banner = Events.find(
		(event) =>
			event.type === "Gacha" && event.rateupItem === characterId && event.themeColor
	)
	return banner?.themeColor ?? null
}

export type CharacterBanner = BannerWindow & { event: EventData }

// A character's running rate-up banner, else their next scheduled one.
// Null for hand-flagged previews whose banner dates aren't known yet.
export function getCharacterActiveBanner(
	characterId: string,
	now: number
): CharacterBanner | null {
	const banners = Events.filter(
		(event) => event.type === "Gacha" && event.rateupItem === characterId
	).map((event) => ({
		event,
		start: event.getStartDate(ANY_SERVER),
		end: event.getEndDate(ANY_SERVER),
	}))

	return (
		banners.find(({ start, end }) => start <= now && now < end) ??
		banners
			.filter(({ start }) => start > now)
			.toSorted((a, b) => a.start - b.start)[0] ??
		null
	)
}

// Coarser than formatTimeRemaining - a banner countdown only needs the
// two largest units.
export function formatBannerCountdown(ms: number) {
	const minutes = Math.max(0, Math.floor(ms / 60_000))
	const days = Math.floor(minutes / 1440)
	const hours = Math.floor((minutes % 1440) / 60)

	if (days > 0) return `${days}d ${hours}h`
	if (hours > 0) return `${hours}h ${minutes % 60}m`
	return `${minutes % 60}m`
}
