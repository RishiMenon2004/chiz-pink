"use client"

import getInventory from "@/actions/getInventory"
import { getInventoryList } from "@/database/materialLists"
import dynamic from "next/dynamic"

const MaterialItemBox = dynamic(() => import('@/components/MaterialItemBox'), { ssr: false })

export default function PopulateInventory() {
	const {inventory} = getInventory()

	return Object.values(getInventoryList()).map((material, index) => {
			return <MaterialItemBox key={index} material={material} quantity={inventory[material.id]}/>
		})
}
