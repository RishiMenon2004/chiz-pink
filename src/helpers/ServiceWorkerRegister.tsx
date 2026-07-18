"use client"

import { useServiceWorker } from "@/hooks/useServiceWorker"

export function ServiceWorkerRegister() {
	useServiceWorker()
	return null
}
