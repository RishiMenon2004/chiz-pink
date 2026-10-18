"use client"

import type { EnumCharacterElement } from "@/data/characters/character"
import type { EnumArcType } from "@/data/arcs/arc"

import { getRarityName } from "@/helpers/getRarityName"

import { PullOutToolbar } from "@/components/layout/PullOutToolbar"

import styles from "@/components/inventory/FilterToolbar/filterToolbar.module.css"
import catalogStyles from "./catalog.module.css"

export type CatalogFilters = {
	search: string
	rarity: number | null
	element: EnumCharacterElement | null
	arcType: EnumArcType | null
}

export type CatalogGroupBy = "rarity" | "element" | "arcType" | null

export const NO_FILTERS: CatalogFilters = {
	search: "",
	rarity: null,
	element: null,
	arcType: null,
}

function FilterSelect<T extends string | number>({
	name,
	allLabel,
	value,
	options,
	onChange,
}: {
	name: string
	allLabel: string
	value: T | null
	options: { value: T; label: string }[]
	onChange: (value: T | null) => void
}) {
	return (
		<div className={`inset-control ${styles.filterSelection}`}>
			<span className={`${styles.filterIcon} ${styles.iconFilter}`} />

			<select
				name={name}
				value={value ?? "default"}
				onChange={(e) => {
					const raw = e.currentTarget.value
					const match = options.find((option) => String(option.value) === raw)
					onChange(match ? match.value : null)
				}}
				className={styles.filterSelect}>
				<option value={"default"}>{allLabel}</option>
				{options.map((option) => (
					<option value={option.value} key={option.value}>
						{option.label}
					</option>
				))}
			</select>

			<span
				className={`${styles.filterIcon} ${styles.hasHover} ${styles.iconCross}`}
				tabIndex={0}
				onClick={() => onChange(null)}
				onKeyDown={(e) => {
					if (e.key === "Enter") onChange(null)
				}}
			/>
		</div>
	)
}

// Same control as the inventory's "Group By" select.
function GroupSelect({
	value,
	options,
	onChange,
}: {
	value: CatalogGroupBy
	options: { value: Exclude<CatalogGroupBy, null>; label: string }[]
	onChange: (value: CatalogGroupBy) => void
}) {
	return (
		<div className={`inset-control ${styles.filterSelection}`}>
			<span className={`${styles.filterIcon} ${styles.iconGroup}`} />

			<select
				name="group by"
				value={value ?? "default"}
				onChange={(e) => {
					const raw = e.currentTarget.value
					onChange(options.find((o) => o.value === raw)?.value ?? null)
				}}
				className={styles.groupSelect}>
				<option value={"default"} hidden>
					Group By
				</option>
				{options.map((option) => (
					<option value={option.value} key={option.value}>
						{option.label}
					</option>
				))}
			</select>

			<span
				className={`${styles.filterIcon} ${styles.hasHover} ${styles.iconCross}`}
				tabIndex={0}
				onClick={() => onChange(null)}
				onKeyDown={(e) => {
					if (e.key === "Enter") onChange(null)
				}}
			/>
		</div>
	)
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// Rank, element and arc type dropdowns in the same pull-out toolbar the
// inventory uses. Options are passed in from the items actually on the
// page, so a rank or type nobody has never shows up as an empty choice.
// Leave `elements` out to hide the element filter and grouping (arcs have
// none).
export function CatalogFilterToolbar({
	filters,
	onChange,
	groupBy,
	onGroupByChange,
	rarities,
	arcTypes,
	elements,
}: {
	filters: CatalogFilters
	onChange: (filters: CatalogFilters) => void
	groupBy: CatalogGroupBy
	onGroupByChange: (groupBy: CatalogGroupBy) => void
	rarities: number[]
	arcTypes: EnumArcType[]
	elements?: EnumCharacterElement[]
}) {
	const hasFilters =
		filters.search !== "" ||
		filters.rarity !== null ||
		filters.element !== null ||
		filters.arcType !== null

	return (
		<PullOutToolbar>
			{/* Full row only when it evens out the grid: characters have four
			    other controls, arcs three (search + 3 pairs up 2x2). */}
			<div
				className={`inset-control ${styles.filterSelection} ${catalogStyles.searchField} ${elements ? catalogStyles.searchFieldWide : ""}`}>
				<input
					type="search"
					name="search"
					placeholder="Search..."
					aria-label="Search by name"
					autoComplete="off"
					value={filters.search}
					onChange={(e) => onChange({ ...filters, search: e.currentTarget.value })}
					className={catalogStyles.searchInput}
				/>

				{filters.search && (
					<span
						className={`${styles.filterIcon} ${styles.hasHover} ${styles.iconCross}`}
						tabIndex={0}
						onClick={() => onChange({ ...filters, search: "" })}
						onKeyDown={(e) => {
							if (e.key === "Enter") onChange({ ...filters, search: "" })
						}}
					/>
				)}
			</div>

			<FilterSelect
				name="filter by rank"
				allLabel="All Ranks"
				value={filters.rarity}
				options={rarities.map((rarity) => ({
					value: rarity,
					label: getRarityName(rarity),
				}))}
				onChange={(rarity) => onChange({ ...filters, rarity })}
			/>

			{elements && (
				<FilterSelect
					name="filter by element"
					allLabel="All Elements"
					value={filters.element}
					options={elements.map((element) => ({
						value: element,
						label: capitalise(element),
					}))}
					onChange={(element) => onChange({ ...filters, element })}
				/>
			)}

			<FilterSelect
				name="filter by arc type"
				allLabel="All Arc Types"
				value={filters.arcType}
				options={arcTypes.map((arcType) => ({
					value: arcType,
					label: arcType,
				}))}
				onChange={(arcType) => onChange({ ...filters, arcType })}
			/>

			<GroupSelect
				value={groupBy}
				options={[
					{ value: "rarity", label: "By Rank" },
					...(elements ? [{ value: "element" as const, label: "By Element" }] : []),
					{
						value: "arcType",
						label: elements ? "By Arc Type" : "By Type",
					},
				]}
				onChange={onGroupByChange}
			/>

			<div className={`${styles.clearAllContainer} ${hasFilters && styles.show}`}>
				<button
					className={styles.clearAllBtn}
					disabled={!hasFilters}
					tabIndex={hasFilters ? 0 : -1}
					onClick={() => onChange(NO_FILTERS)}
				/>
			</div>
		</PullOutToolbar>
	)
}
