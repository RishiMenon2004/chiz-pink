import type { BackupData } from "@/types/settings"

// The app moved from the Vercel subdomain to chiz.pink. Browser storage is
// per-origin, so chiz.pink can't read what was saved on the old address,
// and an iframe bridge doesn't work either (third-party iframes get
// partitioned, empty storage). Instead the old address opens
// chiz.pink/migrate as a top-level popup and hands its data over with
// postMessage:
//
//   old address                        chiz.pink/migrate (popup)
//   ---------------------------------  ---------------------------------
//   window.open(NEW_ORIGIN/migrate) -> (loads, waits for local storage)
//                                    <- { type: "ready" }
//   { type: "data", payload }       ->  imports (asks first if it already
//                                       has data)
//                                    <- { type: "done" } / { type: "error" }
//   marks itself migrated, redirects    closes itself
//
// Both sides check the other's exact origin, so no other site can send or
// receive the data. An old address must keep serving the app (no redirect
// in Vercel's domain settings), or this code never runs there. www.chiz.pink
// is deliberately not one: Vercel redirects it before anything loads, so
// nothing is ever saved there.

const OLD_ORIGINS = new Set(["https://chiz-pink.vercel.app"])

// Each origin has its own storage: changing the primary address again
// would strand data again.
export const NEW_ORIGIN = "https://chiz.pink"

// How the new address is shown to users.
export const NEW_DOMAIN_LABEL = "chiz.pink"

export const MIGRATE_PATH = "/migrate"

// Set on an old address once its data has been handed over, so later
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

export function isOldOrigin(origin: string) {
	return OLD_ORIGINS.has(origin)
}

export function getOldOrigins() {
	return [...OLD_ORIGINS]
}

export function isOldDomain() {
	return typeof window !== "undefined" && isOldOrigin(window.location.origin)
}
