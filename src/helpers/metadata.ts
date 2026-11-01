import type { Metadata } from "next"

import type { EnumRarity } from "@/data/items/item"
import { RoutesData } from "@/data/routes"

import { getRarityName } from "./getRarityName"

// Hardcoded rather than read from Vercel's env, so canonicals point here
// from every deployment - including the old vercel.app address, which
// still serves the app (see helpers/domainMigration.ts).
export const SITE_URL = "https://chiz.pink"
export const SITE_NAME = "Chiz.Pink"
export const SITE_DESCRIPTION =
	"Your pinkest companion, ascension planner and pull tracker for NTE :3"

// Share preview for pages without their own image.
export const SITE_OG_IMAGE = {
	url: "/layout/site-og.png",
	width: 1200,
	height: 630,
	alt: "Chiz.Pink: Neverness to Everness ascension planner and pull tracker",
}

type PageMetadataOptions = {
	title: string
	description?: string
	// Path from the site root, e.g. "/characters/akane".
	path: string
	// Share preview (1200x630). Pages with an opengraph-image file pass its
	// route here: these tags override the file's, which can't have a
	// per-page alt.
	image?: { url: string; alt: string }
}

/**
 * Next merges `openGraph` and `twitter` shallowly (a page's object replaces
 * the layout's whole object), so every page builds the full set here rather
 * than relying on the root layout's.
 */
export function buildMetadata({
	title,
	description = SITE_DESCRIPTION,
	path,
	image = SITE_OG_IMAGE,
}: PageMetadataOptions): Metadata {
	const images = [{ width: 1200, height: 630, ...image }]

	// Pages under the root get the "| Chiz.Pink" template; the home page
	// doesn't, so its title is already the full one.
	const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`

	return {
		title: path === "/" ? { absolute: title } : title,
		description,
		alternates: { canonical: path },
		openGraph: {
			type: "website",
			locale: "en_US",
			siteName: SITE_NAME,
			url: path,
			title: fullTitle,
			description,
			images,
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			images,
		},
	}
}

/** "an S-Rank", "a B-Rank": for descriptions. */
export function rankWithArticle(rarity: EnumRarity) {
	const rank = getRarityName(rarity)
	return `${/^[AS]/.test(rank) ? "an" : "a"} ${rank}`
}

/** Metadata for a static route, from its `RoutesData` entry. */
export function buildRouteMetadata(path: keyof typeof RoutesData): Metadata {
	const { head, description } = RoutesData[path]
	return buildMetadata({ title: head, description, path })
}
