import { Metadata } from "next"

import { RoutesData } from "@/data/routes"
import { getAllArcsList } from "@/data/arcs"

import { ArcCard, CatalogGrid, sortCatalogItems } from "@/components/catalog"

import pageStyles from "@/app/page.module.css"

export const metadata: Metadata = {
	title: RoutesData["/arcs"].head,
}

export default function Arcs() {
	const arcs = sortCatalogItems(getAllArcsList())

	return (
		<main role="main" className={`page ${pageStyles.page}`}>
			<CatalogGrid>
				{arcs.map((arc) => (
					<ArcCard key={arc.id} arc={arc} />
				))}
			</CatalogGrid>
		</main>
	)
}
