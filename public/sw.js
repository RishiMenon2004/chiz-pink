const CACHE_VERSION = "v1"
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
]

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(SHELL_CACHE)
			.then((cache) => cache.addAll(APP_SHELL_URLS))
			.then(() => self.skipWaiting())
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

		return Response.error()
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
