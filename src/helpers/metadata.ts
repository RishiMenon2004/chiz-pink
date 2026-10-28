import type { Metadata } from "next"

import { RoutesData } from "@/data/routes"

// Hardcoded rather than read from Vercel's env, so canonicals point here
// from every deployment - including the old vercel.app address, which
// still serves the app (see helpers/domainMigration.ts).
export const SITE_URL = "https://chiz.pink"
export const SITE_NAME = "Chiz.Pink"
export const SITE_DESCRIPTION =
	"Your favourite daily planner and inventory tracker :3"

// Share preview for pages without their own opengraph-image.
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
	// The route has an opengraph-image file. Setting images here would
	// override it, so they're left out and Next fills in the file's.
	hasOwnImage?: boolean
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
	hasOwnImage = false,
}: PageMetadataOptions): Metadata {
	// Spread in, not set to undefined: Next treats a present-but-undefined
	// `images` as "no image" and drops the file's too.
	const images = hasOwnImage ? {} : { images: [SITE_OG_IMAGE] }

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
			...images,
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			...images,
		},
	}
}

/** Metadata for a static route, from its `RoutesData` entry. */
export function buildRouteMetadata(path: keyof typeof RoutesData): Metadata {
	return buildMetadata({ title: RoutesData[path].head, path })
}
