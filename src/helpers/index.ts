import { MouseEvent } from "react"

export { calculateWeaponCosts, weaponExpAmount } from "./calculateWeaponCosts"
export {
	calculateCharacterCosts,
	characterExpAmount,
} from "./calculateCharacterCosts"

export { getLinkedMaterials } from "./getLinkedMaterials"
export { getPhases } from "./getPhases"
export { getRarityName } from "./getRarityName"
export { getCostAmount } from "./getCostAmountWithRarity"
export { getOptimizedImageUrl } from "./getOptimizedImageUrl"

export { parseDescription } from "./parseDescription"

export { PlannerInventoryProvider } from "./PlannerInventoryProvider"
export { ServiceWorkerRegister } from "./ServiceWorkerRegister"

export { generateNewCharacter } from "./generateNewCharacter"
export { createSearchString } from "./createSearchString"

export { unlinkGoogleAccount } from "./unlinkGoogleAccount"
export { CloudSyncProvider } from "./CloudSyncProvider"
export { signInWithGooglePopup } from "./signInWithGooglePopup"

export { isInitialSyncPending, setInitialSyncPending } from "./syncGate"

export {
	formatTimeRemaining,
	getPixelsRefillTime,
	getNextPixelRecoveryTime,
} from "./staminaReset"

export {
	getDailyResetBoundaries,
	getWeeklyResetBoundaries,
	getMonthlyResetBoundaries,
	getBiWeeklyMondayResetBoundaries,
	getBiWeeklyWednesdayResetBoundaries,
	getSeasonalResetBoundaries,
} from "./resetBoundaries"

export {
	backupExport,
	backupImport,
	backupSetImport,
	eraseLocalData,
} from "@/helpers/backupData"

export {
	isNtePlannerBackup,
	parseNtePlannerImport,
} from "@/helpers/importNtePlanner"
export { isNteWizBackup, parseNteWizImport } from "@/helpers/importNteWiz"
export type { ExternalImportResult } from "@/helpers/importExternal"

export {
	isScarboroughPull,
	isArcRateUp,
	isRateUp,
	staticArcBanners,
	getResolvedGachaBanners,
	permanentRateupSet,
	calculateArcBannerPity,
	calculateCharacterBannerPity,
	calculatePityMap,
} from "./calculatePity"

export { getBannerThemeColor } from "./getBannerThemeColor"
export { findPullItem } from "./findPullItem"

export function stopPropagation(event: MouseEvent) {
	event.stopPropagation()
}
