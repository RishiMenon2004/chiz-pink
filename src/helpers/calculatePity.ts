import { MiracleBoxPull, ScarboroughFairPull, PullsRecord } from "@/types/pulls"
import { SettingsRecord } from "@/types/settings"
import { EventData } from "@/data/activities/events"
import { arcBanners, permanentBanner } from "@/data/activities/banners"

export function isScarboroughPull(
	pull: MiracleBoxPull | ScarboroughFairPull
): pull is ScarboroughFairPull {
	return Boolean(pull && "diceRoll" in pull && typeof pull.diceRoll === "number")
}

export function isArcRateUp(
	pull: MiracleBoxPull | ScarboroughFairPull
): boolean {
	const banner = arcBanners.find((b) => {
		return (
			b.getStartDate() < pull.timestamp &&
			b.getEndDate() > pull.timestamp
		)
	})
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
			const banner = gachaBanners.find((b) => {
				return (
					b.getStartDate(server) < pull.timestamp &&
					b.getEndDate(server) > pull.timestamp
				)
			})
			return banner?.rateupItem === pull.rewardId
		}
		case "permanentBanner":
			return permanentBanner.rateupItems.includes(pull.rewardId)
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
				lastRateUpGroupPity = groupPity
				lastRateUpGroupIndex = groupIndex
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
