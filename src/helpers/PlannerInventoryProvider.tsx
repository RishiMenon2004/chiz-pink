import { useMemo } from "react"

import type { CharacterRecord, WeaponRecord } from "@/types/planner"
import type { CumulativeInventory } from "@/types/inventory"

import { EnumMaterialType, EnumRarity, findMaterial } from "@/data/items"

import { useInventoryStore } from "@/hooks"

import { PlannerMaterialsContext } from "@/contexts"

import { weaponExpAmount } from "./calcuateWeaponCosts"
import { characterExpAmount } from "./calculateCharacterCosts"

const weaponExpAmountByRarity: Partial<Record<EnumRarity, number>> = {
	[EnumRarity.Common]: weaponExpAmount.common,
	[EnumRarity.Uncommon]: weaponExpAmount.uncommon,
	[EnumRarity.Rare]: weaponExpAmount.rare,
}

const characterExpAmountByRarity: Partial<Record<EnumRarity, number>> = {
	[EnumRarity.Common]: characterExpAmount.common,
	[EnumRarity.Uncommon]: characterExpAmount.uncommon,
	[EnumRarity.Rare]: characterExpAmount.rare,
}

export function PlannerInventoryProvider({
	itemRecords,
	children,
}: {
	itemRecords: (WeaponRecord | CharacterRecord)[]
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

		const deductedInventories = [
			{ ...convertedInventory },
		] as CumulativeInventory[]

		const craftedTotals: Record<string, number> = {}
		const craftedFromTotals: Record<string, Record<string, number>> = {}

		itemRecords.forEach((itemRecord, index) => {
			if (itemRecord.isDisabled) {
				deductedInventories.push({ ...localInventory })
				return
			}
			itemRecord.requiredMaterials.forEach((material) => {
				const inventoryAmount = localInventory[material.id]?.amount || 0
				const remainingAmount = Math.max(
					0,
					inventoryAmount - material.amount
				)

				localInventory[material.id] = {
					amount: remainingAmount,
					craftedAmount: 0,
				}

				const matData = findMaterial(material.id)

				const linkedMaterials =
					matData.linkedMaterials?.map((linkedMaterialId) =>
						findMaterial(linkedMaterialId)
					) ?? []

				const lowerMaterials = linkedMaterials
					.filter((linkedMat) => linkedMat.rarity < matData.rarity)
					.sort((a, b) => b.rarity - a.rarity)

				const stillNeededAmount = Math.max(
					0,
					material.amount - inventoryAmount
				)

				const isWeaponExp =
					matData.materialType === EnumMaterialType.WeaponExp
				const isCharacterExp =
					matData.materialType === EnumMaterialType.CharacterExp

				const expAmountByRarity = isWeaponExp
					? weaponExpAmountByRarity
					: characterExpAmountByRarity

				const getCraftRatio = (lowerRarity: EnumRarity) =>
					isWeaponExp || isCharacterExp
						? (expAmountByRarity[matData.rarity] ?? 0) /
							(expAmountByRarity[lowerRarity] || 1)
						: 3 ** (matData.rarity - lowerRarity)

				let remainingDeficiency = stillNeededAmount
				let totalCraftedAmount = 0
				const craftedFrom: { id: string; amount: number }[] = []

				for (const lowerMaterial of lowerMaterials) {
					if (remainingDeficiency <= 0) break

					const lowerMaterialRemaining =
						localInventory[lowerMaterial.id]?.amount ?? 0

					if (lowerMaterialRemaining <= 0) continue

					const craftRatio = getCraftRatio(lowerMaterial.rarity)

					const craftableAmount = Math.floor(
						lowerMaterialRemaining / craftRatio
					)
					const usableCraftedAmount = Math.min(
						remainingDeficiency,
						craftableAmount
					)

					remainingDeficiency -= usableCraftedAmount
					totalCraftedAmount += usableCraftedAmount

					// Only consume what was actually crafted — even when this
					// lower material couldn't fully cover the deficit, any
					// genuine leftover must stay available for other
					// materials/items later in the sequence to use.
					const consumedAmount = usableCraftedAmount * craftRatio

					if (consumedAmount > 0) {
						craftedFrom.push({
							id: lowerMaterial.id,
							amount: consumedAmount,
						})
					}

					localInventory[lowerMaterial.id] = {
						amount: Math.max(
							0,
							lowerMaterialRemaining - consumedAmount
						),
						craftedAmount: 0,
					}
				}

				if (totalCraftedAmount > 0) {
					const prevInventory = deductedInventories[index]
					prevInventory[material.id] = {
						...prevInventory[material.id],
						craftedAmount: totalCraftedAmount,
						craftedFrom,
					}

					craftedTotals[material.id] =
						(craftedTotals[material.id] ?? 0) + totalCraftedAmount

					const fromTotals =
						craftedFromTotals[material.id] ??
						(craftedFromTotals[material.id] = {})
					craftedFrom.forEach(({ id, amount }) => {
						fromTotals[id] = (fromTotals[id] ?? 0) + amount
					})
				}
			})

			deductedInventories.push({ ...localInventory })
		})

		const totalsSnapshot: CumulativeInventory = { ...convertedInventory }
		Object.entries(craftedTotals).forEach(([materialId, amount]) => {
			totalsSnapshot[materialId] = {
				...totalsSnapshot[materialId],
				amount: totalsSnapshot[materialId]?.amount ?? 0,
				craftedAmount: amount,
				craftedFrom: Object.entries(
					craftedFromTotals[materialId] ?? {}
				).map(([id, amt]) => ({ id, amount: amt })),
			}
		})

		return [...deductedInventories, totalsSnapshot]
	}, [convertedInventory, itemRecords])

	return (
		<PlannerMaterialsContext.Provider value={cumulativeInventory}>
			{children}
		</PlannerMaterialsContext.Provider>
	)
}
