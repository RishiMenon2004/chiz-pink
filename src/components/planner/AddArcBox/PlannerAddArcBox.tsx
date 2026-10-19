"use client"

import {
	ChangeEvent,
	CSSProperties,
	MouseEvent,
	useEffect,
	useRef,
	useState,
} from "react"

import type { KeyMouseEventType } from "@/types"
import type { Arc } from "@/types/weapon"

import { EnumItemLvls, EnumRarity, getItemRarityStyle } from "@/data/items"
import { findArc, EnumArcType, getAllArcsList } from "@/data/arcs"

import { getRarityName, stopPropagation } from "@/helpers"
import {
	getArcBannerThemeColor,
	isItemRevealed,
	sortByStatus,
} from "@/helpers/bannerStatus"
import { fuzzyFilter } from "@/helpers/fuzzyMatch"

import { useNow } from "@/hooks"

import { useAddArcContext } from "@/contexts"

import { ArcIcon } from "@/components/layout"

import styles from "./plannerAddArcBox.module.css"

const LvlSelectGrid = ({
	onChange,
	selectedLvl,
}: {
	onChange: (value: number) => void
	selectedLvl: number
}) => {
	const findValueIndex = () => {
		return Object.values(EnumItemLvls)
			.filter((value) => typeof value === "number")
			.indexOf(selectedLvl)
	}

	return (
		<div
			className={styles.arcLvlSelectGrid}
			style={{ "--selected-child": findValueIndex() + 1 } as CSSProperties}>
			{Object.entries(EnumItemLvls)
				.filter((lvl) => typeof lvl[1] === "number")
				.map((lvl, index) => {
					return (
						<p
							key={lvl[0]}
							onClick={() => onChange(lvl[1] as number)}
							className={
								findValueIndex() === index
									? styles.selectedLvl
									: ""
							}>
							{lvl[0].slice(3).replace("A", "")}
							{lvl[0].includes("A") && (
								<svg
									width="16"
									height="16"
									viewBox="0 0 61 61"
									fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path
										fill={
											selectedLvl >= (lvl[1] as number)
												? "var(--pink)"
												: "white"
										}
										stroke={
											selectedLvl >= (lvl[1] as number)
												? "black"
												: "transparent"
										}
										d="M25.8972 4.29865C27.4211 0.567138 32.7054 0.567127 34.2292 4.29865L40.2527 19.0526C40.405 19.4254 40.7011 19.7215 41.074 19.8738L55.8279 25.8973C59.5594 27.4212 59.5594 32.7054 55.8279 34.2293L41.074 40.2527C40.7011 40.4051 40.405 40.7012 40.2527 41.074L34.2292 55.8279C32.7054 59.5594 27.4211 59.5595 25.8972 55.8279L19.8738 41.074C19.7214 40.7012 19.4254 40.4051 19.0525 40.2527L4.29858 34.2293C0.567077 32.7054 0.567066 27.4212 4.29858 25.8973L19.0525 19.8738C19.4254 19.7215 19.7214 19.4254 19.8738 19.0526L25.8972 4.29865Z"
									/>
								</svg>
							)}
						</p>
					)
				})}
		</div>
	)
}

function ArcTile({ arc, className }: { arc: Arc; className: string }) {
	const themeColor = getArcBannerThemeColor(arc.id)

	return (
		<span
			className={`${styles.arcTile} ${className} ${getItemRarityStyle(arc)}`}
			style={
				themeColor
					? ({
							"--rarity-color": themeColor,
							"--rarity-color-highlight": `color-mix(in srgb, ${themeColor}, white 45%)`,
						} as CSSProperties)
					: undefined
			}>
			<ArcIcon arc={arc} width={256} height={256} />
		</span>
	)
}

