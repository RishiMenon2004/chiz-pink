// data-splash on <html> picks the splash view before paint, from a localStorage copy of the last version seen.

export const SPLASH_ATTRIBUTE = "data-splash"
export const SPLASH_MARKER_KEY = "splashSeenVersion"

export type SplashState = "welcome" | "update" | "none"

export function setSplashState(state: SplashState) {
	document.documentElement.setAttribute(SPLASH_ATTRIBUTE, state)
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
