import { ChangeEvent, CSSProperties } from "react"

import type {
	FilterByType,
	FilterRarityType,
	GroupByType,
	SortByType,
} from "@/types/inventory"

import { EnumRarity, EnumMaterialType } from "@/data/items"

import { getRarityName } from "@/helpers"

import { useInventoryFilterContext } from "@/contexts"

import { PullOutToolbar } from "@/components/layout"

import styles from "./filterToolbar.module.css"

export function InventoryFilterToolbar() {
	const {
		filter,
		setFilter,
		rarityFilter,
		setRarityFilter,
		group,
		setGroup,
		sort,
		setSort,
		sortReverse,
		setSortReverse,
	} = useInventoryFilterContext()

	const hasFilters = filter !== "default" || rarityFilter !== "default"

	const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setFilter(e.currentTarget.value as FilterByType)
	}

	const handleRarityChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setRarityFilter(e.currentTarget.value as FilterRarityType)
	}

	const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setGroup(e.currentTarget.value as GroupByType)
	}

	const handleSortingChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSortReverse(false)
		setSort(e.currentTarget.value as SortByType)
	}

	const clearAllFilters = () => {
		setFilter("default")
		setRarityFilter("default")
	}

	return (
		<PullOutToolbar>
			{/* Regular Filter */}
			<div className={styles.filterSelection}>
				<span
					className={styles.filterIcon}
					style={
						{
							"--icon-src": "url('/button_icons/filter.png')",
						} as CSSProperties
					}
				/>

				<select
					name="material-type"
					value={filter}
					onChange={handleFilterChange}
					style={{ cursor: "url('/cursors/filter.png'), pointer" }}>
					<option value={"default"} hidden>
						Filter By
					</option>
					<option value={"owned"}>Owned</option>
					<option value={"required"}>Required</option>
					<option value={"acquired"}>Acquired</option>{" "}
					{/* TODO: Add filter and grouping after implementing planner */}
					{Object.values(EnumMaterialType).map((type) => {
						if (type !== EnumMaterialType.Currency)
							return (
								<option value={type} key={type}>
									{type}
								</option>
							)
					})}
				</select>

				<span
					className={`${styles.filterIcon} ${styles.hasHover}`}
					tabIndex={0}
					style={
						{
							cursor: "pointer",
							"--icon-src": "url('/button_icons/cross.png')",
						} as CSSProperties
					}
					onClick={() => setFilter("default")}
					onKeyDown={(e) => {
						if (e.key === "Enter") setFilter("default")
					}}
				/>
			</div>

			{/* Rank Filter */}
			<div className={styles.filterSelection}>
				<span
					className={styles.filterIcon}
					style={
						{
							"--icon-src": "url('/button_icons/filter.png')",
						} as CSSProperties
					}
				/>

				<select
					name="rarity"
					value={rarityFilter}
					onChange={handleRarityChange}
					style={{ cursor: "url('/cursors/filter.png'), pointer" }}>
					<option value={"default"}>All Ranks</option>

					{Object.entries(EnumRarity)
						.filter((v) => typeof v[1] === "number")
						.reverse()
						.map((rarity) => {
							return (
								<option value={rarity[1]} key={rarity[0]}>
									{getRarityName(Number(rarity[1]))}
								</option>
							)
						})}
				</select>

				<span
					className={`${styles.filterIcon} ${styles.hasHover}`}
					tabIndex={0}
					style={
						{
							cursor: "pointer",
							"--icon-src": "url('/button_icons/cross.png')",
						} as CSSProperties
					}
					onClick={() => setRarityFilter("default")}
					onKeyDown={(e) => {
						if (e.key === "Enter") setRarityFilter("default")
					}}
				/>
			</div>

			{/* Grouping */}
			<div className={styles.filterSelection}>
				<span
					className={styles.filterIcon}
					style={
						{
							"--icon-src": "url('/button_icons/group.png')",
						} as CSSProperties
					}
				/>

				<select
					name="sorting"
					value={group}
					onChange={handleGroupChange}
					style={{ cursor: "url('/cursors/group.png'), pointer" }}>
					<option value={"default"} hidden>
						Group By
					</option>
					<option value={"owned"}>By Owned</option>
					<option value={"required"}>By Required</option>
					<option value={"acquired"}>By Acquired</option>{" "}
					{/* TODO: Add filter and grouping after implementing planner */}
					<option value={"type"}>By Type</option>
					<option value={"rarity"}>By Rank</option>
				</select>

				<span
					className={`${styles.filterIcon} ${styles.hasHover}`}
					tabIndex={0}
					style={
						{
							cursor: "pointer",
							"--icon-src": "url('/button_icons/cross.png')",
						} as CSSProperties
					}
					onClick={() => setGroup("default")}
					onKeyDown={(e) => {
						if (e.key === "Enter") setGroup("default")
					}}
				/>
			</div>

			{/* Sorting */}
			<div className={styles.filterSelection}>
				<span
					className={styles.filterIcon}
					style={
						{
							"--icon-src": "url('/button_icons/sort.png')",
						} as CSSProperties
					}
				/>

				<select
					name="sorting"
					value={sort}
					onChange={handleSortingChange}
					style={{ cursor: "url('/cursors/sort.png'), pointer" }}>
					<option value={"default"}>By Rank</option>
					<option value={"owned"}>By Owned</option>
					<option value={"required"}>By Required</option>
					<option value={"type"}>By Type</option>
					<option value={"alphabetical"}>By Name</option>
				</select>

				<span
					className={`${styles.filterIcon} ${styles.hasHover} ${sortReverse && styles.doHover}`}
					tabIndex={0}
					style={
						{
							cursor: "pointer",
							"--icon-src": "url('/button_icons/reverse_sort.png')",
						} as CSSProperties
					}
					onClick={() => setSortReverse((prev) => !prev)}
					onKeyDown={(e) => {
						if (e.key === "Enter") setSortReverse((prev) => !prev)
					}}
				/>
			</div>

			<div
				className={`${styles.clearAllContainer} ${hasFilters && styles.show}`}>
				<button
					className={styles.clearAllBtn}
					disabled={!hasFilters}
					tabIndex={hasFilters ? 0 : -1}
					onClick={clearAllFilters}
				/>
			</div>
		</PullOutToolbar>
	)
}
