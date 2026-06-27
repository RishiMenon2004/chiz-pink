"use client"

import {
	ChangeEvent,
	FocusEvent,
	MouseEvent,
	useEffect,
	useRef,
	useState,
	createContext,
	useContext,
	useCallback,
	KeyboardEvent,
} from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useInventoryStore, useTooltip } from "@/hooks"
import { Material } from "@/database/materials"
import { allInventoryMaterials } from "@/database/materialLists"
import ModalContainer from "@/components/layout/ModalContainer"
import pageStyles from "@/app/inventory/page.module.css"
import styles from "@/components/inventory/inventoryMaterial.module.css"
import { getItemRarityStyle } from "@/database/item"

// Context for managing application of child adjustments
type MultiMatModalContextType = {
	registerMultiMatAmount: (id: string, callback: () => void) => void
	unregisterMultiMatAmount: (id: string) => void
	confirmMultiMatAmounts: () => void
}

const MaterialModalContext = createContext<MultiMatModalContextType>(null!)

const useMultiMatModal = () => {
	const context = useContext(MaterialModalContext)
	if (!context) {
		return {
			registerMultiMatAmount: () => {},
			unregisterMultiMatAmount: () => {},
			confirmMultiMatAmounts: () => {},
		}
	}
	return context
}

type MaterialItemBoxProps = {
	material: Material
	requiredQuantity?: number
	canHaveMultiMat?: boolean
	hadAddSub?: boolean
}

export default function MaterialItemBox({
	material,
	requiredQuantity,
	canHaveMultiMat = true,
	hadAddSub,
}: MaterialItemBoxProps) {
	const [showMultiEditModal, setShowMultiEditModal] = useState<boolean>(false)
	const multiMatAmountCallbacks = useRef<Map<string, () => void>>(new Map())
	const modalContext = useMultiMatModal()
	const [linkedMaterials] = useState<Material[]>(() => {
		const rarityOrder: Material[] = []
		if (material.linkedMaterials) {
			rarityOrder.push(material)
			material.linkedMaterials.forEach((materialId) => {
				rarityOrder.push(allInventoryMaterials[materialId])
			})

			rarityOrder.sort((a, b) => b.rarity - a.rarity)
		}

		return rarityOrder
	})

	const [addSubValue, setAddSubValue] = useState<string>("")

	const countRef = useRef<HTMLInputElement>(null)
	const { inventory, updateInventory } = useInventoryStore()
	const itemQuantity = inventory[material.id] || 0

	const isMultiMat = material.linkedMaterials && canHaveMultiMat

	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const setAmount = useCallback(
		(value: number) => {
			updateInventory({ [material.id]: value })
		},
		[material.id, updateInventory]
	)

	// Register/unregister amount callback with parent context
	useEffect(() => {
		if (hadAddSub) {
			const amountCallback = () => {
				if (addSubValue) {
					const adjustmentValue = parseInt(addSubValue) || 0
					const newTotal = Math.max(itemQuantity + adjustmentValue, 0)
					setAmount(newTotal)
				}
			}
			modalContext.registerMultiMatAmount(material.id, amountCallback)
			return () => modalContext.unregisterMultiMatAmount(material.id)
		}
	}, [
		hadAddSub,
		addSubValue,
		itemQuantity,
		material.id,
		modalContext,
		setAmount,
	])

	const handleCount = (
		e: MouseEvent<HTMLSpanElement>,
		increment: boolean
	) => {
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
			const newValue = parseInt(
				e.currentTarget.value.replaceAll(/\D/g, "")
			)
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
		if (isMultiMat) {
			setShowMultiEditModal(true)
			hideTooltip()
		}
	}

	const handleMultiMatClose = (
		e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
	) => {
		e.stopPropagation()
		// Confirm all children's amounts
		multiMatAmountCallbacks.current.forEach((callback) => callback())
		setShowMultiEditModal(false)
	}

	const handleAddSubChange = (e: ChangeEvent<HTMLInputElement>) => {
		setAddSubValue(e.currentTarget.value)
	}

	const displayQuantity =
		itemQuantity + (hadAddSub ? parseInt(addSubValue) || 0 : 0)

	const contextValue: MultiMatModalContextType = {
		registerMultiMatAmount: (id, callback) =>
			multiMatAmountCallbacks.current.set(id, callback),
		unregisterMultiMatAmount: (id) =>
			multiMatAmountCallbacks.current.delete(id),
		confirmMultiMatAmounts: () =>
			multiMatAmountCallbacks.current.forEach((cb) => cb()),
	}

	return (
		<div
			className={`${styles.materialBox} ${getItemRarityStyle(material, styles)} ${isMultiMat ? styles.multi : ""}`}
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

			{showMultiEditModal &&
				createPortal(
					<MaterialModalContext.Provider value={contextValue}>
						<ModalContainer onClose={handleMultiMatClose}>
							<div className={pageStyles.multiMatContainer}>
								{linkedMaterials.map(
									(linkedMaterial, index) => {
										return (
											<MaterialItemBox
												key={index}
												material={linkedMaterial}
												canHaveMultiMat={false}
												hadAddSub
											/>
										)
									}
								)}
							</div>
						</ModalContainer>
					</MaterialModalContext.Provider>,
					document.body
				)}

			<Tooltip
				subText={material.materialType}
				offset={isMultiMat ? { x: 24, y: -24 } : { x: 8, y: -8 }}>
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
			{hadAddSub && (
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
			)}
		</div>
	)
}
