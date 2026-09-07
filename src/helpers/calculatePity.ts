import { MiracleBoxPull, ScarboroughFairPull, PullsRecord } from "@/types/pulls"
import { SettingsRecord } from "@/types/settings"
import { EventData } from "@/data/activities/events"
import { arcBanners, permanentBanner } from "@/data/activities/banners"
import { EnumRarity } from "@/data/items"

export const staticArcBanners = arcBanners.map((b) => ({
	name: b.name,
	rateupItem: b.rateupItem,
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

export function isScarboroughPull(
	pull: MiracleBoxPull | ScarboroughFairPull
): pull is ScarboroughFairPull {
	return Boolean(pull && "diceRoll" in pull && typeof pull.diceRoll === "number")
}

export function isArcRateUp(
	pull: MiracleBoxPull | ScarboroughFairPull
): boolean {
	const banner = staticArcBanners.find(
		(b) => b.startDate < pull.timestamp && b.endDate > pull.timestamp
	)
	return banner?.rateupItem === pull.rewardId
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
		case "limitedBanner": {
			const banners = getResolvedGachaBanners(gachaBanners, server)
			const banner = banners.find(
				(b) => b.startDate < pull.timestamp && b.endDate > pull.timestamp
			)
			return banner?.rateupItem === pull.rewardId
		}
		case "permanentBanner":
			return permanentRateupSet.has(pull.rewardId)
	}
}

/**
 * Calculates pity for Arc Miracle Box pulls.
 * Pity is tracked in 10-pull groups. Single rate-up items retain the group pity,
 * while multiple rate-up items in the same group give 0 pity to newer rate-ups onward.
 */
export function calculateArcBannerPity(
	pulls: (MiracleBoxPull | ScarboroughFairPull)[],
	pullsPerPage: number = 10
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
	server: SettingsRecord["userdata"]["server"]
): Map<string, number> {
	const pityMap = new Map<string, number>()
	let pityCounter = 1

	for (let i = pulls.length - 1; i >= 0; i--) {
		const pull = pulls[i]
		const isScarborough = isScarboroughPull(pull)

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

/**
 * High-level pity calculation function that delegates to Arc or Character pity calculation.
 */
export function calculatePityMap(
	pulls: (MiracleBoxPull | ScarboroughFairPull)[],
	selectedBanner: keyof PullsRecord,
	gachaBanners: EventData[],
	server: SettingsRecord["userdata"]["server"],
	pullsPerPage: number = 10
): Map<string, number> {
	if (selectedBanner === "arcsBanner") {
		return calculateArcBannerPity(pulls, pullsPerPage)
	}
	return calculateCharacterBannerPity(
		pulls,
		selectedBanner,
		gachaBanners,
		server
	)
}
