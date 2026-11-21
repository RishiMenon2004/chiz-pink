import inventoryPageStyles from "@/app/[lang]/inventory/page.module.css"
import plannerArcStyles from "@/components/planner/ArcBox/plannerArcBox.module.css"
import plannerMaterialsListStyles from "@/components/planner/MaterialsList/plannerMaterialsList.module.css"
import plannerButtonsStyles from "@/components/planner/PlannerBoxButtonsContainer/plannerBoxButtonsContainer.module.css"
import plannerBoxStyles from "@/components/planner/RenderPlanner/plannerBox.module.css"
import renderPlannerStyles from "@/components/planner/RenderPlanner/renderPlanner.module.css"

import skeletonStyles from "../loadingSkeleton.module.css"

const REQUIRED_MATERIAL_TILES = Array.from({ length: 12 }, (_, i) => i)
const PLANNER_CARDS = [0, 1, 2]
const CARD_MATERIAL_TILES = Array.from({ length: 8 }, (_, i) => i)

export default function PlannerLoading() {
	return (
		<main
			className={`page ${renderPlannerStyles.page}`}
			aria-busy="true">
			<div className={`metallic-panel ${inventoryPageStyles.matGroup}`}>
				<div className={skeletonStyles.reqSummary}>
					<div
						className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.reqTitleBar}`}
					/>
				</div>
				<div
					className={`${plannerBoxStyles.plannerRequiredMaterialsBox} ${renderPlannerStyles.plannerRequiredMaterialsBox}`}>
					<div className={plannerMaterialsListStyles.materialsList}>
						{REQUIRED_MATERIAL_TILES.map((index) => (
							<div
								key={index}
								className={`${skeletonStyles.shimmerDark} ${skeletonStyles.portraitTile}`}
							/>
						))}
					</div>
				</div>
			</div>

			<div className={renderPlannerStyles.plannerGrid}>
				{PLANNER_CARDS.map((cardIndex) => (
					<div key={cardIndex} className={plannerBoxStyles.plannerBoxContainer}>
						<div className={plannerBoxStyles.plannerBox}>
							<div
								className={`metallic-panel ${plannerBoxStyles.infoContainer} ${plannerArcStyles.infoContainer}`}>
								<div className={plannerArcStyles.arcInfoTop}>
									<div
										className={`${plannerArcStyles.arcImageContainer} ${skeletonStyles.plannerAvatarOverride}`}
									/>
									<div className={plannerArcStyles.arcStatsSection}>
										<div
											className={`${plannerArcStyles.arcStatsName} ${skeletonStyles.plannerNameBar}`}
										/>
										<div className={skeletonStyles.plannerLevelRow}>
											<div
												className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.plannerLevelLabel}`}
											/>
											<div
												className={`${skeletonStyles.shimmerDark} ${skeletonStyles.plannerLevelSelect}`}
											/>
										</div>
										<div className={skeletonStyles.plannerLevelRow}>
											<div
												className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.plannerLevelLabel}`}
											/>
											<div
												className={`${skeletonStyles.shimmerDark} ${skeletonStyles.plannerLevelSelect}`}
											/>
										</div>
									</div>
								</div>

								<div className={skeletonStyles.plannerSkillStack}>
									<div
										className={`${skeletonStyles.shimmerDark} ${skeletonStyles.plannerSkillBar}`}
										style={{ width: "78%" }}
									/>
									<div
										className={`${skeletonStyles.shimmerDark} ${skeletonStyles.plannerSkillBar}`}
										style={{ width: "45%" }}
									/>
								</div>

								<div
									className={`${plannerBoxStyles.plannerSectionLabel} ${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.plannerMatsHeading}`}
								/>

								<div className={plannerBoxStyles.plannerRequiredMaterialsBox}>
									<div className={plannerMaterialsListStyles.materialsList}>
										{CARD_MATERIAL_TILES.map((tileIndex) => (
											<div
												key={tileIndex}
												className={`${skeletonStyles.shimmerDark} ${skeletonStyles.portraitTile}`}
											/>
										))}
									</div>
								</div>
							</div>

							<div
								className={`${plannerButtonsStyles.buttonsContainer} ${skeletonStyles.inert}`}
								aria-hidden="true">
								<div className={plannerButtonsStyles.plannerButton} />
								<div className={plannerButtonsStyles.plannerButton} />
								<div className={plannerButtonsStyles.dragPoint} />
								<div className={plannerButtonsStyles.plannerButton} />
							</div>
						</div>
					</div>
				))}
			</div>
		</main>
	)
}
