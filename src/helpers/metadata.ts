import type { Metadata } from "next"

import { RoutesData } from "@/data/routes"

// Hardcoded rather than read from Vercel's env, so canonicals point here
// from every deployment - including the old vercel.app address, which
// still serves the app (see helpers/domainMigration.ts).
export const SITE_URL = "https://chiz.pink"
export const SITE_NAME = "Chiz.Pink"
export const SITE_DESCRIPTION =
	"Your favourite daily planner and inventory tracker :3"

type PageMetadataOptions = {
	title: string
	description?: string
	// Path from the site root, e.g. "/characters/akane".
	path: string
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
}: PageMetadataOptions): Metadata {
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
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
		},
	}
}

/** Metadata for a static route, from its `RoutesData` entry. */
export function buildRouteMetadata(path: keyof typeof RoutesData): Metadata {
	return buildMetadata({ title: RoutesData[path].head, path })
}
