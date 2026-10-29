import * as memoryStorage from "./storage/memoryStorage"

export const DISMISSED_INTROS_KEY = "dismissedIntros"

export type ToolIntroId = "planner" | "pulls" | "checklist" | "inventory"

// The ids of the intros this browser is done with, or "all" for browsers
// that were already using the site when intros were added - they know
// what each tool does, so they never see one. Unset until
// decideToolIntros() runs on the first load after storage hydrates.
export type DismissedIntros = ToolIntroId[] | "all"

export function getDismissedIntros(): DismissedIntros | null {
	// A null fallback skips getItem's shape check, which would compare the
	// value against the fallback's type and flag "all" (a string) as
	// corrupted if the fallback were an array.
	const value = memoryStorage.getItem<unknown>(DISMISSED_INTROS_KEY, null)
	if (value === null) return null
	if (value === "all") return "all"
	return Array.isArray(value) ? (value as ToolIntroId[]) : []
}

// Called by the close button and by each tool's first real action
// (importing pulls, adding to the planner, editing the checklist or
// inventory). Does nothing before the existing-user check has run, so an
// action then can't stop "all" from being recorded.
export function dismissToolIntro(id: ToolIntroId) {
	const dismissed = getDismissedIntros()
	if (dismissed === null || dismissed === "all" || dismissed.includes(id)) {
		return
	}
	memoryStorage.setItem<DismissedIntros>(DISMISSED_INTROS_KEY, [
		...dismissed,
		id,
	])
}
