import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import RenderInventory from "./RenderInventory"

export const metadata: Metadata = buildRouteMetadata("/inventory")

export default function Inventory() {
	return <RenderInventory />
}
