"use client"

import { useEffect } from "react"

export function useServiceWorker() {
	useEffect(() => {
		if (typeof window === "undefined") return
		if (!("serviceWorker" in navigator)) return

		// Service workers must stay out of dev: Next/Turbopack reuse chunk
		// URLs across recompiles in dev (they're only content-hashed in
		// production), so cache-first caching of /_next/static/* here would
		// serve stale JS after every HMR update. Not registering isn't enough:
		// a worker left over from a local production run (`next start` on the
		// same origin) keeps controlling the page, and client navigations hang
		// waiting on modules the stale chunks don't contain. Remove it.
		if (process.env.NODE_ENV !== "production") {
			navigator.serviceWorker
				.getRegistrations()
				.then((registrations) =>
					Promise.all(registrations.map((r) => r.unregister()))
				)
				.then(() => caches.keys())
				.then((names) =>
					Promise.all(
						names
							.filter((name) => name.startsWith("chiz-pink-"))
							.map((name) => caches.delete(name))
					)
				)
				.catch((err) => {
					console.error("Service worker cleanup failed:", err)
				})
			return
		}

		navigator.serviceWorker.register("/sw.js").catch((err) => {
			console.error("Service worker registration failed:", err)
		})
	}, [])
}