const PlannerArcsSelect = () => {
	const { newArcRecord, setNewArcRecord } = useAddArcContext()
	const [selected, setSelected] = useState<Arc>(() =>
		findArc(
			newArcRecord?.id ??
				getAllArcsList().find((arc) => !arc.isPlaceholder)!.id
		)
	)
	const [dropdown, setDropdown] = useState<boolean>(false)
	const selectRef = useRef<HTMLDivElement>(null)
	const searchRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (!dropdown) return
		if (matchMedia("(pointer: fine)").matches) searchRef.current?.focus()

		// Close on taps outside rather than on blur, so dismissing the mobile
		// keyboard doesn't close the dropdown with it.
		const handlePointerDown = (e: PointerEvent) => {
			if (!selectRef.current?.contains(e.target as Node)) setDropdown(false)
		}
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return
			// Runs before the modal's window listener, so the first Escape
			// only closes the dropdown.
			e.stopPropagation()
			setDropdown(false)
		}
		document.addEventListener("pointerdown", handlePointerDown)
		document.addEventListener("keydown", handleKeyDown)
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown)
			document.removeEventListener("keydown", handleKeyDown)
		}
	}, [dropdown])
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [filterQuery, setFilterQuery] = useState<
		[EnumArcType | null, EnumRarity | null]
	>([null, null])
	const now = useNow()

	if (!newArcRecord) return null

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.currentTarget.value)
	}

	const availableArcs = sortByStatus(getAllArcsList(), now).filter((arc) => {
		const matchesType = !filterQuery[0] || arc.type === filterQuery[0]
		const matchesRarity = !filterQuery[1] || arc.rarity === filterQuery[1]

		return (
			!arc.isPlaceholder &&
			isItemRevealed(arc, now) &&
			matchesType &&
			matchesRarity
		)
	})
	const filteredArcs = fuzzyFilter(availableArcs, searchQuery, (arc) => [
		arc.name,
		arc.id,
	])

	const rarityFilters = Object.values(EnumRarity)
		.filter((value) => typeof value === "number")
		.slice(1)

	return (
		<div ref={selectRef} className={styles.arcSelect} onClick={stopPropagation}>
			<button
				type="button"
				className={`inset-control ${styles.arcSelectSelected}`}
				data-open={dropdown}
				aria-expanded={dropdown}
				onClick={(e) => {
					e.stopPropagation()
					setDropdown(!dropdown)
				}}>
				<ArcTile arc={selected} className={styles.arcTileLarge} />
				<span className={styles.arcSelectInfo}>
					<span className={styles.arcSelectName}>{selected.name}</span>
					<span className={styles.arcSelectMeta}>
						{`${getRarityName(selected.rarity)} ${selected.type} Arc`}
					</span>
				</span>
			</button>
			<div
				className={`metallic-panel ${styles.arcSelectOptionDropdown} ${!dropdown && styles.closed}`}>
				<div className={`inset-control ${styles.arcSelectOptionBody}`}>
					<input
						ref={searchRef}
						className={`inset-control ${styles.arcSelectOptionSearchBox}`}
						type="text"
						placeholder="Search"
						value={searchQuery}
						enterKeyHint="done"
						onChange={handleSearch}
						onKeyDown={(e) => {
							if (e.key === "Enter") e.currentTarget.blur()
						}}
					/>
					<div className={styles.arcFilters}>
						<span className={styles.arcFilterLabel}>Type</span>
						<div className={styles.arcFilterRow}>
							{Object.values(EnumArcType).map((arcType) => {
								const isActive = filterQuery[0] === arcType
								const toggleType = (e: MouseEvent) => {
									e.stopPropagation()
									setFilterQuery(([prevType, prevRank]) => {
										if (prevType === arcType) return [null, prevRank]
										return [arcType, prevRank]
									})
								}
								return (
									<button
										type="button"
										key={arcType}
										className={`${styles.arcFilter} ${isActive ? styles.active : ""}`}
										onClick={toggleType}>
										{arcType}
									</button>
								)
							})}
						</div>
						<span className={styles.arcFilterLabel}>Rank</span>
						<div className={styles.arcFilterRow}>
							{rarityFilters.map((arcRank) => {
								const isActive = filterQuery[1] === arcRank
								const toggleRank = (e: MouseEvent) => {
									e.stopPropagation()
									setFilterQuery(([prevType, prevRank]) => {
										if (prevRank === arcRank) return [prevType, null]
										return [prevType, arcRank]
									})
								}
								return (
									<button
										type="button"
										key={arcRank}
										className={`${styles.arcFilter} ${isActive ? styles.active : ""}`}
										onClick={toggleRank}>
										{getRarityName(arcRank)}
									</button>
								)
							})}
						</div>
					</div>
					<div className={styles.arcSelectOptionListContainer}>
						<div className={styles.arcSelectOptionList}>
							{filteredArcs.map((arc) => {
								const addArc = (e: MouseEvent) => {
									e.stopPropagation()
									setSelected(arc)
									setNewArcRecord(() => {
										return { ...newArcRecord, id: arc.id }
									})
									setDropdown(false)
								}
								return (
									<button
										type="button"
										aria-roledescription="option"
										data-selected={arc.id === selected.id}
										className={styles.arcSelectOption}
										key={arc.id}
										onClick={addArc}>
										<ArcTile arc={arc} className={styles.arcTileSmall} />
										<span className={styles.arcSelectInfo}>
											<span className={styles.arcSelectName}>{arc.name}</span>
											<span className={styles.arcSelectMeta}>
												{`${getRarityName(arc.rarity)} ${arc.type} Arc`}
											</span>
										</span>
									</button>
								)
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export function PlannerAddArcBox({
	onCancel,
	onConfirm,
}: {
	onCancel: (e: KeyMouseEventType) => void
	onConfirm: (e: KeyMouseEventType) => void
}) {
	const { newArcRecord, setNewArcRecord } = useAddArcContext()
	if (!newArcRecord) return null
	return (
		<div
			className={`metallic-panel ${styles.plannerAddArcBox}`}
			onClick={stopPropagation}>
			<div className={styles.addArcBoxTitle}>Add Arc</div>
			<PlannerArcsSelect />
			<div className={styles.addArcLvlSection}>
				<span className={styles.addArcLvlLabel}>Current Level</span>
				<LvlSelectGrid
					selectedLvl={newArcRecord.currentLvl}
					onChange={(value: EnumItemLvls) => {
						setNewArcRecord(() => {
							const { targetLvl } = newArcRecord
							return {
								...newArcRecord,
								currentLvl: value,
								targetLvl: value > targetLvl ? value : targetLvl,
							}
						})
					}}
				/>
			</div>
			<div className={styles.addArcLvlSection}>
				<span className={styles.addArcLvlLabel}>Target Level</span>
				<LvlSelectGrid
					selectedLvl={newArcRecord.targetLvl}
					onChange={(value: EnumItemLvls) => {
						setNewArcRecord(() => {
							const { currentLvl } = newArcRecord
							return {
								...newArcRecord,
								targetLvl: value,
								currentLvl:
									value < currentLvl ? value : currentLvl,
							}
						})
					}}
				/>
			</div>
			<span className={styles.addArcButtonsSection}>
				<div
					className={`pill-button always-hover ${styles.addArcCancelButton}`}
					onClick={onCancel}>
					CANCEL
				</div>
				<div
					className={`pill-button always-hover ${styles.addArcConfirmButton}`}
					onClick={onConfirm}>
					ADD
				</div>
			</span>
		</div>
	)
}
