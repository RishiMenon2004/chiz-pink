"use client"

import { ChangeEvent, CSSProperties, MouseEvent, useState } from "react"

import type { ModalEventType } from "@/types"
import type { Arc } from "@/types/weapon"

import { EnumItemLvls, EnumRarity, getItemRarityStyle } from "@/data/items"
import { findArc, EnumArcType, getAllArcsList } from "@/data/arcs"

import { getRarityName, createSearchString } from "@/helpers"

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

const PlannerArcsSelect = () => {
	const { newArcRecord, setNewArcRecord } = useAddArcContext()
	const [selected, setSelected] = useState<Arc>(findArc(newArcRecord.id))
	const [dropdown, setDropdown] = useState<boolean>(false)
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [filterQuery, setFilterQuery] = useState<
		[EnumArcType | null, EnumRarity | null]
	>([null, null])

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.currentTarget.value)
	}

	const filteredArcs = getAllArcsList().filter((arc) => {
		const matchesType = !filterQuery[0] || arc.type === filterQuery[0]
		const matchesRarity = !filterQuery[1] || arc.rarity === filterQuery[1]
		const searchTarget = createSearchString<Arc>(arc, ["id", "name"])
		const cleanSearchQuery = searchQuery
			.toLowerCase()
			.replaceAll(/[_\s]/g, "")
		const matchesSearch = searchTarget.includes(cleanSearchQuery)

		return matchesType && matchesRarity && matchesSearch
	})

	const rarityFilters = Object.values(EnumRarity)
		.filter((value) => typeof value === "number")
		.slice(1)

	return (
		<div
			className={styles.arcSelect}
			aria-roledescription="select"
			onClick={(e) => e.stopPropagation()}>
			<div
				className={`${styles.arcSelectSelected} ${getItemRarityStyle(selected)}`}
				onClick={(e) => {
					e.stopPropagation()
					setDropdown(true)
				}}>
				<div className={styles.arcSelectSelectedImageContainer}>
					<ArcIcon arc={selected} width={512} height={512} />
				</div>
				<p>{selected.name}</p>
				<p>{`${getRarityName(selected.rarity)} ${selected.type} Arc`}</p>
			</div>
			<div
				className={`${styles.arcSelectOptionDropdown} ${!dropdown && styles.closed}`}
				onBlur={() => setDropdown(false)}>
				<span className={styles.arcSelectOptionSearchSection}>
					<input
						className={styles.arcSelectOptionSearchBox}
						type="text"
						value={searchQuery}
						onChange={handleSearch}
					/>
					<button onClick={() => setDropdown(false)}>X</button>
				</span>
				<div className={styles.arcTypeFilterList}>
					<div style={{ width: "100%" }}>Filter by Type:</div>
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
							<span
								key={arcType}
								className={`${styles.arcTypeFilter} ${isActive ? styles.active : ""}`}
								onClick={toggleType}>
								{arcType}
							</span>
						)
					})}
				</div>
				<div className={styles.arcTypeFilterList}>
					<div style={{ width: "100%" }}>Filter by Rank:</div>
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
							<span
								key={arcRank}
								className={`${styles.arcTypeFilter} ${isActive ? styles.active : ""}`}
								onClick={toggleRank}>
								{getRarityName(arcRank)}
							</span>
						)
					})}
				</div>
				<div className={styles.arcSelectOptionList}>
					{filteredArcs.map((arc) => {
						const addArc = (e: MouseEvent) => {
							e.stopPropagation()
							setSelected(arc)
							setNewArcRecord((prevArcRecord) => {
								return { ...prevArcRecord, id: arc.id }
							})
							setDropdown(false)
						}
						return (
							<div
								aria-roledescription="option"
								className={styles.arcSelectOption}
								key={arc.id}
								onClick={addArc}>
								<ArcIcon
									arc={arc}
									width={512}
									height={512}
									className={getItemRarityStyle(arc)}
								/>
								<p>{arc.name}</p>
								<p>
									{`${getRarityName(arc.rarity)} ${arc.type} Arc`}
								</p>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export function PlannerAddArcBox({
	onCancel,
	onConfirm,
}: {
	onCancel: (e: ModalEventType) => void
	onConfirm: (e: ModalEventType) => void
}) {
	const { newArcRecord, setNewArcRecord } = useAddArcContext()
	return (
		<div
			className={`metallic-panel ${styles.plannerAddArcBox}`}
			onClick={(e) => e.stopPropagation()}>
			<div className={styles.addArcBoxTitle}>Add Arc</div>
			<PlannerArcsSelect />
			<div className={styles.addArcLvlSection}>
				<span>Current Lvl.</span>
				<LvlSelectGrid
					selectedLvl={newArcRecord.currentLvl}
					onChange={(value: EnumItemLvls) => {
						setNewArcRecord((prevArcRecord) => {
							const { targetLvl } = prevArcRecord
							return {
								...prevArcRecord,
								currentLvl: value,
								targetLvl: value > targetLvl ? value : targetLvl,
							}
						})
					}}
				/>
			</div>
			<div className={styles.addArcLvlSection}>
				<span>Target Lvl.</span>
				<LvlSelectGrid
					selectedLvl={newArcRecord.targetLvl}
					onChange={(value: EnumItemLvls) => {
						setNewArcRecord((prevArcRecord) => {
							const { currentLvl } = prevArcRecord
							return {
								...prevArcRecord,
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
					className={`pill-button ${styles.addArcCancelButton}`}
					onClick={onCancel}>
					CANCEL
				</div>
				<div
					className={`pill-button ${styles.addArcConfirmButton}`}
					onClick={onConfirm}>
					ADD
				</div>
			</span>
		</div>
	)
}
