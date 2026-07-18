import { usePlannerBoxContext } from "@/contexts"
import { findMaterial } from "@/data/items"

import { PlannerMaterialBox } from "@/components/planner"

import styles from "./plannerMaterialsList.module.css"

export function PlannerMaterialsList({
	materials,
}: {
	materials?: {
		id: string
		amount: number
	}[]
}) {
	const { itemRecord, entryIndex } = usePlannerBoxContext() ?? {
		itemRecord: {},
		entryIndex: -1,
	}

	const materialsList = materials ? materials : itemRecord.requiredMaterials

	return (
		<div className={styles.materialsList}>
			{materialsList.map((material) => {
				if (material.amount > 0) {
					return (
						<PlannerMaterialBox
							key={material.id}
							material={findMaterial(material.id)}
							requiredAmount={material.amount}
							entryIndex={entryIndex}
						/>
					)
				}
			})}
		</div>
	)
}
