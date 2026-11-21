"use client"

import { useEffect, useMemo, useState } from "react"

import { DragDropProvider, DragOverlay } from "@dnd-kit/react"
import { DragEndEvent, DragStartEvent, Feedback } from "@dnd-kit/dom"

import type { PlannerRecord } from "@/types/planner"

import { getAllMaterialsList } from "@/data/items"

import { usePlannerStore, useSettingsStore } from "@/hooks"
import { usePlannerItems } from "@/hooks/usePlannerItems"
import { getAggregatedMaterials } from "@/hooks/usePlannerStore"

import { PlannerInventoryProvider } from "@/helpers/PlannerInventoryProvider"
import { localizePath } from "@/helpers/locale"

import { useLocale, useT } from "@/contexts"

import { MaterialGroup } from "@/components/inventory/"
import { InfoBox } from "@/components/layout/InfoBox"
import { MaterialDrawerTip } from "@/components/layout/MaterialDrawerTip"
import { PlannerArcBox } from "../ArcBox"
import { PlannerCharacterBox } from "../CharacterBox"
import { PlannerMaterialsList } from "../MaterialsList"

import plannerBoxStyles from "./plannerBox.module.css"
import styles from "./renderPlanner.module.css"
import { useRouter } from "next/navigation"

const materialOrder = new Map<string, number>()
getAllMaterialsList().forEach((material, index) =>
	materialOrder.set(material.id, index)
)

export function RenderPlanner({
	plannerType,
}: {
	plannerType: keyof PlannerRecord | "both"
}) {
	const t = useT()
	const { settings } = useSettingsStore()
	const { plannerData, isLoaded } = usePlannerStore()
	const router = useRouter()
	const locale = useLocale()

	const combinedEnabled = settings.appearance?.["use-hybrid-planner"] ?? false

	// Wait for storage hydration before redirecting so defaults never override saved mode.
	const shouldRedirect =
		isLoaded && (plannerType === "both" ? !combinedEnabled : combinedEnabled)
	const redirectTo = localizePath(
		plannerType === "both" ? "/planner/characters" : "/planner",
		locale
	)

	useEffect(() => {
		if (shouldRedirect) router.replace(redirectTo)
	}, [shouldRedirect, redirectTo, router])

	const { items, itemsList, handleDragEnd } = usePlannerItems(plannerType)

	const [activeDragId, setActiveDragId] = useState<string | null>(null)

	const allRequiredMaterials = useMemo(
		() =>
			shouldRedirect
				? []
				: Object.entries(
						getAggregatedMaterials(
							plannerData,
							plannerType === "characters"
								? "char"
								: plannerType === "arcs"
									? "arc"
									: "both"
						)
					).sort(
						([idA], [idB]) =>
							(materialOrder.get(idA) ?? 0) -
							(materialOrder.get(idB) ?? 0)
					),
		[plannerData, plannerType, shouldRedirect]
	)

	const onDragStart = (e: DragStartEvent) =>
		setActiveDragId((e.operation.source?.id as string) || null)

	const onDragEnd = (e: DragEndEvent) => {
		setActiveDragId(null)
		handleDragEnd(e)
	}

	const activeDragItem = activeDragId ? items[activeDragId] : null

	if (shouldRedirect) {
		return <main className={`page ${styles.page}`} role="main" />
	}

	return (
		<PlannerInventoryProvider itemRecords={itemsList}>
			<main className={`page ${styles.page}`} role="main">
				{allRequiredMaterials.length > 0 && (
					<>
						<MaterialDrawerTip />
						<MaterialGroup title={t("planner.requiredMaterials")}>
							<div
								className={`${plannerBoxStyles.plannerRequiredMaterialsBox} ${styles.plannerRequiredMaterialsBox}`}>
								<PlannerMaterialsList
									materials={allRequiredMaterials.map(
										([id, { amount }]) => ({
											id,
											amount,
										})
									)}
								/>
							</div>
						</MaterialGroup>
					</>
				)}

				{isLoaded && itemsList.length === 0 && (
					<InfoBox sticker="peek" className={styles.emptyNotice}>
						<div>
							{plannerType === "arcs"
								? t("planner.empty.arcs")
								: plannerType === "characters"
									? t("planner.empty.characters")
									: t("planner.empty.both")}
						</div>
					</InfoBox>
				)}

				<DragDropProvider
					plugins={(defaults) => [
						...defaults,
						Feedback.configure({
							dropAnimation: null,
						}),
					]}
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}>
					<div className={styles.plannerGrid}>
						{itemsList.map((item, index) =>
							"uid" in item ? (
								<PlannerArcBox
									key={item.uid}
									arcRecord={item}
									index={index}
								/>
							) : (
								<PlannerCharacterBox
									key={item.id}
									charRecord={item}
									index={index}
								/>
							)
						)}
						<DragOverlay>
							{activeDragItem &&
								("uid" in activeDragItem ? (
									<PlannerArcBox
										arcRecord={activeDragItem}
										index={-200}
									/>
								) : (
									<PlannerCharacterBox
										charRecord={activeDragItem}
										index={-200}
									/>
								))}
						</DragOverlay>
					</div>
				</DragDropProvider>
			</main>
		</PlannerInventoryProvider>
	)
}
