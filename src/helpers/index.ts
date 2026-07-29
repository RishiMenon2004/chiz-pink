import { MouseEvent } from "react"

export { calcuateWeaponCosts, weaponExpAmount } from "./calcuateWeaponCosts"
export {
	calculateCharacterCosts,
	characterExpAmount,
} from "./calculateCharacterCosts"

export { getLinkedMaterials } from "./getLinkedMaterials"
export { getPhases } from "./getPhases"
export { getRarityName } from "./getRarityName"
export { getCostAmount } from "./getCostAmountWithRarity"

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
	getStaminaResetBoundaries,
	formatTimeRemaining,
	getPixelsRefillTime,
	getNextPixelRecoveryTime,
} from "./staminaReset"

export {
	backupExport,
	backupImport,
	backupSetImport,
	eraseLocalData,
} from "@/helpers/backupData"

export function stopPropogation(event: MouseEvent) {
	event.stopPropagation()
}