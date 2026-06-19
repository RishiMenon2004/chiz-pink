"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { InventoryFilter, InventoryGroup, inventorySort } from "@/app/inventory/inventoryFilters"
import { getInventoryList } from "@/database/materialLists"
import styles from "@/app/inventory/page.module.css"

const MaterialItemBox = dynamic(() => import('@/components/MaterialItemBox'), { ssr: false })

export default function PopulateInventory() {
	const [filter, setFilter] = useState<InventoryFilter>("Default")
	const [group, setGroup] = useState<InventoryGroup>("Default")
	const [sort, setSort] = useState<inventorySort>("Default")

	return (<>
		<div className={styles.filterToolbar}></div>
		{Object.values(getInventoryList()).map((material, index) => {
			if (filter === material.materialType || filter === material.rarity || filter === "Default" || (filter === "Required") && false) {
				return <MaterialItemBox key={index} material={material}/>
			}
		})}
	</>)
}
