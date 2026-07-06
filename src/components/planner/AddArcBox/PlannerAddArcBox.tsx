"use client"

import Image from "next/image"
import { ChangeEvent, CSSProperties, useState } from "react"

import type { ModalEventType } from "@/types"
import type { Arc } from "@/types/weapon"

import { EnumItemLvls, EnumRarity, getItemRarityStyle } from "@/data/items"
import { findArc, getAllArcs, EnumArcType } from "@/data/arcs"

import { getRarityName } from "@/helpers"

import { useAddArcContext } from "@/contexts"

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

	const allArcsValues = Object.values(getAllArcs())

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.currentTarget.value)
	}

	const filteredArcs = allArcsValues
		.filter((arc) => {
			return filterQuery[0] ? arc.type === filterQuery[0] : true
		})
		.filter((arc) => {
			return filterQuery[1] ? arc.rarity === filterQuery[1] : true
		})
		.filter((arc) => {
			return arc.id
				.replaceAll("_", "")
				.toLocaleLowerCase()
				.concat(arc.name.toLocaleLowerCase())
				.includes(searchQuery.toLocaleLowerCase())
		})

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
					<Image
						src={`/arcs/${selected.imageSrc}`}
						width={512}
						height={512}
						alt={`Arc ${selected.name} icon`}
					/>
				</div>
				<p>{selected.name}</p>
				<p>{`${getRarityName(selected.rarity - 2)} ${selected.type} Arc`}</p>
			</div>
			<div
				className={`${styles.arcSelectOptionDropdown} ${!dropdown && styles.closed}`}
				onBlur={() => setDropdown(false)}>
				<input
					className={styles.arcSelectOptionSearchBox}
					type="text"
					value={searchQuery}
					onChange={handleSearch}
				/>
				<div className={styles.arcTypeFilterList}>
					<div style={{ width: "100%" }}>Filter by Type:</div>
					{Object.values(EnumArcType).map((arcType) => {
						return (
							<span
								key={arcType}
								className={`${styles.arcTypeFilter} ${filterQuery[0] === arcType && styles.active}`}
								onClick={(e) => {
									e.stopPropagation()
									setFilterQuery(([prevType, prevRank]) => {
										if (prevType === arcType)
											return [null, prevRank]
										return [arcType, prevRank]
									})
								}}>
								{arcType}
							</span>
						)
					})}
				</div>
				<div className={styles.arcTypeFilterList}>
					<div style={{ width: "100%" }}>Filter by Rank:</div>
					{Object.values(EnumRarity)
						.filter((value) => typeof value === "number")
						.slice(1)
						.map((arcRank) => {
							return (
								<span
									key={arcRank}
									className={`${styles.arcTypeFilter} ${filterQuery[1] === arcRank && styles.active}`}
									onClick={(e) => {
										e.stopPropagation()
										setFilterQuery(([prevType, prevRank]) => {
											if (prevRank === arcRank)
												return [prevType, null]
											return [prevType, arcRank]
										})
									}}>
									{getRarityName(arcRank - 2)}
								</span>
							)
						})}
				</div>
				<div className={styles.arcSelectOptionList}>
					{filteredArcs.map((arc) => {
						return (
							<div
								aria-roledescription="option"
								className={styles.arcSelectOption}
								key={arc.id}
								onClick={() => {
									setSelected(arc)
									setNewArcRecord((prevArcRecord) => {
										return { ...prevArcRecord, id: arc.id }
									})
									setDropdown(false)
								}}>
								<Image
									src={`/arcs/${arc.imageSrc}`}
									width={128}
									height={128}
									alt={`Arc ${arc.name} icon`}
									className={getItemRarityStyle(arc)}
								/>
								<p>{arc.name}</p>
								<p>
									{`${getRarityName(arc.rarity - 2)} ${arc.type} Arc`}
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
	onConfirm,
}: {
	onConfirm: (e: ModalEventType) => void
}) {
	const { newArcRecord, setNewArcRecord } = useAddArcContext()
	return (
		<div
			className={styles.plannerAddArcBox}
			onClick={(e) => e.stopPropagation()}>
			<div className={styles.addArcBoxTitle}>Adding new Arc</div>
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
			<div className={styles.addArcConfirmButton} onClick={onConfirm}>
				ADD
			</div>
		</div>
	)
}
