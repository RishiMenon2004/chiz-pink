import type { Metadata } from "next"

import type { MessageKey, Translate } from "@/types/messages"
import type { EnumRarity } from "@/data/items/item"
import { RoutesData, type RoutePath } from "@/data/routes"

import { getRarityName } from "./getRarityName"
import { LOCALES, localizePath, toLocale, type Locale } from "./locale"
import { getTranslator } from "./messages"

// Hardcoded rather than read from Vercel's env, so canonicals point here
// from every deployment - including the old vercel.app address, which
// still serves the app (see helpers/domainMigration.ts).
export const SITE_URL = "https://chiz.pink"
export const SITE_NAME = "Chiz.Pink"

// Share preview for pages without their own image. Its alt text is the
// site.ogImageAlt message.
export const SITE_OG_IMAGE_URL = "/layout/site-og.png"

/** og:locale wants language_TERRITORY: "en_US", "pt_BR". */
export function ogLocale(locale: Locale) {
	const tag: string = locale
	return tag === "en" ? "en_US" : tag.replace("-", "_")
}

/**
 * hreflang links: the same page in every language, plus x-default (the
 * unprefixed English URL, which the proxy sends to the visitor's own
 * language). Also used by the sitemap.
 */
export function languageAlternates(path: string, base = "") {
	return Object.fromEntries([
		...LOCALES.map((locale) => [locale, base + localizePath(path, locale)]),
		["x-default", base + path],
	])
}

/** t() for metadata functions, from the page's [lang] param. */
export function getMetadataTranslator(lang: string) {
	return getTranslator(toLocale(lang))
}

/** The site-wide share image, with its alt text in the page's language. */
export function siteOgImage(t: Translate) {
	return {
		url: SITE_OG_IMAGE_URL,
		width: 1200,
		height: 630,
		alt: t("site.ogImageAlt"),
	}
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
export function buildMetadata(
	options: PageMetadataOptions,
	t: Translate,
): Metadata {
	const {
		title,
		description = t("site.description"),
		path,
		image = siteOgImage(t),
	} = options
	const images = [{ width: 1200, height: 630, ...image }]

	// Pages under the root get the "| Chiz.Pink" template; the home page
	// doesn't, so its title is already the full one.
	const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`
	const url = localizePath(path, t.locale)

	return {
		title: path === "/" ? { absolute: title } : title,
		description,
		alternates: { canonical: url, languages: languageAlternates(path) },
		openGraph: {
			type: "website",
			locale: ogLocale(t.locale),
			alternateLocale: LOCALES.filter((l) => l !== t.locale).map(ogLocale),
			siteName: SITE_NAME,
			url,
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

/**
 * The rank name and whether English needs "an" before it ("an S-Rank",
 * "a B-Rank"). Descriptions have an introA and an introAn message for this;
 * other languages can translate both the same way.
 */
export function rankForIntro(rarity: EnumRarity) {
	const rank = getRarityName(rarity)
	return { rank, takesAn: /^[AS]/.test(rank) }
}

/** Metadata for a static route, with its text from routes.<id>. */
export async function buildRouteMetadata(
	path: RoutePath,
	lang: string,
): Promise<Metadata> {
	const t = await getMetadataTranslator(lang)
	const route: { id: string; hasDescription?: boolean } = RoutesData[path]

	return buildMetadata(
		{
			title: t(`routes.${RoutesData[path].id}.head`),
			description: route.hasDescription
				? t(`routes.${route.id}.description` as MessageKey)
				: undefined,
			path,
		},
		t,
	)
}
