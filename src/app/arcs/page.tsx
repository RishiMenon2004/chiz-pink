import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { ArcCatalog } from "@/components/catalog"

export const metadata: Metadata = {
	title: RoutesData["/arcs"].head,
}

export default function Arcs() {
	return <ArcCatalog />
}
