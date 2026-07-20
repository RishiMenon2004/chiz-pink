const CACHE_VERSION = "v6"
const SHELL_CACHE = `chiz-pink-shell-${CACHE_VERSION}`
const RUNTIME_CACHE = `chiz-pink-runtime-${CACHE_VERSION}`
const CURRENT_CACHES = [SHELL_CACHE, RUNTIME_CACHE]

const OFFLINE_URL = "/offline"

// Core routes + fallback page. Dynamic routes (/characters/[id], /arcs/[id])
// are cached lazily as the user visits them via the navigate handler below.
const APP_SHELL_URLS = [
	"/",
	"/checklist",
	"/characters",
	"/arcs",
	"/inventory",
	"/settings",
	OFFLINE_URL,
	"/app_icon.png",
	"/favicon.png",

	//placeholders
	"/materials/placeholder.png",
	"/arcs/placeholder.png",
	"/characters/avatar/placeholder.png",

	//material borders
	"/materials/borders/epic.png",
	"/materials/borders/rare.png",
	"/materials/borders/uncommon.png",
	"/materials/borders/common.png",

	//character borders
	"/characters/avatar/borders/planner_border.png",
	"/characters/avatar/borders/planner_border_alt.png",
	"/characters/avatar/borders/planner_border_list.png",

	//icons
	"/icons/arc.png",
	"/icons/character.png",
	"/icons/craft.png",
	"/icons/drag_hr.png",
	"/icons/drag.png",
	"/icons/less.png",
	"/icons/pulltab.png",
	"/icons/search.png",
	"/icons/upgrade.png",
	"/icons/multi-mat.png",

	//button icons
	"/button_icons/add_sub.png",
	"/button_icons/check.png",
	"/button_icons/confirm_plan.png",
	"/button_icons/cross_white.png",
	"/button_icons/cross.png",
	"/button_icons/delete.png",
	"/button_icons/edit.png",
	"/button_icons/filter.png",
	"/button_icons/group.png",
	"/button_icons/hide_white.png",
	"/button_icons/hide.png",
	"/button_icons/minus.png",
	"/button_icons/plus.png",
	"/button_icons/reverse_sort.png",
	"/button_icons/show_white.png",
	"/button_icons/show.png",
	"/button_icons/sort.png",

	//elements
	"/icons/elements/anima.png",
	"/icons/elements/anima_white.png",
	"/icons/elements/chaos.png",
	"/icons/elements/chaos_white.png",
	"/icons/elements/cosmos.png",
	"/icons/elements/cosmos_white.png",
	"/icons/elements/incantation.png",
	"/icons/elements/incantation_white.png",
	"/icons/elements/lakshana.png",
	"/icons/elements/lakshana_white.png",
	"/icons/elements/psyche.png",
	"/icons/elements/psyche_white.png",

	//ranks
	"/icons/ranks/epic.png",
	"/icons/ranks/rare.png",
	"/icons/ranks/uncommon.png",

	//cursors
	"/cursors/default.png",
	"/cursors/down.png",
	"/cursors/dropdown.png",
	"/cursors/edit.png",
	"/cursors/filter.png",
	"/cursors/group.png",
	"/cursors/multi-mat.png",
	"/cursors/navigate.png",
	"/cursors/pointer.png",
	"/cursors/search.png",
	"/cursors/sort.png",
]

self.addEventListener("install", (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(SHELL_CACHE)

			// Cache the offline fallback first, on its own -- this is the last
			// resort every failed navigation falls back to, so it has to exist.
			try {
				await cache.add(OFFLINE_URL)
			} catch (err) {
				console.error("Failed to precache offline fallback:", err)
			}

			// Best-effort for the rest of the shell: cache.addAll() is
			// all-or-nothing, so one flaky/failing URL would otherwise wipe
			// out the entire precache, silently including the offline page
			// above. Cache each independently instead.
			await Promise.allSettled(
				APP_SHELL_URLS.filter((url) => url !== OFFLINE_URL).map((url) =>
					cache.add(url).catch((err) => {
						console.error(`Failed to precache ${url}:`, err)
					})
				)
			)

			await self.skipWaiting()
		})()
	)
})

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) =>
				Promise.all(
					cacheNames
						.filter((name) => !CURRENT_CACHES.includes(name))
						.map((name) => caches.delete(name))
				)
			)
			.then(() => self.clients.claim())
	)
})

function isStaticAsset(url) {
	return url.pathname.startsWith("/_next/static/")
}

function isOptimizedImage(url) {
	return url.pathname.startsWith("/_next/image")
}

// Recover the original /public path Next's image optimizer was asked to
// resize (e.g. "/_next/image?url=%2Fmaterials%2Ffoo.png&w=64&q=100" ->
// "/materials/foo.png"), so we can fall back to the raw file, which is
// kept warm by staleWhileRevalidate below.
function originalImagePath(url) {
	const raw = url.searchParams.get("url")
	if (!raw) return null
	try {
		const decoded = decodeURIComponent(raw)
		return decoded.startsWith("/") ? decoded : null
	} catch {
		return null
	}
}

