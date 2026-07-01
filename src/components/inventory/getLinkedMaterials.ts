import { findMaterial, Material } from "@/database/items"

export default function getLinkedMaterials(material: Material) {
		const rarityOrder: Material[] = []
		if (material.linkedMaterials) {
			rarityOrder.push(material)
			material.linkedMaterials.forEach((materialId) => {
				rarityOrder.push(findMaterial(materialId))
			})

			rarityOrder.sort((a, b) => b.rarity - a.rarity)
		} else {
			rarityOrder.push(material)
		}

		return rarityOrder
	}