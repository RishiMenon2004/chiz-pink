// data-splash on <html> picks the splash view before paint, from a localStorage copy of the last version seen.

export const SPLASH_ATTRIBUTE = "data-splash"
export const SPLASH_MARKER_KEY = "splashSeenVersion"

export type SplashState = "welcome" | "update" | "none"

const listeners = new Set<() => void>()
let confirmedVersion: string | null = null
let userInteracted = false

function applySplashState(state: SplashState) {
	document.documentElement.setAttribute(SPLASH_ATTRIBUTE, state)
	listeners.forEach((listener) => listener())
}

export function subscribeSplashState(listener: () => void) {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}

export function getSplashStateSnapshot(): SplashState | null {
	if (typeof document === "undefined") return null
	return document.documentElement.getAttribute(
		SPLASH_ATTRIBUTE
	) as SplashState | null
}

export function setSplashState(state: SplashState) {
	userInteracted = true
	applySplashState(state)
}

// Runs once per session after storage hydrates so remounting SplashCard on
// navigation (or hydrating after the user already closed it) never reopens it.
export function confirmSplashState(state: SplashState, version: string) {
	if (confirmedVersion === version) return
	confirmedVersion = version
	setSplashMarker(version)
	if (!userInteracted) applySplashState(state)
}

export function setSplashMarker(version: string) {
	try {
		localStorage.setItem(SPLASH_MARKER_KEY, version)
	} catch {
		// Storage blocked: the cards just fall back to the post-load check.
	}
}

// Runs in <head> before first paint.
export function splashInitScript(latestVersion: string) {
	return `try{var v=localStorage.getItem(${JSON.stringify(SPLASH_MARKER_KEY)});if(v)document.documentElement.setAttribute(${JSON.stringify(SPLASH_ATTRIBUTE)},v===${JSON.stringify(latestVersion)}?"none":"update")}catch(e){}`
}
