"use client"

import Image from "next/image"
import {
	ChangeEvent,
	FocusEvent,
	MouseEvent,
	useEffect,
	useRef,
	useState,
	useCallback,
	KeyboardEvent,
} from "react"

import type { Material } from "@/types/item"

import { getItemRarityStyle } from "@/data/items"

import { useInventoryStore, useTooltip } from "@/hooks"

import { useMaterialAdjustmentContext } from "@/contexts"

import { styles } from "@/components/inventory/MaterialBox"

export function MaterialEditorBox({
	material,
	requiredQuantity,
}: {
	material: Material
	requiredQuantity?: number
}) {
	const modalContext = useMaterialAdjustmentContext()

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
		countRef.current?.focus()
		const amountCallback = () => {
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

			<Tooltip subText={material.materialType} offset={{ x: 32, y: 0 }}>
				{material.name}
			</Tooltip>

			<span className={`${styles.amount}`}>
				<span
					tabIndex={-1}
					aria-label={`${material.name} minus one button`}
					className={`${styles.countBtn} ${styles.minus}`}
					onClick={(e) => handleCount(e, false)}
				/>
				<span className={`${styles.countContainer}`}>
					<input
						tabIndex={1}
						ref={countRef}
						type={"text"}
						min="0"
						pattern="[0-9]*"
						inputMode="numeric"
						name={`${material.name} quantity input box`}
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
					tabIndex={-1}
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
					tabIndex={2}
					type="text"
					inputMode="numeric"
					name={`${material.name} quantity add/subtract box`}
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
