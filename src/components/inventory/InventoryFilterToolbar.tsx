import { ChangeEvent, CSSProperties, useContext, useState } from "react"
import { EnumRarity } from "@/database/item"
import { EnumMaterialType } from "@/database/materials"
import { InventoryFilter, InventoryGroup, InventoryRarityFilter, InventorySort } from "@/database/inventoryFilters"
import { InventoryFilterContext, RarityRank } from "@/app/inventory/RenderInventory"
import styles from "@/app/inventory/filterToolbar.module.css"

export default function InventoryFilterToolbar() {
	const {
		filter, setFilter,
		rarityFilter, setRarityFilter,
		group, setGroup,
		sort, setSort,
		sortReverse, setSortReverse
	} = useContext(InventoryFilterContext)

	const [isToolbarOpen, setIsToolbarOpen] = useState<boolean>(false)

	const hasFilters = filter !== "default" || rarityFilter !== "default"

	const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setFilter(e.currentTarget.value as InventoryFilter)
	}

	const handleRarityChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setRarityFilter(e.currentTarget.value as InventoryRarityFilter)
	}

	const handleSortingChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSortReverse(false)
		setSort(e.currentTarget.value as InventorySort)
	}

	const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setGroup(e.currentTarget.value as InventoryGroup)
	}

	const clearAllFilters = () => {
		setFilter("default")
		setRarityFilter("default")
	}

	return (<div className={`${styles.filterToolbar} ${isToolbarOpen ? styles.toolbarOpen : ""}`}>
		{/* Regular Filter */}
		<div className={styles.filterSelection}>
			<span className={styles.filterIcon}
				style={{ "--icon-src": "url('/button_icons/filter.png')" } as CSSProperties} />

			<select name="material-type" value={filter}
				onChange={handleFilterChange}
				style={{ cursor: "url('/cursors/filter.png'), pointer" }}>
				<option value={"default"} hidden>Filter By</option>
				<option value={"owned"}>Owned</option>
				<option value={"required"}>Required</option>
				<option value={"acquired"}>Acquired</option> {/* TODO: Add filter and grouping after implementing planner */}
				{Object.values(EnumMaterialType).map((type) => {
					if (type !== EnumMaterialType.Currency) return <option value={type} key={type}>{type}</option>
				})}
			</select>

			<span className={`${styles.filterIcon} ${styles.hasHover}`}
				tabIndex={0}
				style={{ cursor: "pointer", "--icon-src": "url('/button_icons/cross.png')" } as CSSProperties}
				onClick={() => setFilter("default")}
				onKeyDown={(e) => {
					if (e.key === "Enter") setFilter("default")
				}} />
		</div>

		{/* Rank Filter */}
		<div className={styles.filterSelection}>
			<span className={styles.filterIcon}
				style={{ "--icon-src": "url('/button_icons/filter.png')" } as CSSProperties} />

			<select name="rarity" value={rarityFilter}
				onChange={handleRarityChange}
				style={{ cursor: "url('/cursors/filter.png'), pointer" }}>
				<option value={"default"}>All Ranks</option>

				{Object.entries(EnumRarity).filter(v => typeof v[1] === "string").reverse().map((rarity) => {
					const rarityKey = rarity[1] as keyof typeof RarityRank
					const rarityDisp = RarityRank[rarityKey]
					return <option value={rarity[0]} key={rarity[0]}>{rarityDisp}</option>
				})}
			</select>

			<span className={`${styles.filterIcon} ${styles.hasHover}`}
				tabIndex={0}
				style={{ cursor: "pointer", "--icon-src": "url('/button_icons/cross.png')" } as CSSProperties}
				onClick={() => setRarityFilter("default")}
				onKeyDown={(e) => {
					if (e.key === "Enter") setRarityFilter("default")
				}} />
		</div>

		{/* Grouping */}
		<div className={styles.filterSelection}>
			<span className={styles.filterIcon}
				style={{ "--icon-src": "url('/button_icons/group.png')" } as CSSProperties} />

			<select name="sorting" value={group}
				onChange={handleGroupChange}
				style={{ cursor: "url('/cursors/group.png'), pointer" }}>
				<option value={"default"} hidden>Group By</option>
				<option value={"owned"}>By Owned</option>
				<option value={"required"}>By Required</option>
				<option value={"acquired"}>By Acquired</option> {/* TODO: Add filter and grouping after implementing planner */}
				<option value={"type"}>By Type</option>
				<option value={"rarity"}>By Rank</option>
			</select>

			<span className={`${styles.filterIcon} ${styles.hasHover}`}
				tabIndex={0}
				style={{ cursor: "pointer", "--icon-src": "url('/button_icons/cross.png')" } as CSSProperties}
				onClick={() => setGroup("default")}
				onKeyDown={(e) => {
					if (e.key === "Enter") setGroup("default")
				}} />
		</div>

		{/* Sorting */}
		<div className={styles.filterSelection}>
			<span className={styles.filterIcon}
				style={{ "--icon-src": "url('/button_icons/sort.png')" } as CSSProperties} />

			<select name="sorting" value={sort}
				onChange={handleSortingChange}
				style={{ cursor: "url('/cursors/sort.png'), pointer" }}>
				<option value={"default"}>By Rank</option>
				<option value={"owned"}>By Owned</option>
				<option value={"required"}>By Required</option>
				<option value={"type"}>By Type</option>
				<option value={"alphabetical"}>By Name</option>
			</select>

			<span className={`${styles.filterIcon} ${styles.hasHover} ${sortReverse && styles.doHover}`}
				tabIndex={0}
				style={{ cursor: "pointer", "--icon-src": "url('/button_icons/reverse_sort.png')" } as CSSProperties}
				onClick={() => setSortReverse(prev => !prev)}
				onKeyDown={(e) => {
					if (e.key === "Enter") setSortReverse(prev => !prev)
				}} />
		</div>

		<div className={styles.pullOutTab} onClick={() => setIsToolbarOpen(prev => !prev)}>
		</div>

		<div className={`${styles.clearAllContainer} ${hasFilters && styles.show}`}>
			<button className={styles.clearAllBtn} disabled={!hasFilters} tabIndex={hasFilters ? 0 : -1} onClick={clearAllFilters} />
		</div>
	</div>)
}