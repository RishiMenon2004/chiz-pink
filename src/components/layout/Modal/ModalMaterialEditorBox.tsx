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

import { QuantityInput } from "@/components/layout"

import { styles } from "@/components/inventory/MaterialBox"

export function MaterialEditorBox({
	material,
}: {
	material: Material
}) {
	const modalContext = useMaterialAdjustmentContext()

	const countRef = useRef<HTMLInputElement>(null)
	const { inventory, updateInventory } = useInventoryStore()
	const itemQuantity = inventory[material.id] || 0
	const [actualQuantity, setActualQuantity] = useState<number>(itemQuantity)

	const [inputFocused, setInputFocused] = useState<boolean>(false)
	const [addSubValue, setAddSubValue] = useState<string>("")

	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const setAmount = useCallback(
		(value: number) => {
			updateInventory({ [material.id]: value })
		},
		[material.id, updateInventory]
	)

	// Register/unregister callback with parent context
	useEffect(() => {
		const amountCallback = () => {
			if (addSubValue) {
				const adjustmentValue = parseInt(addSubValue) || 0
				const newTotal = Math.max(actualQuantity + adjustmentValue, 0)
				setAmount(newTotal)
			}
		}
		modalContext.registerAdjustmentAmount(material.id, amountCallback)
		return () => modalContext.unregisterAdjustmentAmount(material.id)
	}, [addSubValue, actualQuantity, material.id, modalContext, setAmount])

	useEffect(() => {
		setAmount(actualQuantity)
	}, [actualQuantity, setAmount])

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
			const newValue =
				parseInt(e.currentTarget.value.replaceAll(/\D/g, "")) || 0
			setActualQuantity(newValue)
		}
	}

	const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			e.currentTarget.focus()
			setInputFocused(true)
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

	const displayQuantity = inputFocused
		? actualQuantity
		: itemQuantity + (parseInt(addSubValue) || 0)

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

			<QuantityInput
				name={material.name}
				styles={styles}
				inputRef={countRef}
				value={displayQuantity}
				onChange={handleEdit}
				onFocus={handleFocus}
				onBlur={() => setInputFocused(false)}
				onKeyDown={handleKeyDown}
				onInputClick={(e) => {
					e.stopPropagation()
					hideTooltip()
				}}
				onIncrement={(e) => handleCount(e, true)}
				onDecrement={(e) => handleCount(e, false)}
			/>

			<span className={`${styles.amount}`}>
				<span
					className={`${styles.countBtn} ${styles.addSub}`}
					style={{ pointerEvents: "none" }}
				/>
				<input
					tabIndex={0}
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
