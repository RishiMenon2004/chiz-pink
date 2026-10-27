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

export { generateNewCharacter } from "./generateNewCharacter"

export { unlinkGoogleAccount } from "./unlinkGoogleAccount"
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
	getCustomTaskResetBoundaries,
	getUpcomingResetDates,
} from "./resetBoundaries"

export {
	backupExport,
	backupImport,
	backupSetImport,
	eraseLocalData,
	erasePullHistory,
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
	findRateUpBanner,
	staticArcBanners,
	getResolvedGachaBanners,
	permanentRateupSet,
	calculateArcBannerPity,
	calculateCharacterBannerPity,
	calculatePityMap,
	calculatePullNumberMap,
} from "./calculatePity"

export { getBannerThemeColor } from "./getBannerThemeColor"
export { findPullItem } from "./findPullItem"
export { stopPropagation } from "./stopPropagation"
