// Languages the site is available in. English is the default and is served
// without a prefix (/planner); every other language lives under its own
// prefix (/pt-BR/planner). src/proxy.ts maps unprefixed URLs onto the
// app/[lang] routes. Add a locale here once its messages file exists.
//
// No imports: the proxy runs separately from the app and pulls this in.
export const LOCALES = ["en"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

// Remembers the language picked in the switcher. Read by the proxy, so it
// takes priority over the browser's language.
export const LOCALE_COOKIE = "NEXT_LOCALE"

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value)
}

/** A [lang] route param as a Locale, or the default for anything unknown. */
export function toLocale(value: string): Locale {
	return isLocale(value) ? value : DEFAULT_LOCALE
}

/** Splits "/pt-BR/planner" into `pt-BR` and "/planner". Unprefixed paths get a null locale. */
export function splitLocalePath(pathname: string): {
	locale: Locale | null
	path: string
} {
	const segment = pathname.split("/")[1] ?? ""
	if (!isLocale(segment)) return { locale: null, path: pathname }

	return { locale: segment, path: pathname.slice(segment.length + 1) || "/" }
}

/**
 * Prefixes an internal path with a locale: "/planner" -> "/pt-BR/planner".
 * The default locale stays unprefixed, and anything that isn't a root-relative
 * path (external URLs, "#hash", "?query") is returned unchanged.
 */
export function localizePath(path: string, locale: Locale): string {
	if (locale === DEFAULT_LOCALE || !path.startsWith("/")) return path
	if (path.startsWith(`/${locale}/`) || path === `/${locale}`) return path

	return path === "/" ? `/${locale}` : `/${locale}${path}`
}

/**
 * Picks the best supported locale from an Accept-Language header, e.g.
 * "pt-BR,pt;q=0.9,en;q=0.8". Exact tags win, then a shared base language
 * ("pt" matches "pt-BR"). Null when nothing matches.
 */
export function matchLocale(acceptLanguage: string | null): Locale | null {
	if (!acceptLanguage) return null

	const tags = acceptLanguage
		.split(",")
		.map((part) => {
			const [tag, ...params] = part.trim().split(";")
			const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
			return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) : 1 }
		})
		.filter(({ tag, q }) => tag && q > 0)
		.sort((a, b) => b.q - a.q)

	for (const { tag } of tags) {
		const exact = LOCALES.find((l) => l.toLowerCase() === tag)
		if (exact) return exact

		const base = tag.split("-")[0]
		const partial = LOCALES.find((l) => l.toLowerCase().split("-")[0] === base)
		if (partial) return partial
	}

	return null
}
