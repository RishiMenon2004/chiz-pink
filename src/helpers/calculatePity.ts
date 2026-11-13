import { MiracleBoxPull, ScarboroughFairPull, PullsRecord } from "@/types/pulls"
import { SettingsRecord } from "@/types/settings"
import { EventData } from "@/data/activities/events"
import { arcBanners, permanentBanner } from "@/data/activities/banners"
import { bannerPoolCharacters } from "@/data/activities/bannerPools"
import { EnumRarity } from "@/data/items"

export const staticArcBanners = arcBanners.map((b) => ({
	name: b.name,
	rateupItem: b.rateupItem,
	character: b.character,
	themeColor: (b as typeof b & { themeColor?: string }).themeColor,
	startDate: b.getStartDate(),
	endDate: b.getEndDate(),
}))

export type ResolvedGachaBanner = {
	name: string
	rateupItem?: string
	themeColor?: string
	startDate: number
	endDate: number
}

const resolvedGachaBannersCache = new Map<string, ResolvedGachaBanner[]>()

export function getResolvedGachaBanners(
	gachaBanners: EventData[],
	server: SettingsRecord["userdata"]["server"]
): ResolvedGachaBanner[] {
	let list = resolvedGachaBannersCache.get(server)
	if (!list) {
		list = gachaBanners.map((b) => ({
			name: b.name,
			rateupItem: b.rateupItem,
			themeColor: b.themeColor,
			startDate: b.getStartDate(server),
			endDate: b.getEndDate(server),
		}))
		resolvedGachaBannersCache.set(server, list)
	}
	return list
}

export const permanentRateupSet = new Set<string>(permanentBanner.rateupItems)

// Servers can reopen before the official 03:00 UTC start, so a banner's pulls
// start right after the previous phase ends (21:59:59 UTC).
const PULL_START_GRACE_MS = 5 * 60 * 60 * 1000

export function isPullInBannerWindow(
	banner: { startDate: number; endDate: number },
	pull: MiracleBoxPull | ScarboroughFairPull
): boolean {
	return (
		banner.startDate - PULL_START_GRACE_MS <= pull.timestamp &&
		banner.endDate >= pull.timestamp
	)
}

// Of several runs of a banner, the one live at the pull, else the nearest.
function closestBanner<T extends { startDate: number; endDate: number }>(
	banners: T[],
	pull: MiracleBoxPull | ScarboroughFairPull,
	matches: (banner: T) => boolean
): T | undefined {
	let closest: T | undefined
	let closestDistance = Infinity

	for (const b of banners) {
		if (!matches(b)) continue
		if (isPullInBannerWindow(b, pull)) return b

		const distance = Math.abs(b.startDate - pull.timestamp)
		if (distance < closestDistance) {
			closest = b
			closestDistance = distance
		}
	}

	return closest
}

// Rate-ups only drop from their own banner, so any match counts. Prefers the
// banner live at the pull, then the nearest one (for reruns).
export function findRateUpBanner<
	T extends { rateupItem?: string; startDate: number; endDate: number },
>(banners: T[], pull: MiracleBoxPull | ScarboroughFairPull): T | undefined {
	return closestBanner(banners, pull, (b) => b.rateupItem === pull.rewardId)
}

// "Lottery_LingKe" (limited board) and "ForkLottery_LingKe" (arc board) are
// both the pool of the character filed under "LingKe".
const POOL_ID_PATTERN = /^(?:Fork)?Lottery_(.+)$/

// The banner a pull was made on, going by the pool the exporter recorded for
// it. Unlike a date, that tells banners running side by side apart. A rerun
// shares its first run's pool, so the date still picks between runs.
// `characterOf` names the character a banner belongs to. Undefined for pulls
// without a pool (older imports, the permanent board) or one the site
// doesn't know yet - callers fall back to the pull's date.
export function findPoolBanner<T extends { startDate: number; endDate: number }>(
	banners: T[],
	pull: MiracleBoxPull | ScarboroughFairPull,
	characterOf: (banner: T) => string | undefined
): T | undefined {
	const code = pull.poolId?.match(POOL_ID_PATTERN)?.[1]
	const character = code ? bannerPoolCharacters[code] : undefined
	if (!character) return undefined

	return closestBanner(banners, pull, (b) => characterOf(b) === character)
}

