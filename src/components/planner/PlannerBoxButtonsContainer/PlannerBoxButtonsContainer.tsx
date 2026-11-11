import { CSSProperties, MouseEvent, ReactNode, Ref } from "react"

import { useTooltip } from "@/hooks"

import { usePlannerBoxContext, useT } from "@/contexts"

import styles from "./plannerBoxButtonsContainer.module.css"

const DragPoint = ({ ref }: { ref?: Ref<HTMLDivElement> }) => {
	const t = useT()
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	return (
		<div
			ref={ref}
			className={styles.dragPoint}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
			<Tooltip offset={{ x: 32, y: 0 }} subText={t("planner.buttons.dragToReorder")}>
				{t("planner.buttons.adjustPriority")}
			</Tooltip>
		</div>
	)
}

const PlannerBoxBtn = ({
	onClick,
	icon,
	ariaLabel,
	toolTipSubtext,
	disabled,
	children,
}: {
	onClick: (e: MouseEvent<HTMLElement>) => void
	icon: string
	ariaLabel: string
	toolTipSubtext?: string
	disabled?: boolean
	children: ReactNode
}) => {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	return (
		<button
			tabIndex={0}
			aria-label={ariaLabel}
			className={styles.plannerButton}
			style={
				{
					"--icon-src": `url('/button_icons/${icon}.png')`,
				} as CSSProperties
			}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
			onClick={onClick}
			disabled={disabled}>
			<Tooltip offset={{ x: 32, y: 0 }} subText={toolTipSubtext || ""}>
				{children}
			</Tooltip>
		</button>
	)
}

export function PlannerBoxButtonsContainer() {
	const t = useT()
	const {
		itemRecord,
		allMaterialsAcquired,
		toggleDisable,
		handleEnhancement,
		handleDelete,
		dragRef,
	} = usePlannerBoxContext()

	const enhancmentTooltip = (): [ReactNode, string] => {
		const targetAchieved = Object.values(itemRecord.requiredMaterials).every(
			(material) => {
				return material.amount === 0
			}
		)

		if (targetAchieved) {
			return [
				t("planner.buttons.enhancementComplete"),
				t("planner.buttons.targetAchieved"),
			]
		}
		if (allMaterialsAcquired()) {
			return [
				t("planner.buttons.completeEnhancement"),
				t("planner.buttons.deductNote"),
			]
		} else {
			return [
				<s key="title">{t("planner.buttons.completeEnhancement")}</s>,
				t("planner.buttons.inadequate"),
			]
		}
	}

	const isArc = "uid" in itemRecord

	return (
		<div className={styles.buttonsContainer}>
			<PlannerBoxBtn
				icon={itemRecord.isDisabled ? "hide" : "show"}
				ariaLabel={
					isArc
						? t("planner.buttons.disableArcAria")
						: t("planner.buttons.disableCharacterAria")
				}
				onClick={toggleDisable}>
				{isArc
					? t("planner.buttons.disableArc")
					: t("planner.buttons.disableCharacter")}
			</PlannerBoxBtn>
			<PlannerBoxBtn
				icon="confirm_plan"
				ariaLabel={t("planner.buttons.confirmLevellingAria")}
				toolTipSubtext={enhancmentTooltip()[1]}
				disabled={!allMaterialsAcquired()}
				onClick={handleEnhancement}>
				{enhancmentTooltip()[0]}
			</PlannerBoxBtn>
			<DragPoint ref={dragRef} />
			<PlannerBoxBtn
				icon="delete"
				ariaLabel={
					isArc
						? t("planner.buttons.deleteArcAria")
						: t("planner.buttons.deleteCharacterAria")
				}
				toolTipSubtext={t("planner.buttons.deleteWarning")}
				onClick={handleDelete}>
				{isArc
					? t("planner.buttons.deleteArc")
					: t("planner.buttons.deleteCharacter")}
			</PlannerBoxBtn>
		</div>
	)
}
