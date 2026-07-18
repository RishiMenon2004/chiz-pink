import { CSSProperties, MouseEvent, ReactNode, Ref } from "react"

import { useTooltip } from "@/hooks"

import { usePlannerBoxContext } from "@/contexts"

import styles from "./plannerBoxButtonsContainer.module.css"

const DragPoint = ({ ref }: { ref?: Ref<HTMLDivElement> }) => {
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	return (
		<div
			ref={ref}
			className={styles.dragPoint}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
			<Tooltip offset={{ x: 32, y: 0 }} subText="Drag to reorder">
				Adjust Priority
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
			tabIndex={1}
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
				"Enhancement Complete",
				"You have already achieved your target!",
			]
		}
		if (allMaterialsAcquired()) {
			return [
				"Complete Enhancement",
				"Materials will be deducted from your inventory.",
			]
		} else {
			return [
				<s key="title">Complete Enhancement</s>,
				"You have inadequate materials.",
			]
		}
	}

	return (
		<div className={styles.buttonsContainer}>
			<PlannerBoxBtn
				icon={itemRecord.isDisabled ? "hide" : "show"}
				ariaLabel="Disable Arc Button"
				toolTipSubtext={"Materials will be excluded in the total."}
				onClick={toggleDisable}>
				{"Disable Arc"}
			</PlannerBoxBtn>
			<PlannerBoxBtn
				icon="confirm_plan"
				ariaLabel="Confirm Levelling Button"
				toolTipSubtext={enhancmentTooltip()[1]}
				disabled={!allMaterialsAcquired()}
				onClick={handleEnhancement}>
				{enhancmentTooltip()[0]}
			</PlannerBoxBtn>
			<DragPoint ref={dragRef} />
			<PlannerBoxBtn
				icon="delete"
				ariaLabel="Delete Arc Plan Button"
				toolTipSubtext="Be careful! You can't undo this action."
				onClick={handleDelete}>
				Delete Arc
			</PlannerBoxBtn>
		</div>
	)
}