export function isScarboroughPull(
	pull: MiracleBoxPull | ScarboroughFairPull
): pull is ScarboroughFairPull {
	return Boolean(pull && "diceRoll" in pull && typeof pull.diceRoll === "number")
}

export function isArcRateUp(
	pull: MiracleBoxPull | ScarboroughFairPull
): boolean {
	return findRateUpBanner(staticArcBanners, pull) !== undefined
}

export const isRateUp = (
	selectedBanner: keyof PullsRecord,
	gachaBanners: EventData[],
	pull: MiracleBoxPull | ScarboroughFairPull,
	server: SettingsRecord["userdata"]["server"]
): boolean => {
	switch (selectedBanner) {
		case "arcsBanner":
			return isArcRateUp(pull)
		case "limitedBanner":
			return (
				findRateUpBanner(
					getResolvedGachaBanners(gachaBanners, server),
					pull
				) !== undefined
			)
		case "permanentBanner":
			return permanentRateupSet.has(pull.rewardId)
	}
}

/**
 * Calculates pity for Arc Miracle Box pulls.
 * Pity is tracked in 10-pull groups. Single rate-up items retain the group pity,
 * while multiple rate-up items in the same group give 0 pity to newer rate-ups onward.
 */
// Tallies pulls that weren't logged: wherever a pull's pity was set by
// hand above the pity counted for it, the difference.
type UnloggedTally = { count: number }

export function calculateArcBannerPity(
	pulls: (MiracleBoxPull | ScarboroughFairPull)[],
	pullsPerPage: number = 10,
	unlogged?: UnloggedTally
): Map<string, number> {
	const pityMap = new Map<string, number>()
	let lastRateUpGroupIndex = 0
	let groupIndex = 0
	let lastRateUpGroupPity = 0
	let rateUpInGroupCount = 0

	for (let i = pulls.length - 1; i >= 0; i--) {
		const pull = pulls[i]
		const pullGroupIndex = Math.ceil((pulls.length - i) / pullsPerPage)

		// When entering a new group
		if (pullGroupIndex !== groupIndex) {
			groupIndex = pullGroupIndex
			rateUpInGroupCount = 0
		}

		if (isArcRateUp(pull) && pull.pity !== undefined) {
			// A rate-up with its pity set by hand: it shows that, and pity
			// starts again from the next group.
			if (unlogged) {
				const counted = (groupIndex - lastRateUpGroupIndex) * 10
				unlogged.count += Math.max(0, pull.pity - counted)
			}
			pityMap.set(pull.uid, pull.pity)
			rateUpInGroupCount++
			lastRateUpGroupIndex = groupIndex
			lastRateUpGroupPity = 0
			continue
		}

		if (isArcRateUp(pull)) {
			rateUpInGroupCount++
			if (rateUpInGroupCount === 1) {
				// Rate-up shows the group pity it was pulled at
				const groupPity = (groupIndex - lastRateUpGroupIndex) * 10
				pityMap.set(pull.uid, groupPity)
				lastRateUpGroupIndex = groupIndex

				let hasSRankAfter = false
				for (let j = i - 1; j >= 0; j--) {
					const nextPull = pulls[j]
					const nextGroupIndex = Math.ceil(
						(pulls.length - j) / pullsPerPage
					)
					if (nextGroupIndex !== groupIndex) break
					if (
						nextPull.rank === EnumRarity.Epic ||
						isArcRateUp(nextPull)
					) {
						hasSRankAfter = true
						break
					}
				}

				lastRateUpGroupPity = hasSRankAfter ? 0 : groupPity
			} else {
				// Subsequent rate-up items in the same group show 0 pity
				pityMap.set(pull.uid, 0)
				lastRateUpGroupPity = 0
			}
			continue
		}

		let groupPity: number
		if (groupIndex === lastRateUpGroupIndex) {
			// keep same pity as rate-up for pulls after the rate-up pull
			groupPity = lastRateUpGroupPity
		} else if (groupIndex === lastRateUpGroupIndex + 1) {
			// reset pity after rate-up pull
			groupPity = 10
		} else {
			// count up normally from 0 from the last rate-up pull
			groupPity = (groupIndex - lastRateUpGroupIndex) * 10
		}
		// Arc pity is by ten-pull group, so a pity set by hand only changes
		// what this pull shows.
		if (pull.pity !== undefined) {
			if (unlogged) unlogged.count += Math.max(0, pull.pity - groupPity)
			groupPity = pull.pity
		}
		pityMap.set(pull.uid, groupPity)
	}

	return pityMap
}

