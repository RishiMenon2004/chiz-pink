import type { BannerType, MiracleBoxPull, ScarboroughFairPull } from "@/types/pulls"
import type { GameServer } from "@/types/server"

import { permanentBanner } from "@/data/activities/banners"

import {
	findPullPoolBanner,
	getResolvedGachaBanners,
	isPullInBannerWindow,
	staticArcBanners,
	type PullBanner,
} from "@/helpers"

export type Pull = MiracleBoxPull | ScarboroughFairPull

// A stretch of consecutive pulls from one banner.
export type Run = {
	key: string
	banners: string[]
	themeColor: string | null
	labelled: boolean
}

// ending: the run ends here, rather than carrying on to the next page.
export type LabelRow = { type: "label"; run: Run; ending: boolean }

export type ListRow = { type: "pull"; pull: Pull } | LabelRow

export type Group = { run: Run; pulls: Pull[]; label?: LabelRow }

type GachaBannersArg = Parameters<typeof getResolvedGachaBanners>[0]

// Maps each pull uid to both its time-window banners and its recorded pool banner.
export function buildPullBannerMaps(
	pulls: Pull[],
	selectedBanner: BannerType,
	gachaBanners: GachaBannersArg,
	server: GameServer
) {
	const pullBannerMap = new Map<string, string[]>()
	const ownBannerMap = new Map<string, PullBanner>()
	const limitedBanners =
		selectedBanner === "limitedBanner"
			? getResolvedGachaBanners(gachaBanners, server)
			: []

	pulls.forEach((pull) => {
		if (selectedBanner === "permanentBanner") {
			pullBannerMap.set(pull.uid, [permanentBanner.name])
			return
		}

		const banners =
			selectedBanner === "arcsBanner" ? staticArcBanners : limitedBanners
		pullBannerMap.set(
			pull.uid,
			banners.filter((b) => isPullInBannerWindow(b, pull)).map((b) => b.name)
		)

		const banner = findPullPoolBanner(selectedBanner, pull, limitedBanners)
		if (banner) ownBannerMap.set(pull.uid, banner)
	})

	// Inherit pool banner across pulls sharing the exact same multi-roll timestamp.
	const ownByTimestamp = new Map<number, PullBanner>()
	pulls.forEach((pull) => {
		const banner = ownBannerMap.get(pull.uid)
		if (banner && !ownByTimestamp.has(pull.timestamp)) {
			ownByTimestamp.set(pull.timestamp, banner)
		}
	})
	pulls.forEach((pull) => {
		if (ownBannerMap.has(pull.uid)) return
		const banner = ownByTimestamp.get(pull.timestamp)
		if (banner) ownBannerMap.set(pull.uid, banner)
	})

	return { pullBannerMap, ownBannerMap }
}

export function resolveRun(
	pull: Pull,
	ownBannerMap: Map<string, PullBanner>,
	pullBannerMap: Map<string, string[]>
): Run {
	const own = ownBannerMap.get(pull.uid)
	if (own) {
		return {
			key: `own:${own.name}`,
			banners: [own.name],
			themeColor: own.themeColor,
			labelled: true,
		}
	}
	const banners = pullBannerMap.get(pull.uid) ?? []
	return {
		key: `date:${banners.join("/")}`,
		banners,
		themeColor: null,
		labelled: false,
	}
}

// Arc pages hold one ten-pull group each plus closing labels for runs on the page.
export function buildArcPages(
	visiblePulls: Pull[],
	pullsPerPage: number,
	runOf: (pull: Pull) => Run
): ListRow[][] {
	const sameRun = (a: Pull, b: Pull) => runOf(a).key === runOf(b).key
	const pages: ListRow[][] = []
	let currentPage: ListRow[] = []
	let pullCountInPage = 0

	for (let i = 0; i < visiblePulls.length; i++) {
		const pull = visiblePulls[i]
		const prev = visiblePulls[i - 1]

		if (prev && !sameRun(prev, pull)) {
			currentPage.push({ type: "label", run: runOf(prev), ending: true })
		} else if (prev && pullCountInPage === pullsPerPage) {
			currentPage.push({ type: "label", run: runOf(prev), ending: false })
		}

		if (pullCountInPage === pullsPerPage) {
			pages.push(currentPage)
			currentPage = []
			pullCountInPage = 0
		}

		currentPage.push({ type: "pull", pull })
		pullCountInPage++
	}

	const last = visiblePulls.at(-1)
	if (last) currentPage.push({ type: "label", run: runOf(last), ending: true })

	if (currentPage.length > 0) {
		pages.push(currentPage)
	}

	return pages
}

// Non-arc banners pack up to rowsPerPage rows (pulls + labels) per page.
export function buildRegularPages(
	visiblePulls: Pull[],
	rowsPerPage: number,
	isPermanent: boolean,
	runOf: (pull: Pull) => Run
): ListRow[][] {
	const pages: ListRow[][] = []
	if (isPermanent) {
		for (let i = 0; i < visiblePulls.length; i += rowsPerPage) {
			pages.push(
				visiblePulls
					.slice(i, i + rowsPerPage)
					.map((pull): ListRow => ({ type: "pull", pull }))
			)
		}
		return pages
	}

	const sameRun = (a: Pull, b: Pull) => runOf(a).key === runOf(b).key
	let currentPage: ListRow[] = []
	const closePage = () => {
		if (currentPage.length > 0) pages.push(currentPage)
		currentPage = []
	}
	const addRow = (row: ListRow) => {
		if (currentPage.length >= rowsPerPage) closePage()
		currentPage.push(row)
	}

	visiblePulls.forEach((pull, i) => {
		const prev = visiblePulls[i - 1]
		if (prev && !sameRun(prev, pull)) {
			addRow({ type: "label", run: runOf(prev), ending: true })
		}

		if (currentPage.length >= rowsPerPage - 1) {
			const lastRow = currentPage.at(-1)
			if (lastRow?.type === "pull" && sameRun(lastRow.pull, pull)) {
				currentPage.push({ type: "label", run: runOf(pull), ending: false })
			}
			closePage()
		}

		addRow({ type: "pull", pull })
	})

	const last = visiblePulls.at(-1)
	if (last) addRow({ type: "label", run: runOf(last), ending: true })
	closePage()

	return pages
}

// Gathers a single page's flat rows into one box per run, each with its label.
export function groupPageRows(
	rows: ListRow[],
	runOf: (pull: Pull) => Run
): Group[] {
	const sameRun = (a: Pull, b: Pull) => runOf(a).key === runOf(b).key
	const groups: Group[] = []

	for (const row of rows) {
		const last = groups.at(-1)
		const open = last && !last.label ? last : undefined

		if (row.type === "label") {
			if (open) open.label = row
		} else if (open && sameRun(open.pulls[0], row.pull)) {
			open.pulls.push(row.pull)
		} else {
			groups.push({ run: runOf(row.pull), pulls: [row.pull] })
		}
	}

	return groups
}
