import { useMemo } from "react"

import type { WeaponRecord } from "@/types/planner"
import type { CumulativeInventory } from "@/types/inventory"

import { EnumMaterialType, findMaterial } from "@/data/items"

import { useInventoryStore } from "@/hooks"

import { ArcPlannerUsableMaterialsContext } from "@/contexts"

export function ArcDeductedInventoryProvider({
	arcRecords,
	children,
}: {
	arcRecords: WeaponRecord[]
	children: React.ReactNode
}) {
	const { inventory: currentInventory } = useInventoryStore()

	const convertedInventory: CumulativeInventory = useMemo(() => {
		const cumulativeInventory: CumulativeInventory = {}

		Object.entries(currentInventory).forEach(([materialId, amount]) => {
			cumulativeInventory[materialId] = { amount, craftedAmount: 0 }
		})

		return cumulativeInventory
	}, [currentInventory])

	const cumulativeInventory = useMemo(() => {
		const localInventory = { ...convertedInventory }

		const deductedInventories = [convertedInventory] as CumulativeInventory[]

		arcRecords.forEach((arcRecord, index) => {
			if (arcRecord.isDisabled) {
				deductedInventories.push({ ...localInventory })
				return
			}
			arcRecord.requiredMaterials.forEach((material) => {
				const inventoryAmount = localInventory[material.id]?.amount || 0
				const remainingAmount = Math.max(
					0,
					inventoryAmount - material.amount
				)

				localInventory[material.id] = {
					amount: remainingAmount,
					craftedAmount: 0,
				}

				if (
					findMaterial(material.id).materialType ===
					EnumMaterialType.WeaponExp
				)
					return

				const linkedMaterials =
					findMaterial(material.id)?.linkedMaterials?.map(
						(linkedMaterialId) => findMaterial(linkedMaterialId)
					) || []
				const lowerMaterial = linkedMaterials.find(
					(linkedMaterial) =>
						linkedMaterial.rarity ===
						findMaterial(material.id).rarity - 1
				)
				const lowerMaterialRemaining = lowerMaterial
					? localInventory[lowerMaterial.id].amount || 0
					: 0

				const stillNeededAmount = Math.max(
					0,
					material.amount - inventoryAmount
				)

				if (
					stillNeededAmount > 0 &&
					lowerMaterialRemaining > 0 &&
					lowerMaterial
				) {
					const craftableAmount = Math.floor(lowerMaterialRemaining / 3)
					const usableCraftedAmount = Math.min(
						stillNeededAmount,
						craftableAmount
					)

					localInventory[lowerMaterial.id] = {
						amount: Math.max(
							0,
							lowerMaterialRemaining - usableCraftedAmount * 3
						),
						craftedAmount: 0,
					}

					const prevInventory = deductedInventories[index]
					prevInventory[material.id] = {
						amount: prevInventory[material.id]?.amount || 0,
						craftedAmount: usableCraftedAmount,
					}
				}
			})

			deductedInventories.push({ ...localInventory })
		})

		return [...deductedInventories]
	}, [convertedInventory, arcRecords])

	return (
		<ArcPlannerUsableMaterialsContext.Provider
			value={{ cumulativeInventory }}>
			{children}
		</ArcPlannerUsableMaterialsContext.Provider>
	)
}
