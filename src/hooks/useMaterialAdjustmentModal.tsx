"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import type { KeyMouseEventType } from "@/types"
import type { Material } from "@/types/item"

import { MatAdjustmentContext } from "@/contexts"

import { ModalContainer, MaterialEditorBox } from "@/components/layout"

export function useMaterialEditorModal(
	materials: Material[],
	className: string | undefined
) {
	const [showMaterialEditorModal, setShowMaterialEditorModal] =
		useState<boolean>(false)

	const modalCallbacks = useRef<Map<string, () => void>>(new Map())

	const showModal = () => {
		setShowMaterialEditorModal(true)
	}

	const handleCloseModal = (e: KeyMouseEventType) => {
		e.stopPropagation()
		modalCallbacks.current.forEach((callback) => callback())
		setShowMaterialEditorModal(false)
	}

	const contextValue = {
		registerAdjustmentAmount: (id: string, callback: () => void) =>
			modalCallbacks.current.set(id, callback),
		unregisterAdjustmentAmount: (id: string) =>
			modalCallbacks.current.delete(id),
	}

	const materialListRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (!showMaterialEditorModal) return
		materialListRef.current?.querySelector("input")?.focus()
	}, [showMaterialEditorModal])

	const ModalComponent = () => {
		return (
			showMaterialEditorModal &&
			createPortal(
				<MatAdjustmentContext.Provider value={contextValue}>
					<ModalContainer onClickOut={handleCloseModal}>
						<div ref={materialListRef} className={className}>
							{materials.map((material, index) => {
								return (
									<MaterialEditorBox
										key={index}
										material={material}
									/>
								)
							})}
						</div>
					</ModalContainer>
				</MatAdjustmentContext.Provider>,
				document.body
			)
		)
	}

	return { ModalComponent, showModal }
}
