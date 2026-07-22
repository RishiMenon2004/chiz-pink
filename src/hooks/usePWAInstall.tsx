"use client"

import { useCallback, useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export type PWAInstallPlatform =
	| "ios-safari"
	| "ios-other"
	| "macos-safari"
	| "firefox"
	| "samsung"
	| "other"

function detectPlatform(): PWAInstallPlatform {
	const ua = navigator.userAgent

	const isIOS =
		/iPad|iPhone|iPod/.test(ua) ||
		(/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)

	if (isIOS) {
		const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
		return isSafari ? "ios-safari" : "ios-other"
	}

	if (/SamsungBrowser/.test(ua)) return "samsung"
	if (/Firefox/.test(ua)) return "firefox"

	const isMac = /Macintosh/.test(ua)
	const isChromiumUA = /Chrome|Chromium|Edg|OPR/.test(ua)

	if (isMac && !isChromiumUA && /Safari/.test(ua)) return "macos-safari"

	return "other"
}

function detectStandalone() {
	const nav = navigator as Navigator & { standalone?: boolean }
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		nav.standalone === true
	)
}

export function usePWAInstall() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null)

	const [isStandalone, setIsStandalone] = useState(() =>
		typeof window === "undefined" ? false : detectStandalone()
	)

	const [platform] = useState<PWAInstallPlatform>(() =>
		typeof navigator === "undefined" ? "other" : detectPlatform()
	)

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault()
			setDeferredPrompt(e as BeforeInstallPromptEvent)
		}

		const handleAppInstalled = () => {
			setDeferredPrompt(null)
			setIsStandalone(true)
		}

		const displayModeQuery = window.matchMedia("(display-mode: standalone)")
		const handleDisplayModeChange = (e: MediaQueryListEvent) => {
			setIsStandalone(e.matches)
		}

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
		window.addEventListener("appinstalled", handleAppInstalled)
		displayModeQuery.addEventListener("change", handleDisplayModeChange)

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt
			)
			window.removeEventListener("appinstalled", handleAppInstalled)
			displayModeQuery.removeEventListener("change", handleDisplayModeChange)
		}
	}, [])

	const promptInstall = useCallback(async () => {
		if (!deferredPrompt) return

		await deferredPrompt.prompt()
		const { outcome } = await deferredPrompt.userChoice

		if (outcome === "accepted") setIsStandalone(true)
		setDeferredPrompt(null)
	}, [deferredPrompt])

	return {
		isStandalone,
		platform,
		canUseNativePrompt: deferredPrompt !== null,
		promptInstall,
	}
}
