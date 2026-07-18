"use client"

import { useEffect } from "react"

export function useServiceWorker() {
	useEffect(() => {
		if (typeof window === "undefined") return
		if (!("serviceWorker" in navigator)) return

		// Service workers must stay out of dev: Next/Turbopack reuse chunk
		// URLs across recompiles in dev (they're only content-hashed in
		// production), so cache-first caching of /_next/static/* here would
		// serve stale JS after every HMR update.
		if (process.env.NODE_ENV !== "production") return

		navigator.serviceWorker.register("/sw.js").catch((err) => {
			console.error("Service worker registration failed:", err)
		})
	}, [])
}
