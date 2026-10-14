import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { CharacterCatalog } from "@/components/catalog"

import pageStyles from "@/app/page.module.css"

export const metadata: Metadata = {
	title: RoutesData["/characters"].head,
}

export default function Characters() {
	return (
		<main role="main" className={`page ${pageStyles.page}`}>
			<CharacterCatalog />
		</main>
	)
}
