"use client"

import { BannerType } from "@/types/pulls"

import { gachaPullsActions, getCachedPulls } from "@/hooks/useGachaStore"
import {
	getCachedInventory,
	replaceInventory,
	updateInventory,
} from "@/hooks/useInventoryStore"
import { getCachedPlanner, plannerActions } from "@/hooks/usePlannerStore"
import { settingsActions } from "@/hooks/useSettingsStore"

import { ExternalImportResult } from "./importExternal"

export type AppliedExternalImportResult = ExternalImportResult & {
	pullsImportedCount?: number
	pullsDuplicateCount?: number
}

export function hasExistingPlannerData() {
	const inventory = getCachedInventory()
	const planner = getCachedPlanner()

	return (
		Object.keys(inventory).length > 0 ||
		Object.keys(planner.characters ?? {}).length > 0 ||
		Object.keys(planner.arcs ?? {}).length > 0
	)
}

export function hasIncomingPlannerData(report: ExternalImportResult) {
	return (
		Object.keys(report.inventory).length > 0 ||
		report.characters.length > 0 ||
		report.arcs.length > 0 ||
		report.staminaPatch !== null
	)
}

export function countIncomingPulls(report: ExternalImportResult) {
	if (!report.pulls) return 0
	return (
		report.pulls.arcsBanner.length +
		report.pulls.limitedBanner.length +
		report.pulls.permanentBanner.length
	)
}

function countStoredPulls() {
	const cached = getCachedPulls()
	return (
		Object.keys(cached.arcsBanner).length +
		Object.keys(cached.limitedBanner).length +
		Object.keys(cached.permanentBanner).length
	)
}

const BANNER_TYPES: BannerType[] = [
	"arcsBanner",
	"limitedBanner",
	"permanentBanner",
]

// Applies a parsed third-party import (NTE Planner, NTEWiz, ...) to local
// stores. Pull history is always merged (never overwritten) and deduplicated.
export function applyExternalImport(
	report: ExternalImportResult,
	mode: "merge" | "overwrite"
): AppliedExternalImportResult {
	if (hasIncomingPlannerData(report)) {
		if (mode === "overwrite") {
			replaceInventory(report.inventory)
			plannerActions.updatePlanner(() => ({ characters: {}, arcs: {} }))
		} else if (Object.keys(report.inventory).length > 0) {
			updateInventory(report.inventory)
		}

		report.characters.forEach(({ character }) =>
			plannerActions.addCharacter(character)
		)

		report.arcs.forEach(({ arc }) => plannerActions.addWeapon(arc))

		if (report.staminaPatch) {
			settingsActions.setConfig("userdata", report.staminaPatch)
		}
	}

	const incomingPullsCount = countIncomingPulls(report)
	if (!report.pulls || incomingPullsCount === 0) {
		return report
	}

	const before = countStoredPulls()
	for (const bannerType of BANNER_TYPES) {
		const bannerPulls = report.pulls[bannerType]
		if (bannerPulls.length > 0) {
			gachaPullsActions.addPulls(bannerPulls, bannerType)
		}
	}
	const after = countStoredPulls()
	const added = Math.max(0, after - before)

	return {
		...report,
		pullsImportedCount: added,
		pullsDuplicateCount: Math.max(0, incomingPullsCount - added),
	}
}
