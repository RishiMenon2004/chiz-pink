import type { BannerType, ScarboroughFairPull } from "@/types/pulls"
import type { GameServer } from "@/types/server"
import type { MessageKey } from "@/types/messages"

import { EnumRarity, getAllRewardsList } from "@/data/items"
import { getAllArcsList } from "@/data/arcs"
import { getAllCharactersList } from "@/data/characters"

import { Events } from "@/data/activities/events"
import { characterBanners } from "@/data/activities/banners"
import { bannerCosmetics } from "@/data/activities/bannerCosmetics"

import { isPullInBannerWindow, permanentRateupSet } from "@/helpers/calculatePity"
import { randomId } from "@/helpers/randomId"

type RewardType = ScarboroughFairPull["rewardType"]

// Something a pull can give, as the item pickers offer it.
export type Candidate = {
	id: string
	name: string
	rarity: EnumRarity
	rewardType: RewardType
	// The image path under public/.
	imageSrc: string
	// Where it comes among what the banners running at the time feature
	// (their rate-ups, then their outfits and gliders); listed first.
	featured?: number
}

// A dice roll, or one of the results that come with a pull without being one.
export type Result = "1" | "2" | "3" | "4" | "5" | "6" | "pointsGift" | "slumberland"

export const RESULTS: Result[] = ["1", "2", "3", "4", "5", "6", "pointsGift", "slumberland"]
export const DICE_RESULTS: Result[] = ["1", "2", "3", "4", "5", "6"]

const RESULT_LABELS: Partial<Record<Result, MessageKey>> = {
	pointsGift: "pulls.list.pointsGift",
	slumberland: "pulls.list.slumberland",
}

// The label for a result: "Dice 4", "Points Gift"...
export function resultLabel(
	result: Result,
	t: (key: MessageKey, params?: Record<string, string | number>) => string
) {
	const key = RESULT_LABELS[result]
	return key ? t(key) : t("pulls.manual.dice", { roll: result })
}

// The dice fields of a character-board pull for a result.
export function resultFields(result: Result) {
	const isDice = /^[1-6]$/.test(result)
	return {
		diceRoll: isDice ? Number(result) : 1,
		resultType: isDice ? ("dice" as const) : (result as "pointsGift" | "slumberland"),
	}
}

// The highest a pity can be set to on each board: its hard pity.
export const HARD_PITY: Record<BannerType, number> = {
	limitedBanner: 90,
	permanentBanner: 90,
	arcsBanner: 80,
}

// The limited banners' rate-up characters, reruns included.
const characterRateUps = new Set(
	Events.flatMap((event) =>
		event.type === "Gacha" && event.rateupItem ? [event.rateupItem] : []
	)
)

// What each board can give: arcs only on the Arc Miracle Box; characters,
// arcs and rewards (materials and cosmetics) on the character boards. The
// S-ranks are the board's own: every S-rank arc on the arc board, every
// limited character on the limited board, the permanent board's S-ranks
// there, and no S-rank arcs on either character board.
// Ids are only unique within a type (there's a Clear Skies arc and outfit).
export const candidateKey = (rewardType: RewardType, id: string) => `${rewardType}:${id}`

// The rate-ups of a board in order, each with what its banner features
// alongside it: the banners running at `timestamp` first, then the rest by
// first release, newest first. On the limited board each
// character is followed by its outfit and glider.
function featuredAt(bannerType: BannerType, timestamp: number, server: GameServer) {
	if (bannerType === "permanentBanner") return []
	const isRunning = (banner: (typeof characterBanners)[number]) =>
		isPullInBannerWindow(
			{ startDate: banner.getStartDate(server), endDate: banner.getEndDate(server) },
			{ uid: "", timestamp, rank: EnumRarity.Common, rewardId: "" }
		)
	const rateUpOf = (banner: (typeof characterBanners)[number]) =>
		bannerType === "arcsBanner"
			? banner.arcBanner?.rateupItem && candidateKey("arc", banner.arcBanner.rateupItem)
			: banner.rateupItem && candidateKey("character", banner.rateupItem)

	const running = characterBanners.filter(isRunning)
	// The rest by when each rate-up first ran, newest first: a rerun doesn't
	// move it up. Banners yet to start are left out (see unreleasedAt).
	const firstRuns = new Map<string, (typeof characterBanners)[number]>()
	for (const banner of characterBanners
		.filter((b) => b.getStartDate(server) <= timestamp)
		.toSorted((a, b) => a.getStartDate(server) - b.getStartDate(server))) {
		const rateUp = rateUpOf(banner)
		if (rateUp && !firstRuns.has(rateUp)) firstRuns.set(rateUp, banner)
	}
	const others = [...firstRuns.values()].reverse()

	const featured: string[] = []
	for (const banner of [...running, ...others]) {
		const rateUp = rateUpOf(banner)
		if (!rateUp || featured.includes(rateUp)) continue
		featured.push(rateUp)
		if (bannerType === "limitedBanner" && banner.rateupItem) {
			const cosmetics = bannerCosmetics[banner.rateupItem] ?? []
			featured.push(...cosmetics.map((id) => candidateKey("cosmetic", id)))
		}
	}
	return featured
}

