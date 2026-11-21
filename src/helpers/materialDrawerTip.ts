import * as memoryStorage from "./storage/memoryStorage"

export const MATERIAL_DRAWER_TIP_KEY = "materialDrawerTipDismissed"

export function isMaterialDrawerTipDismissed(): boolean {
	return memoryStorage.getItem<boolean>(MATERIAL_DRAWER_TIP_KEY, false)
}

export function shouldShowMaterialDrawerTip(): boolean {
	return memoryStorage.isHydrated() && !isMaterialDrawerTipDismissed()
}

export function dismissMaterialDrawerTip(): void {
	if (!memoryStorage.isHydrated() || isMaterialDrawerTipDismissed()) return
	memoryStorage.setItem(MATERIAL_DRAWER_TIP_KEY, true)
}

export function subscribeMaterialDrawerTip(listener: () => void): () => void {
	const unsubKey = memoryStorage.subscribeKey(MATERIAL_DRAWER_TIP_KEY, listener)
	const unsubHydration = memoryStorage.subscribeHydration(listener)
	return () => {
		unsubKey()
		unsubHydration()
	}
}