// Each image category has its own placeholder -- pick the one matching the
// path that actually failed, rather than always falling back to the same
// one regardless of whether it was an arc, character, or material image.
function placeholderForPath(path) {
	if (path.startsWith("/characters/avatar/"))
		return "/characters/avatar/placeholder.png"
	if (path.startsWith("/arcs/")) return "/arcs/placeholder.png"
	if (path.startsWith("/materials/")) return "/materials/placeholder.png"
	return null
}

function isPublicImage(url) {
	return (
		url.pathname.startsWith("/arcs/") ||
		url.pathname.startsWith("/characters/") ||
		url.pathname.startsWith("/materials/") ||
		url.pathname.startsWith("/icons/") ||
		url.pathname.startsWith("/nav/") ||
		url.pathname.startsWith("/cursors/") ||
		url.pathname.startsWith("/button_icons/")
	)
}

// Cache-first: for immutable, hashed build assets. Safe to serve stale
// forever since a new build means a new URL.
async function cacheFirst(request, cacheName) {
	const cached = await caches.match(request)
	if (cached) return cached

	const response = await fetch(request)
	if (response.ok) {
		const cache = await caches.open(cacheName)
		cache.put(request, response.clone())
	}
	return response
}

// The Next.js image optimizer (/_next/image?url=...&w=...&q=...) isn't
// hash-versioned or precached, so treat it as best-effort: try the network,
// and if that fails (offline + never-cached size), fall back to whatever
// we already have cached for the *original* /public path (materials/,
// arcs/, characters/ etc. are kept warm by staleWhileRevalidate), then the
// generic placeholder, rather than letting the fetch rejection go unhandled.
async function optimizedImage(request, url, cacheName) {
	const cached = await caches.match(request)
	if (cached) return cached

	try {
		const response = await fetch(request)
		if (response.ok) {
			const cache = await caches.open(cacheName)
			cache.put(request, response.clone())
		}
		return response
	} catch {
		const originalPath = originalImagePath(url)
		if (originalPath) {
			const originalCached = await caches.match(originalPath)
			if (originalCached) return originalCached

			const placeholderPath = placeholderForPath(originalPath)
			if (placeholderPath) {
				const placeholder = await caches.match(placeholderPath)
				if (placeholder) return placeholder
			}
		}

		return new Response(null, { status: 504, statusText: "Offline" })
	}
}

// Stale-while-revalidate: serve cached copy immediately (if present) while
// updating the cache in the background. Good fit for game art/icons that
// rarely change but aren't hash-versioned.
//
// Looks up the cached copy via the global caches.match() rather than
// cache-scoped match(): the placeholder.png fallbacks these requests are
// often for (see ArcIcon/CharacterAvatar/MaterialIcon onError handlers)
// were precached into SHELL_CACHE at install time, not RUNTIME_CACHE, so a
// lookup scoped to just RUNTIME_CACHE would miss them and fall through to
// a network fetch that fails offline.
async function staleWhileRevalidate(request, cacheName) {
	const cache = await caches.open(cacheName)
	const cached = await caches.match(request)

	const networkFetch = fetch(request)
		.then((response) => {
			if (response.ok) {
				cache.put(request, response.clone())
			}
			return response
		})
		.catch(() => cached)

	return cached || networkFetch
}

// Network-first with offline fallback: for page navigations, so users
// always get fresh content when online, and a cached/offline page when not.
async function networkFirstNavigation(request) {
	const cache = await caches.open(RUNTIME_CACHE)

	try {
		const response = await fetch(request)
		if (response.ok) {
			cache.put(request, response.clone())
		}
		return response
	} catch {
		const cached =
			(await cache.match(request)) || (await caches.match(request))
		if (cached) return cached

		const offlineFallback = await caches.match(OFFLINE_URL)
		if (offlineFallback) return offlineFallback

		// Last resort: never hand the browser Response.error() here, since
		// browsers render a network-error Response as their own native
		// "this page couldn't load" screen instead of anything we control.
		// A real (if minimal) Response always renders our own content.
		return new Response(
			'<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="background:#1d1d1d;color:#fff;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;text-align:center;padding:2rem;box-sizing:border-box;"><p>You\'re offline, and this page hasn\'t been saved for offline use yet.</p></body></html>',
			{
				status: 200,
				headers: { "Content-Type": "text/html" },
			}
		)
	}
}

self.addEventListener("fetch", (event) => {
	const { request } = event
	const url = new URL(request.url)

	if (request.method !== "GET" || url.origin !== self.location.origin) {
		return
	}

	if (
		url.searchParams.has("_rsc") ||
		request.headers.get("RSC") === "1" ||
		url.pathname.startsWith("/_next/data/")
	) {
		return
	}

	if (isStaticAsset(url)) {
		event.respondWith(cacheFirst(request, SHELL_CACHE))
		return
	}

	if (isOptimizedImage(url)) {
		event.respondWith(optimizedImage(request, url, RUNTIME_CACHE))
		return
	}

	if (isPublicImage(url)) {
		event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
		return
	}

	if (request.mode === "navigate") {
		event.respondWith(networkFirstNavigation(request))
		return
	}
})
