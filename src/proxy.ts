import { NextResponse, type NextRequest } from "next/server"

import {
	DEFAULT_LOCALE,
	isLocale,
	LOCALE_COOKIE,
	localizePath,
	matchLocale,
	splitLocalePath,
	type Locale,
} from "@/helpers/locale"

// Every page lives under app/[lang], but English keeps its old, unprefixed
// URLs (/planner), so links, bookmarks and installed PWAs keep working. This
// maps those URLs onto the [lang] routes; the pages themselves stay static.
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl
	const { locale, path } = splitLocalePath(pathname)

	// "/en/planner" -> "/planner": English only has the one address.
	if (locale === DEFAULT_LOCALE) {
		const url = request.nextUrl.clone()
		url.pathname = path
		return NextResponse.redirect(url)
	}

	// Already prefixed with another language.
	if (locale) return NextResponse.next()

	const preferred = preferredLocale(request)
	if (preferred !== DEFAULT_LOCALE) {
		const url = request.nextUrl.clone()
		url.pathname = localizePath(pathname, preferred)
		return NextResponse.redirect(url)
	}

	const url = request.nextUrl.clone()
	url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`
	return NextResponse.rewrite(url)
}

// A language picked in the switcher wins over the browser's language.
function preferredLocale(request: NextRequest): Locale {
	const saved = request.cookies.get(LOCALE_COOKIE)?.value
	if (saved && isLocale(saved)) return saved

	return matchLocale(request.headers.get("accept-language")) ?? DEFAULT_LOCALE
}

export const config = {
	matcher: [
		// Skip API routes, Next/Vercel internals, and anything with a file
		// extension (public assets, sw.js, sitemap.xml, robots.txt, the
		// manifest), none of which live under [lang].
		"/((?!api/|_next/|_vercel/|__nextjs|.*\\..*).*)",
	],
}
