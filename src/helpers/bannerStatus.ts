import type { Item } from "@/types/item"

import { Events, patchTimings, type EventData } from "@/data/activities/events"
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

const patches = Object.values(patchTimings)

// Latest point an upcoming banner may start and still count as a preview.
// First half of a patch: the rest of that patch (its second-half banners).
// Second half, or the gap before the next patch: through the next patch, so
// its characters appear once the current patch's last banners are live.
// Past the last patch on record, anything scheduled counts.
function getPreviewHorizon(now: number) {
	const index = patches.findLastIndex((patch) => patch.phase1Start() <= now)
	if (index === -1) return patches[0]?.phase2End() ?? Infinity

	const current = patches[index]
	if (now < current.phase2Start()) return current.phase2End()

	return patches[index + 1]?.phase2End() ?? Infinity
}

// "featured" while one of the item's banners is running. "preview" when it
// hasn't had a banner start yet and its next one starts within the preview
// horizon (see getPreviewHorizon). Items with no banner scheduled fall back
// to the hand-set isPreview flag (announced before their dates are known).
// Reruns coming up later don't count as previews - the item is already out.
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

	if (windows.some(({ start }) => start <= now)) return null

	const upcoming = windows.filter(({ start }) => start > now)
	if (upcoming.length === 0) return item.isPreview ? "preview" : null

	const horizon = getPreviewHorizon(now)
	return upcoming.some(({ start }) => start <= horizon) ? "preview" : null
}

// Whether an item is public yet: it has no banner (standard items and
// hand-flagged previews), one of its banners has started, or it's within the
// preview horizon. Items further out stay hidden until their preview starts.
//
// With no clock yet (server render / first client paint, see useNow) this
// can only go by the data: items whose banners all fall in the latest patch
// on record stay hidden, so the render stays consistent; anything revealed
// early by the clock pops in once it's known.
export function isItemRevealed(item: Item, now: number | null) {
	const windows = getBannerWindows().get(item.id) ?? []
	if (windows.length === 0) return true

	if (now === null) {
		const latestPatchStart = patches.at(-1)?.phase1Start() ?? Infinity
		return windows.some(({ start }) => start < latestPatchStart)
	}

	return (
		windows.some(({ start }) => start <= now) || getItemStatus(item, now) !== null
	)
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

// An item's running banner window (character or arc), else its next
// scheduled one. Null when it has none coming up.
export function getActiveBannerWindow(itemId: string, now: number) {
	const windows = getBannerWindows().get(itemId) ?? []

	return (
		windows.find(({ start, end }) => start <= now && now < end) ??
		windows
			.filter(({ start }) => start > now)
			.toSorted((a, b) => a.start - b.start)[0] ??
		null
	)
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
