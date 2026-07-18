const CACHE_VERSION = "v5"
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
	"/materials/placeholder.png",
	"/arcs/placeholder.png",
	"/characters/avatar/placeholder.png",
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
	return (
		url.pathname.startsWith("/_next/static/") ||
		url.pathname.startsWith("/_next/image")
	)
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

// Stale-while-revalidate: serve cached copy immediately (if present) while
// updating the cache in the background. Good fit for game art/icons that
// rarely change but aren't hash-versioned.
async function staleWhileRevalidate(request, cacheName) {
	const cache = await caches.open(cacheName)
	const cached = await cache.match(request)

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
			"<!DOCTYPE html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head><body style=\"background:#1d1d1d;color:#fff;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;text-align:center;padding:2rem;box-sizing:border-box;\"><p>You're offline, and this page hasn't been saved for offline use yet.</p></body></html>",
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

	if (request.mode === "navigate") {
		event.respondWith(networkFirstNavigation(request))
		return
	}

	if (isStaticAsset(url)) {
		event.respondWith(cacheFirst(request, SHELL_CACHE))
		return
	}

	if (isPublicImage(url)) {
		event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
		return
	}
})
