import { MiracleBoxPull, ScarboroughFairPull, PullsRecord } from "@/types/pulls"
import { SettingsRecord } from "@/types/settings"
import { EventData } from "@/data/activities/events"
import {
	findRateUpBanner,
	getResolvedGachaBanners,
	isPullInBannerWindow,
	staticArcBanners,
} from "./calculatePity"

/**
 * Returns the theme color of the banner corresponding to a pull.
 */
export function getBannerThemeColor(
	pull: MiracleBoxPull | ScarboroughFairPull,
	selectedBanner: keyof PullsRecord,
	gachaBanners: EventData[],
	server: SettingsRecord["userdata"]["server"]
): string {
	if (selectedBanner === "permanentBanner") {
		return "#006fe2"
	}

	if (selectedBanner === "arcsBanner") {
		const arcBanner = staticArcBanners.find((b) => {
			return (
				isPullInBannerWindow(b, pull) ||
				b.rateupItem === pull.rewardId
			)
		}) as
			| (typeof staticArcBanners[number] & { themeColor?: string })
			| undefined

		if (arcBanner?.themeColor) {
			return arcBanner.themeColor
		}
	}

	const banners = getResolvedGachaBanners(gachaBanners, server)
	const banner =
		findRateUpBanner(banners, pull) ??
		banners.find((b) => isPullInBannerWindow(b, pull))

	return banner?.themeColor ?? "var(--pink)"
}
