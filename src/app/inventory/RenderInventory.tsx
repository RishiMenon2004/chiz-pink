"use client"

import { ChangeEvent, CSSProperties, ReactNode, useState } from "react"
import dynamic from "next/dynamic"
import { EnumRarity } from "@/database/item"
import { EnumMaterialType } from "@/database/materials"
import { InventoryFilter, InventoryGroup, InventoryRarityFilter, InventorySort } from "@/database/inventoryFilters"
import useInventoryFilters from "@/hooks/useInventoryFilters"
import styles from "@/app/inventory/page.module.css"
import useInventoryStore from "@/hooks/useInventoryStore"

const MaterialItemBox = dynamic(() => import('@/components/MaterialItemBox'), { ssr: false })

enum RarityRank {
	Common = "C-Rank",
	Uncommon = "B-Rank",
	Rare = "A-Rank",
	Epic = "S-Rank",
}

export function EmptyFilter({children}: {children: ReactNode}) {
	return <div style={{marginBlock: "1rem", opacity: 0.75}}>{children}</div>
}

export default function RenderInventory() {
	const [filter, setFilter] = useState<InventoryFilter>("default")
	const [rarityFilter, setRarityFilter] = useState<InventoryRarityFilter>("default")
	const [group, setGroup] = useState<InventoryGroup>("default")
	const [sort, setSort] = useState<InventorySort>("default")
	const [sortReverse, setSortReverse] = useState<boolean>(false)
	const [isToolbarOpen, setIsToolbarOpen] = useState<boolean>(false)

	const filters: {filter: InventoryFilter, rarity: InventoryRarityFilter, sorting: InventorySort, sortReverse: boolean} = {filter, rarity: rarityFilter, sorting: sort, sortReverse}

	const {inventory: inventoryStore} = useInventoryStore()
	const filteredInventory = useInventoryFilters(filters)

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

	function mapMaterial() {
		if (filteredInventory.length > 0) {
			switch (group) {
				case "rarity": {
					const ranks = Object.entries(EnumRarity).filter(v => typeof v[1] === "number")
					const groups = ranks.map((rarity, index) => {
						const filteredRarity = filteredInventory.filter((material) => material.rarity === rarity[1])
						if (filteredRarity.length > 0) {
							return <details key={rarity[1]} className={styles.matGroup} open>
								<summary>{Object.values(RarityRank).at(index)}</summary>
								<div className={styles.materialList}>
									{filteredRarity.map((material) => {
										return <MaterialItemBox key={material.id} material={material}/>
									})}
								</div>
							</details>
						}
					}).reverse()
					return groups
				}

				case "type": {
					const types = Object.values(EnumMaterialType)
					const groups = types.map(type => {
						const filteredType = filteredInventory.filter(material => material.materialType === type)
						if (filteredType.length > 0) {
							return <details key={type} className={styles.matGroup} open>
								<summary>{type}</summary>
								
									<div className={styles.materialList}>
										{filteredType.map(material => {
											return <MaterialItemBox key={material.id} material={material}/>
										})}
									</div>
							</details>
						}
					})
					return groups
				}

				case "owned": {
					const materials = filteredInventory
					const ownedMats = materials.filter(mat => (inventoryStore[mat.id] || 0) > 0)
					const unownedMats = materials.filter(mat => !ownedMats.includes(mat))

					const groups = [
						<details key={"owned"} className={styles.matGroup} open>
							<summary>Owned</summary>
							{ ownedMats.length > 0 ? 
								<div className={styles.materialList}>
									{ownedMats.map(material => {
										return <MaterialItemBox key={material.id} material={material}/>
									})}
								</div>
								: <EmptyFilter>
									S-sorry... You don&apos;t seem to own anything.
								</EmptyFilter>
							}
						</details>
					]

					if (unownedMats.length > 0 ) {
						groups.push(<details key={"unowned"} className={styles.matGroup} open>
							<summary>Not Owned</summary>
							<div className={styles.materialList}>
								{unownedMats.map(material => {
									return <MaterialItemBox key={material.id} material={material}/>
								})}
							</div>
						</details>)
					}

					return groups
				}

				case "default":
				default: {
					const materials = filteredInventory
					const groups = [
						<div key={"default"} className={styles.materialList}>
							{materials.map((material) => {
								return <MaterialItemBox key={material.id} material={material}/>
							})}
						</div>
					]
					return groups
				}
			}
		} else {
			return <EmptyFilter>
				I-I can&apos;t seem to find anything with those filters. Would you like to <a onClick={clearAllFilters} className="btn-anchor">try again?</a>
			</EmptyFilter>
		}
	}

	return (<>
		<div className={`${styles.filterToolbar} ${isToolbarOpen ? styles.toolbarOpen : ""}`}>
			{/* Regular Filter */}
			<div className={styles.filterSection}>
				<span className={styles.filterIcon}
					style={{"--icon-src": "url('/button_icons/filter.png')"} as CSSProperties}/>

				<select name="material-type" value={filter}
					onChange={handleFilterChange}
					style={{cursor: "url('/cursors/filter.png'), pointer"}}>
					<option value={"default"} hidden>Filter By</option>
					<option value={"owned"}>Owned</option>
					<option value={"required"}>Required</option>
					<option value={"acquired"}>Acquired</option> {/* TODO: Add filter and grouping after implementing planner */}
					{Object.values(EnumMaterialType).map((type) => {
						if (type !== EnumMaterialType.Currency) return <option value={type} key={type}>{type}</option>
					})}
				</select>

				<span className={`${styles.filterIcon} ${styles.hasHover}`}
					style={{cursor: "pointer", "--icon-src": "url('/button_icons/cross.png')"} as CSSProperties}
					onClick={() => setFilter("default")}/>
			</div>
			
			{/* Rank Filter */}
			<div className={styles.filterSection}>
				<span className={styles.filterIcon}
					style={{"--icon-src": "url('/button_icons/filter.png')"} as CSSProperties}/>

				<select name="rarity" value={rarityFilter}
					onChange={handleRarityChange}
					style={{cursor: "url('/cursors/filter.png'), pointer"}}>
					<option value={"default"}>All Ranks</option>

					{Object.entries(EnumRarity).filter(v => typeof v[1] === "string").reverse().map((rarity) => {
						const rarityKey = rarity[1] as keyof typeof RarityRank
						const rarityDisp = RarityRank[rarityKey]
						return <option value={rarity[0]} key={rarity[0]}>{rarityDisp}</option>
					})}
				</select>

				<span className={`${styles.filterIcon} ${styles.hasHover}`}
					style={{cursor: "pointer", "--icon-src": "url('/button_icons/cross.png')"} as CSSProperties}
					onClick={() => setRarityFilter("default")}/>
			</div>
			
			{/* Grouping */}
			<div className={styles.filterSection}>
				<span className={styles.filterIcon}
					style={{"--icon-src": "url('/button_icons/group.png')"} as CSSProperties}/>

				<select name="sorting" value={group}
					onChange={handleGroupChange}
					style={{cursor: "url('/cursors/group.png'), pointer"}}>
					<option value={"default"} hidden>Group By</option>
					<option value={"owned"}>By Owned</option>
					<option value={"required"}>By Required</option>
					<option value={"acquired"}>By Acquired</option> {/* TODO: Add filter and grouping after implementing planner */}
					<option value={"type"}>By Type</option>
					<option value={"rarity"}>By Rank</option>
				</select>
				
				<span className={`${styles.filterIcon} ${styles.hasHover}`}
					style={{cursor: "pointer", "--icon-src": "url('/button_icons/cross.png')"} as CSSProperties}
					onClick={() => setGroup("default")}/>
			</div>

			{/* Sorting */}
			<div className={styles.filterSection}>
				<span className={styles.filterIcon}
					style={{"--icon-src": "url('/button_icons/sort.png')"} as CSSProperties}/>

				<select name="sorting" value={sort}
					onChange={handleSortingChange}
					style={{cursor: "url('/cursors/sort.png'), pointer"}}>
					<option value={"default"}>By Rank</option>
					<option value={"owned"}>By Owned</option>
					<option value={"required"}>By Required</option>
					<option value={"type"}>By Type</option>
					<option value={"alphabetical"}>By Name</option>
				</select>
				
				<span className={`${styles.filterIcon} ${styles.hasHover} ${sortReverse && styles.doHover}`}
					style={{cursor: "pointer", "--icon-src": "url('/button_icons/reverse_sort.png')"} as CSSProperties}
					onClick={() => setSortReverse(prev => !prev)}/>
			</div>

			<div className={styles.pullOutTab} onClick={() => setIsToolbarOpen(prev => !prev)}>
				PULL TAB
			</div>
		</div>

		<div className={styles.page}>
			{mapMaterial()}
		</div>
	</>)
}