// What only comes from banners that haven't started by `timestamp` (with
// a little leeway, as for pulls): their rate-up characters and arcs, and
// the characters' outfits and gliders. Something on any banner that has
// started stays.
function unreleasedAt(timestamp: number, server: GameServer) {
	const started = (banner: (typeof characterBanners)[number]) =>
		isPullInBannerWindow(
			{ startDate: banner.getStartDate(server), endDate: Infinity },
			{ uid: "", timestamp, rank: EnumRarity.Common, rewardId: "" }
		)
	const keysOf = (banner: (typeof characterBanners)[number]) => [
		...(banner.rateupItem
			? [
					candidateKey("character", banner.rateupItem),
					...(bannerCosmetics[banner.rateupItem] ?? []).map((id) =>
						candidateKey("cosmetic", id)
					),
				]
			: []),
		...(banner.arcBanner ? [candidateKey("arc", banner.arcBanner.rateupItem)] : []),
	]
	const released = new Set(characterBanners.filter(started).flatMap(keysOf))
	return new Set(
		characterBanners
			.filter((banner) => !started(banner))
			.flatMap(keysOf)
			.filter((key) => !released.has(key))
	)
}

// `at` orders the rate-ups and what comes with them first (see featuredAt)
// and leaves out what's still to come then (see unreleasedAt).
export function candidatesFor(
	bannerType: BannerType,
	at?: { timestamp: number; server: GameServer }
): Candidate[] {
	const featured = at ? featuredAt(bannerType, at.timestamp, at.server) : []
	const unreleased = at ? unreleasedAt(at.timestamp, at.server) : new Set<string>()
	const rank = (candidate: Candidate): Candidate => {
		const index = featured.indexOf(candidateKey(candidate.rewardType, candidate.id))
		return index === -1 ? candidate : { ...candidate, featured: index }
	}
	return allCandidatesFor(bannerType)
		.filter((candidate) => !unreleased.has(candidateKey(candidate.rewardType, candidate.id)))
		.map(rank)
}

function allCandidatesFor(bannerType: BannerType): Candidate[] {
	const arcs = getAllArcsList().map((arc) => ({
		id: arc.id,
		name: arc.name,
		rarity: arc.rarity,
		rewardType: "arc" as const,
		imageSrc: `/arcs/${arc.imageSrc}`,
	}))
	if (bannerType === "arcsBanner") return arcs

	const characters = getAllCharactersList().map((character) => ({
		id: character.id,
		name: character.name,
		rarity: character.rarity,
		rewardType: "character" as const,
		imageSrc: `/characters/avatar/${character.imageSrc}`,
	}))
	const rewards = getAllRewardsList().map((reward) => ({
		id: reward.id,
		name: reward.name,
		rarity: reward.rarity,
		rewardType: reward.imageSrc.includes("cosmetics/")
			? ("cosmetic" as const)
			: ("item" as const),
		imageSrc: `/materials/${reward.imageSrc}`,
	}))
	const sRanks = bannerType === "permanentBanner" ? permanentRateupSet : characterRateUps
	const shownCharacters = characters.filter(
		(character) => character.rarity !== EnumRarity.Epic || sRanks.has(character.id)
	)
	const shownArcs = arcs.filter((arc) => arc.rarity !== EnumRarity.Epic)
	return withUniqueNames([...shownCharacters, ...shownArcs, ...rewards])
}

const TYPE_LABELS: Record<RewardType, string> = {
	character: "Character",
	arc: "Arc",
	item: "Item",
	cosmetic: "Cosmetic",
}

// Items are picked by name, so where two share one (the Clear Skies arc
// and outfit) each gets its type after it: "Clear Skies (Arc)".
function withUniqueNames(candidates: Candidate[]): Candidate[] {
	const counts = new Map<string, number>()
	for (const c of candidates) {
		const name = c.name.toLowerCase()
		counts.set(name, (counts.get(name) ?? 0) + 1)
	}
	return candidates.map((c) => {
		if ((counts.get(c.name.toLowerCase()) ?? 0) < 2) return c
		const label = c.imageSrc.includes("/outfits/")
			? "Outfit"
			: c.imageSrc.includes("/gliders/")
				? "Glider"
				: TYPE_LABELS[c.rewardType]
		return { ...c, name: `${c.name} (${label})` }
	})
}

export const newManualUid = () => `manual-${randomId()}`

// The time a pull logged "just now" is given, read when it's saved.
export const pulledNow = () => Date.now()

// "YYYY-MM-DDTHH:mm" in local time, as a datetime-local input wants it.
export function toLocalInput(time: number) {
	const date = new Date(time)
	const pad = (n: number) => String(n).padStart(2, "0")
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
