"use client"

import Image from "next/image"
import {
	ChangeEvent,
	FocusEvent,
	MouseEvent,
	useEffect,
	useRef,
	useState,
	useContext,
	useCallback,
	KeyboardEvent,
	createContext,
} from "react"

import { useInventoryStore, useTooltip } from "@/hooks"

import { Material, getItemRarityStyle } from "@/database/items"

import styles from "@/components/inventory/inventoryMaterial.module.css"

export type MatAdjustmentContextType = {
	registerAdjustmentAmount: (id: string, callback: () => void) => void
	unregisterAdjustmentAmount: (id: string) => void
}

export const MatAdjustmentContext = createContext<MatAdjustmentContextType>(null!)

type MaterialItemBoxProps = {
	material: Material
	requiredQuantity?: number
}

export default function MaterialAdjustmentBox({
	material,
	requiredQuantity,
}: MaterialItemBoxProps) {
	const modalContext = useContext(MatAdjustmentContext)

	const [addSubValue, setAddSubValue] = useState<string>("")

	const countRef = useRef<HTMLInputElement>(null)
	const { inventory, updateInventory } = useInventoryStore()
	const itemQuantity = inventory[material.id] || 0

	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const setAmount = useCallback(
		(value: number) => {
			updateInventory({ [material.id]: value })
		},
		[material.id, updateInventory]
	)

	// Register/unregister amount callback with parent context
	useEffect(() => {
		const amountCallback = () => {
			console.log("closemodal callback executed")
			if (addSubValue) {
				const adjustmentValue = parseInt(addSubValue) || 0
				const newTotal = Math.max(itemQuantity + adjustmentValue, 0)
				setAmount(newTotal)
			}
		}
		modalContext.registerAdjustmentAmount(material.id, amountCallback)
		return () => modalContext.unregisterAdjustmentAmount(material.id)
	}, [addSubValue, itemQuantity, material.id, modalContext, setAmount])

	const handleCount = (e: MouseEvent<HTMLSpanElement>, increment: boolean) => {
		e.stopPropagation()
		hideTooltip()
		if (countRef.current) {
			const prevAmount = itemQuantity
			const newAmount = Math.max(
				increment ? prevAmount + 1 : prevAmount - 1,
				0
			)
			setAmount(newAmount)
		}
	}

	const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			const newValue = parseInt(e.currentTarget.value.replaceAll(/\D/g, ""))
			setAmount(newValue)
		}
	}

	const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			e.currentTarget.focus()
			e.currentTarget.setSelectionRange(0, 999)
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		e.stopPropagation()
		if (e.key === "Enter" || e.key === "Escape") {
			e.currentTarget.blur()
		}
	}

	const handleBoxClick = (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
	}

	const handleAddSubChange = (e: ChangeEvent<HTMLInputElement>) => {
		setAddSubValue(e.currentTarget.value)
	}

	const displayQuantity = itemQuantity + (parseInt(addSubValue) || 0)

	return (
		<div
			className={`${styles.materialBox} ${getItemRarityStyle(material, styles)}`}
			onClick={(e) => {
				e.stopPropagation()
				hideTooltip()
			}}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}>
			<div className={`${styles.iconContainer}`} onClick={handleBoxClick}>
				<Image
					src={`/materials${material.imageSrc}.png`}
					width={128}
					height={128}
					alt={`${material.name} icon`}
					loading="eager"
				/>
			</div>

			<span className={`${styles.label}`}>{material.name}</span>

			<Tooltip subText={material.materialType} offset={{ x: 48, y: 0 }}>
				{material.name}
			</Tooltip>

			<span className={`${styles.amount}`}>
				<span
					tabIndex={0}
					aria-label={`${material.name} minus one button`}
					className={`${styles.countBtn} ${styles.minus}`}
					onClick={(e) => handleCount(e, false)}
				/>
				<span className={`${styles.countContainer}`}>
					<input
						ref={countRef}
						type={"text"}
						min="0"
						pattern="[0-9]*"
						inputMode="numeric"
						value={displayQuantity}
						onChange={handleEdit}
						onFocus={handleFocus}
						onKeyDown={handleKeyDown}
						onClick={(e) => {
							e.stopPropagation()
							hideTooltip()
						}}
					/>
					{requiredQuantity && <span>/{requiredQuantity}</span>}
				</span>
				<span
					tabIndex={0}
					aria-label={`${material.name} plus one button`}
					className={`${styles.countBtn} ${styles.plus}`}
					onClick={(e) => handleCount(e, true)}
				/>
			</span>

			<span className={`${styles.amount}`}>
				<span
					className={`${styles.countBtn} ${styles.addSub}`}
					style={{ pointerEvents: "none" }}
				/>
				<input
					type="text"
					inputMode="numeric"
					value={addSubValue}
					placeholder="0"
					onChange={handleAddSubChange}
					onKeyDown={handleKeyDown}
				/>
				<span
					className={`${styles.countBtn}`}
					style={{
						opacity: 0,
						userSelect: "none",
						pointerEvents: "none",
					}}
				/>
			</span>
		</div>
	)
}
