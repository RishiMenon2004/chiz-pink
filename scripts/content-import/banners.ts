// Banner pools: links the game's pool code names (the "LingKe" in
// "Lottery_LingKe" / "ForkLottery_LingKe") to the site's characters and
// regenerates bannerPools.ts, which lets the pull tracker tell which banner an
// exported pull was made on.

import { characterBanners } from "@/data/activities/banners"

import {
	type LocalizedText,
	printList,
	readTable,
	sourceLabel,
	str,
	write,
	writeGenerated,
} from "./source"

// Only the arc pools have a table, but the limited board's pools use the same
// code names, so one row covers both.
type PoolRow = { ShowText1: LocalizedText }

const POOL_PREFIX = "ForkLottery_"

export async function importBannerPools() {
	const pools = await readTable<PoolRow>(["DataTable/Fork/DT_ForkLotteryPoolData.json"])

	const matched: [code: string, character: string][] = []
	const unmatched: string[] = []

	for (const [key, row] of pools.rows) {
		if (!key.startsWith(POOL_PREFIX)) continue

		const text = row.ShowText1
		const arcBannerName = (text.LocalizedString ?? text.SourceString).replaceAll("’", "'")
		// A rerun keeps its first run's pool, so any banner with the name will do.
		const banner = characterBanners.find((entry) => entry.arcBanner?.name === arcBannerName)

		if (banner?.rateupItem) matched.push([key.slice(POOL_PREFIX.length), banner.rateupItem])
		else unmatched.push(`${key} ("${arcBannerName}")`)
	}

	const file = "src/data/activities/bannerPools.ts"
	const outdated = writeGenerated(
		file,
		'The character whose banners each pool code name belongs to. An exported\npull\'s pool_id is "Lottery_<code>" on the limited board and\n"ForkLottery_<code>" on the arc board; reruns reuse the code.',
		`export const bannerPoolCharacters: Record<string, string> = {
${matched.map(([code, character]) => `\t${code}: ${str(character)},`).join("\n")}
}
`
	)

	console.log(`\nBanner pools (${sourceLabel}): ${matched.length} linked to a character`)
	if (unmatched.length > 0) {
		printList("Pools with no banner on the site", unmatched, (pool) => pool)
	}
	if (outdated) console.log(write ? `Wrote ${file}` : `${file} is out of date (run with --write)`)
}
