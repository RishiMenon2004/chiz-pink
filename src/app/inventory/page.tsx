import { Metadata } from "next"

import { RoutesData } from "@/database/routes"

import RenderInventory from "./RenderInventory"

export const metadata: Metadata = {
	title: RoutesData["/inventory"].head,
}

export default function Inventory() {
	return <RenderInventory />
}
