"use client"

import { useSyncExternalStore } from "react"

import { hasLocalData, hasLocalPulls } from "@/helpers/backupData"
import {
	DISMISSED_INTROS_KEY,
	dismissToolIntro,
	getDismissedIntros,
	type DismissedIntros,
	type ToolIntroId,
} from "@/helpers/toolIntro"
import * as memoryStorage from "@/helpers/storage/memoryStorage"
import { getFirstVisit } from "./useFirstVisit"

// Runs once per load from useStorageInitializer, after the planner,
// inventory and pulls caches have loaded (hasLocalData() reads them), and
// only acts the first time: browsers that had visited or saved anything
// before intros existed get "all".
export function decideToolIntros() {
	if (getDismissedIntros() !== null) return

	const isFirstVisit = getFirstVisit()
	if (isFirstVisit === null) return

	const isExistingUser = !isFirstVisit || hasLocalData() || hasLocalPulls()
	memoryStorage.setItem<DismissedIntros>(
		DISMISSED_INTROS_KEY,
		isExistingUser ? "all" : []
	)
}

// Whether to show the intro with this id, and a function that closes it
// for good. Hidden on the server and until the existing-user check has
// run, so returning users never see it flash in.
export function useToolIntro(id: ToolIntroId) {
	const getSnapshot = (): boolean => {
		const dismissed = getDismissedIntros()
		return dismissed !== null && dismissed !== "all" && !dismissed.includes(id)
	}

	const show = useSyncExternalStore(
		memoryStorage.subscribe,
		getSnapshot,
		() => false
	)

	return { show, dismiss: () => dismissToolIntro(id) }
}
