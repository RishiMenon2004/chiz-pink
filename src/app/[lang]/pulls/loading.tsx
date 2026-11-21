import bannerSelectorStyles from "@/components/pulls/BannerSelector/bannerSelector.module.css"
import importStyles from "@/components/pulls/ImportSection/importSection.module.css"
import pullsListStyles from "@/components/pulls/PullsListSection/pullsListSection.module.css"
import rateUpStyles from "@/components/pulls/RateUpSection/rateUpSection.module.css"
import statsStyles from "@/components/pulls/StatsSection/statsSection.module.css"

import pageStyles from "./page.module.css"
import skeletonStyles from "../loadingSkeleton.module.css"

const PULL_ROWS = Array.from({ length: 8 }, (_, i) => i)
const STAT_TILES = [0, 1, 2, 3]
const RATEUP_TILES = Array.from({ length: 6 }, (_, i) => i)

export default function PullsLoading() {
	return (
		<main className={`page ${pageStyles.page}`} aria-busy="true">
			<div className={bannerSelectorStyles.bannerSelection} aria-hidden="true">
				<div
					className={`${bannerSelectorStyles.bannerSelect} ${bannerSelectorStyles.selected} ${skeletonStyles.shimmerPink}`}
				/>
				<div
					className={`${bannerSelectorStyles.bannerSelect} ${skeletonStyles.shimmerPink}`}
				/>
				<div
					className={`${bannerSelectorStyles.bannerSelect} ${skeletonStyles.shimmerPink}`}
				/>
			</div>

			{/* Left column: Pulls List + Stats */}
			<div className={pageStyles.column}>
				<div
					className={`metallic-panel ${pageStyles.section} ${pullsListStyles.pullsSection}`}>
					<div className={pageStyles.sectionTitleRow}>
						<div
							className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.pullsTitleBar}`}
						/>
						<div
							className={`inset-control ${pullsListStyles.searchField} ${skeletonStyles.shimmerDark}`}
						/>
					</div>
					<div className={`inset-control ${skeletonStyles.pullsRowsWrap}`}>
						{PULL_ROWS.map((index) => (
							<div
								key={index}
								className={`${skeletonStyles.shimmerDark} ${skeletonStyles.pullsRow}`}
							/>
						))}
					</div>
				</div>

				<div
					className={`metallic-panel ${pageStyles.section} ${statsStyles.statsSection}`}>
					<div className={pageStyles.sectionTitleRow}>
						<div
							className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.pullsTitleBar}`}
						/>
						<div
							className={`inset-control ${skeletonStyles.shimmerDark} ${skeletonStyles.pullsTabsBar}`}
						/>
					</div>
					<div className={`inset-control ${statsStyles.statsContent}`}>
						<div className={statsStyles.statGrid}>
							{STAT_TILES.map((index) => (
								<div
									key={index}
									className={`${statsStyles.stat} ${skeletonStyles.pullsStatTile}`}
								/>
							))}
						</div>
						<div
							className={`${skeletonStyles.shimmerDark} ${skeletonStyles.pullsMeterBar}`}
						/>
					</div>
				</div>
			</div>

			{/* Right column: Import + Recent S-Ranks */}
			<div className={pageStyles.column}>
				<div
					className={`metallic-panel ${pageStyles.section} ${importStyles.importSection}`}>
					<div className={pageStyles.sectionTitleRow}>
						<div
							className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.pullsTitleBar}`}
						/>
						<div
							className={`inset-control ${skeletonStyles.shimmerDark} ${skeletonStyles.pullsTabsBar}`}
						/>
					</div>
					<div className={importStyles.tabPanel}>
						<div
							className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.importDescBar}`}
						/>
						<div className={`inset-control ${importStyles.importFileBox}`}>
							<div
								className={`${importStyles.importFileDrop} ${skeletonStyles.importDrop}`}
							/>
							<div
								className={`${importStyles.importFileSelect} ${skeletonStyles.importSelectBar}`}>
								<div className={skeletonStyles.importFileSpacer} />
								<div
									className={`pill-button ${importStyles.fileButton} ${skeletonStyles.importFileBtn}`}>
									&nbsp;
								</div>
							</div>
						</div>
						<div
							className={`pill-button ${importStyles.importButton} ${skeletonStyles.importSubmitBtn}`}>
							&nbsp;
						</div>
					</div>
				</div>

				<div
					className={`metallic-panel ${pageStyles.section} ${rateUpStyles.rateupSection}`}>
					<div className={pageStyles.sectionTitleRow}>
						<div
							className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.pullsTitleBar}`}
						/>
						<div
							className={`${skeletonStyles.shimmerLight} ${skeletonStyles.block} ${skeletonStyles.rateupFilterBar}`}
						/>
					</div>
					<div className={`inset-control ${rateUpStyles.rateupBannerList}`}>
						<div className={rateUpStyles.rateupBanner}>
							<div
								className={`${skeletonStyles.shimmerDark} ${skeletonStyles.block} ${skeletonStyles.rateupBannerTitle}`}
							/>
							<hr />
							<div className={rateUpStyles.rateupList}>
								{RATEUP_TILES.map((index) => (
									<div
										key={index}
										className={`${rateUpStyles.rateupItem} ${skeletonStyles.rateupTile}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
