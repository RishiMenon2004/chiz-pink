import type { BackupData } from "@/types/settings"

// The app moved from the Vercel subdomain to chiz.pink. Browser storage is
// per-origin, so chiz.pink can't read what was saved on the old domain, and
// an iframe bridge doesn't work either (third-party iframes get partitioned,
// empty storage). Instead the old domain opens chiz.pink/migrate as a
// top-level popup and hands its data over with postMessage:
//
//   old domain                         chiz.pink/migrate (popup)
//   ---------------------------------  ---------------------------------
//   window.open(NEW_ORIGIN/migrate) -> (loads, waits for local storage)
//                                    <- { type: "ready" }
//   { type: "data", payload }       ->  imports (asks first if it already
//                                       has data)
//                                    <- { type: "done" } / { type: "error" }
//   marks itself migrated, redirects    closes itself
//
// Both sides check the other's exact origin, so no other site can send or
// receive the data.

export const OLD_ORIGIN = "https://chiz-pink.vercel.app"
export const NEW_ORIGIN = "https://chiz.pink"

export const MIGRATE_PATH = "/migrate"

// Set on the old domain once its data has been handed over, so later
// visits redirect straight away instead of offering the move again.
export const MIGRATED_KEY = "migratedToNewDomain"

export type MigrationMessage =
	| { type: "ready" }
	| { type: "data"; payload: BackupData }
	| { type: "done" }
	| { type: "error" }

export function isMigrationMessage(value: unknown): value is MigrationMessage {
	if (typeof value !== "object" || value === null) return false
	const type = (value as { type?: unknown }).type
	return (
		type === "ready" ||
		type === "data" ||
		type === "done" ||
		type === "error"
	)
}

export function isOldDomain() {
	return (
		typeof window !== "undefined" && window.location.origin === OLD_ORIGIN
	)
}