/**
 * Calculates pity for character banners (Limited Character and Permanent).
 * Counts up sequentially from 1, skipping non-dice rolls for Scarborough Fair.
 */
export function calculateCharacterBannerPity(
	pulls: (MiracleBoxPull | ScarboroughFairPull)[],
	selectedBanner: "limitedBanner" | "permanentBanner",
	gachaBanners: EventData[],
	server: SettingsRecord["userdata"]["server"],
	unlogged?: UnloggedTally
): Map<string, number> {
	const pityMap = new Map<string, number>()
	let pityCounter = 1

	for (let i = pulls.length - 1; i >= 0; i--) {
		const pull = pulls[i]
		const isScarborough = isScarboroughPull(pull)

		// A pity set by hand takes over the count from this pull on.
		if (pull.pity !== undefined) {
			if (unlogged) unlogged.count += Math.max(0, pull.pity - pityCounter)
			pityCounter = pull.pity
		}

		if (isRateUp(selectedBanner, gachaBanners, pull, server)) {
			pityMap.set(pull.uid, pityCounter)
			pityCounter = 1
			continue
		}

		pityMap.set(pull.uid, pityCounter)

		const shouldSkip = isScarborough && pull.resultType !== "dice"
		if (!shouldSkip) {
			pityCounter++
		}
	}

	return pityMap
}

export function calculatePullNumberMap(
	pulls: (MiracleBoxPull | ScarboroughFairPull)[]
): Map<string, number> {
	const numberMap = new Map<string, number>()
	let counter = 0

	for (let i = pulls.length - 1; i >= 0; i--) {
		const pull = pulls[i]
		const isScarborough = isScarboroughPull(pull)
		const shouldSkip = isScarborough && pull.resultType !== "dice"

		if (shouldSkip) {
			numberMap.set(pull.uid, -1)
			continue
		}

		counter++
		numberMap.set(pull.uid, counter)
	}

	return numberMap
}

/**
 * High-level pity calculation function that delegates to Arc or Character pity calculation.
 */
export function calculatePityMap(
	pulls: (MiracleBoxPull | ScarboroughFairPull)[],
	selectedBanner: keyof PullsRecord,
	gachaBanners: EventData[],
	server: SettingsRecord["userdata"]["server"],
	pullsPerPage: number = 10,
	unlogged?: UnloggedTally
): Map<string, number> {
	if (selectedBanner === "arcsBanner") {
		return calculateArcBannerPity(pulls, pullsPerPage, unlogged)
	}
	return calculateCharacterBannerPity(
		pulls,
		selectedBanner,
		gachaBanners,
		server,
		unlogged
	)
}

// How many pulls weren't logged, going by the pities set by hand (see
// Pull.pity). Stats count these alongside the logged ones.
export function countUnloggedPulls(
	pulls: (MiracleBoxPull | ScarboroughFairPull)[],
	selectedBanner: keyof PullsRecord,
	gachaBanners: EventData[],
	server: SettingsRecord["userdata"]["server"]
): number {
	const unlogged = { count: 0 }
	calculatePityMap(pulls, selectedBanner, gachaBanners, server, 10, unlogged)
	return unlogged.count
}
