import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"

import RenderInventory from "./RenderInventory"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/inventory", (await params).lang)
}

export default function Inventory() {
	return <RenderInventory />
}
