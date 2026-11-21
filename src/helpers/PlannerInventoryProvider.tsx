import { useMemo } from "react"

import type { CharacterRecord, WeaponRecord } from "@/types/planner"
import type { CumulativeInventory } from "@/types/inventory"

import { findMaterial } from "@/data/items"

import { useInventoryStore } from "@/hooks"

import { PlannerMaterialsContext } from "@/contexts"

import { getCraftRatio, getCraftSources } from "./crafting"

export function PlannerInventoryProvider({
	itemRecords,
	children,
}: {
	itemRecords: (WeaponRecord | CharacterRecord)[]
	children: React.ReactNode
}) {
	const { inventory: currentInventory } = useInventoryStore()

	const cumulativeInventory = useMemo(() => {
		const remaining: Record<string, number> = { ...currentInventory }
		const cardSnapshots: CumulativeInventory[] = []
		const totalsSnapshot: CumulativeInventory = {}
		const craftedTotals: Record<string, number> = {}
		const craftedFromTotals: Record<string, Record<string, number>> = {}

		for (const itemRecord of itemRecords) {
			const cardSnapshot: CumulativeInventory = {}

			// Capture pre-card available counts only for materials this card uses.
			for (const material of itemRecord.requiredMaterials) {
				if (!(material.id in cardSnapshot)) {
					cardSnapshot[material.id] = {
						amount: remaining[material.id] ?? 0,
						craftedAmount: 0,
					}
				}
				if (!(material.id in totalsSnapshot)) {
					totalsSnapshot[material.id] = {
						amount: currentInventory[material.id] ?? 0,
						craftedAmount: 0,
					}
				}
			}

			if (itemRecord.isDisabled) {
				cardSnapshots.push(cardSnapshot)
				continue
			}

			for (const material of itemRecord.requiredMaterials) {
				const inventoryAmount = remaining[material.id] ?? 0
				remaining[material.id] = Math.max(
					0,
					inventoryAmount - material.amount
				)

				const matData = findMaterial(material.id)
				let remainingDeficiency = Math.max(
					0,
					material.amount - inventoryAmount
				)
				let totalCraftedAmount = 0
				const craftedFrom: { id: string; amount: number }[] = []

				for (const lowerMaterial of getCraftSources(matData)) {
					if (remainingDeficiency <= 0) break

					const lowerMaterialRemaining = remaining[lowerMaterial.id] ?? 0
					if (lowerMaterialRemaining <= 0) continue

					const craftRatio = getCraftRatio(matData, lowerMaterial)
					const craftableAmount = Math.floor(
						lowerMaterialRemaining / craftRatio
					)
					const usableCraftedAmount = Math.min(
						remainingDeficiency,
						craftableAmount
					)

					remainingDeficiency -= usableCraftedAmount
					totalCraftedAmount += usableCraftedAmount

					// Selection boxes open whole (craftRatio < 1), keeping any surplus.
					const consumedAmount = Math.ceil(
						usableCraftedAmount * craftRatio - 1e-9
					)
					const surplusAmount =
						Math.round(consumedAmount / craftRatio) - usableCraftedAmount

					if (surplusAmount > 0) {
						remaining[material.id] =
							(remaining[material.id] ?? 0) + surplusAmount
					}

					if (consumedAmount > 0) {
						craftedFrom.push({
							id: lowerMaterial.id,
							amount: consumedAmount,
						})
					}

					remaining[lowerMaterial.id] = Math.max(
						0,
						lowerMaterialRemaining - consumedAmount
					)
				}

				if (totalCraftedAmount > 0) {
					cardSnapshot[material.id] = {
						...cardSnapshot[material.id],
						craftedAmount: totalCraftedAmount,
						craftedFrom,
					}

					craftedTotals[material.id] =
						(craftedTotals[material.id] ?? 0) + totalCraftedAmount

					const fromTotals =
						craftedFromTotals[material.id] ??
						(craftedFromTotals[material.id] = {})
					for (const { id, amount } of craftedFrom) {
						fromTotals[id] = (fromTotals[id] ?? 0) + amount
					}
				}
			}

			cardSnapshots.push(cardSnapshot)
		}

		for (const [materialId, amount] of Object.entries(craftedTotals)) {
			totalsSnapshot[materialId] = {
				amount: totalsSnapshot[materialId]?.amount ?? 0,
				craftedAmount: amount,
				craftedFrom: Object.entries(
					craftedFromTotals[materialId] ?? {}
				).map(([id, amt]) => ({ id, amount: amt })),
			}
		}

		cardSnapshots.push(totalsSnapshot)
		return cardSnapshots
	}, [currentInventory, itemRecords])

	return (
		<PlannerMaterialsContext.Provider value={cumulativeInventory}>
			{children}
		</PlannerMaterialsContext.Provider>
	)
}
