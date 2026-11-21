import inventoryMaterialStyles from "@/components/inventory/MaterialBox/inventoryMaterial.module.css"
import pullOutToolbarStyles from "@/components/layout/PullOutToolbar/pullOutToolbar.module.css"

import pageStyles from "./page.module.css"
import skeletonStyles from "../loadingSkeleton.module.css"

const TOOLBAR_PILLS = [0, 1, 2, 3]
const MATERIAL_CARDS = Array.from({ length: 12 }, (_, i) => i)

export default function InventoryLoading() {
	return (
		<>
			<div
				className={`${pullOutToolbarStyles.plannerToolbar} ${pullOutToolbarStyles.inventory}`}
				aria-hidden="true">
				{TOOLBAR_PILLS.map((index) => (
					<div
						key={index}
						className={`inset-control ${skeletonStyles.shimmerDark} ${skeletonStyles.invToolbarPill}`}
					/>
				))}
			</div>

			<main
				className={`page ${pageStyles.page}`}
				aria-busy="true">
				<div className={pageStyles.materialList}>
					{MATERIAL_CARDS.map((index) => (
						<div key={index} className={inventoryMaterialStyles.materialBox}>
							<div
								className={`${inventoryMaterialStyles.iconContainer} ${skeletonStyles.invIconOverride}`}
							/>
							<div className={inventoryMaterialStyles.countContainer}>
								<span
									className={`inset-control ${inventoryMaterialStyles.amount} ${skeletonStyles.shimmerDark} ${skeletonStyles.invQtyPill}`}>
									<span className={skeletonStyles.invQtyDot} />
									<span className={skeletonStyles.invQtyDot} />
								</span>
							</div>
						</div>
					))}
				</div>
			</main>
		</>
	)
}
