import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { ArcCatalog } from "@/components/catalog"

import pageStyles from "@/app/page.module.css"

export const metadata: Metadata = {
	title: RoutesData["/arcs"].head,
}

export default function Arcs() {
	return (
		<main role="main" className={`page ${pageStyles.page}`}>
			<ArcCatalog />
		</main>
	)
}
