// Turbopack caches each chunk's load promise, including a rejected one, so
// once a chunk fails to load (a network blip, an iPad resuming from the
// background) every later navigation needing it fails or hangs until a full
// reload. Error boundaries use these to do that reload for the user.

const RELOAD_KEY = "chiz-pink-chunk-reload"

// Don't reload again within this window, so a real outage or a missing chunk
// shows the error page instead of reloading forever.
const RELOAD_COOLDOWN_MS = 10_000

export function isChunkLoadError(error: Error) {
	return (
		error.name === "ChunkLoadError" ||
		/Failed to load chunk|Loading chunk .+ failed|dynamically imported module|Importing a module script failed/i.test(
			error.message
		)
	)
}

// Reloads the page unless it already did so moments ago. Returns whether it
// reloaded.
export function reloadAfterChunkError() {
	try {
		const last = Number(sessionStorage.getItem(RELOAD_KEY))
		if (last && Date.now() - last < RELOAD_COOLDOWN_MS) return false
		sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
	} catch {
		// sessionStorage unavailable: still reload, the browser's own
		// reload is the only way to clear the cached failure.
	}
	window.location.reload()
	return true
}
