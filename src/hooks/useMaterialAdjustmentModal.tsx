"use client"

import MaterialAdjustmentBox, {
	MatAdjustmentContext,
	MatAdjustmentContextType,
} from "@/components/inventory/ModalMaterialEditorBox"
import ModalContainer, {
	ModalEventType,
} from "@/components/layout/ModalContainer"
import { Material } from "@/database/items"
import { useRef, useState } from "react"
import { createPortal } from "react-dom"

export function useMaterialAdjustmentModal() {
	const [showMaterialEditorModal, setShowMaterialEditorModal] =
		useState<boolean>(false)

	const modalCallbacks = useRef<Map<string, () => void>>(new Map())

	const showModal = () => {
		setShowMaterialEditorModal(true)
	}

	const handleCloseModal = (e: ModalEventType) => {
		e.stopPropagation()
		modalCallbacks.current.forEach((callback) => callback())
		setShowMaterialEditorModal(false)
	}

	const contextValue: MatAdjustmentContextType = {
		registerAdjustmentAmount: (id, callback) =>
			modalCallbacks.current.set(id, callback),
		unregisterAdjustmentAmount: (id) => modalCallbacks.current.delete(id),
	}

	const MaterialAdjustmentModal = ({
		materials,
		className,
	}: {
		materials: Material[]
		className: string | undefined
	}) => {
		return (
			showMaterialEditorModal &&
			createPortal(
				<MatAdjustmentContext.Provider value={contextValue}>
					<ModalContainer onClose={handleCloseModal}>
						<div className={className}>
							{materials.map((material, index) => {
								return (
									<MaterialAdjustmentBox
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

	return { MaterialAdjustmentModal, showModal }
}
