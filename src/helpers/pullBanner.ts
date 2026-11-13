import type { BannerType, Pull } from "@/types/pulls"

import { bannerPoolCharacters } from "@/data/activities/bannerPools"

import {
	findPoolBanner,
	findRateUpBanner,
	isPullInBannerWindow,
	staticArcBanners,
	type ResolvedGachaBanner,
} from "./calculatePity"
import { getCharacterBannerThemeColor } from "./bannerStatus"

export type PullBanner = { name: string; themeColor: string | null }

// Pool code name by character, the reverse of bannerPoolCharacters.
const poolCodeByCharacter = new Map(
	Object.entries(bannerPoolCharacters).map(([code, character]) => [character, code])
)

// The pool_id the exporter would have recorded for a pull on `banner`, so a
// manual pull is placed on its banner the same way an imported one is.
// Undefined when the banner's pool isn't known yet; the pull's date is
// used instead then.
export function poolIdForBanner(
	bannerType: BannerType,
	banner: { rateupItem?: string; character?: string } | undefined
): string | undefined {
	if (bannerType === "permanentBanner") return "Lottery_Permanent"
	if (!banner) return undefined

	const character = bannerType === "arcsBanner" ? banner.character : banner.rateupItem
	const code = character ? poolCodeByCharacter.get(character) : undefined
	if (!code) return undefined
	return bannerType === "arcsBanner" ? `ForkLottery_${code}` : `Lottery_${code}`
}

// The banner a pull was made on, going by the pool the exporter recorded.
// Undefined for the permanent board and for pulls without a known pool.
// `limitedBanners` is getResolvedGachaBanners() for the player's server.
export function findPullPoolBanner(
	bannerType: BannerType,
	pull: Pull,
	limitedBanners: ResolvedGachaBanner[]
): PullBanner | undefined {
	if (bannerType === "arcsBanner") {
		const banner = findPoolBanner(staticArcBanners, pull, (b) => b.character)
		if (!banner) return undefined
		return {
			name: banner.name,
			themeColor: banner.character
				? getCharacterBannerThemeColor(banner.character)
				: null,
		}
	}

	if (bannerType === "limitedBanner") {
		const banner = findPoolBanner(limitedBanners, pull, (b) => b.rateupItem)
		if (!banner) return undefined
		return { name: banner.name, themeColor: banner.themeColor ?? null }
	}

	return undefined
}

// The pool's banner where the exporter recorded one. Otherwise a rate-up's
// own banner, then the first banner running when the pull was made: a guess
// while two ran side by side. Undefined when no banner was running.
export function findPullBanner(
	bannerType: BannerType,
	pull: Pull,
	limitedBanners: ResolvedGachaBanner[]
): PullBanner | undefined {
	const pooled = findPullPoolBanner(bannerType, pull, limitedBanners)
	if (pooled) return pooled

	const banners: (ResolvedGachaBanner & { character?: string })[] =
		bannerType === "arcsBanner"
			? staticArcBanners
			: bannerType === "limitedBanner"
				? limitedBanners
				: []

	const banner =
		findRateUpBanner(banners, pull) ??
		banners.find((b) => isPullInBannerWindow(b, pull))
	if (!banner) return undefined

	const themeColor =
		bannerType === "arcsBanner" && banner.character
			? getCharacterBannerThemeColor(banner.character)
			: (banner.themeColor ?? null)
	return { name: banner.name, themeColor }
}
