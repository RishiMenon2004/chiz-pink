import { MiracleBoxPull, ScarboroughFairPull, PullsRecord } from "@/types/pulls"
import { SettingsRecord } from "@/types/settings"
import { EventData } from "@/data/activities/events"
import {
	getResolvedGachaBanners,
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
				(b.startDate < pull.timestamp && b.endDate > pull.timestamp) ||
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
		banners.find(
			(b) => b.startDate < pull.timestamp && b.endDate > pull.timestamp
		) ?? banners.find((b) => b.rateupItem === pull.rewardId)

	return banner?.themeColor ?? "var(--pink)"
}
