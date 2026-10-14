import { Metadata } from "next"

import { RoutesData } from "@/data/routes"
import { getAllCharactersList } from "@/data/characters/characterList"

import {
	CatalogGrid,
	CharacterCard,
	sortCatalogItems,
} from "@/components/catalog"

import pageStyles from "@/app/page.module.css"

export const metadata: Metadata = {
	title: RoutesData["/characters"].head,
}

export default function Characters() {
	const characters = sortCatalogItems(getAllCharactersList())

	return (
		<main role="main" className={`page ${pageStyles.page}`}>
			<CatalogGrid>
				{characters.map((character) => (
					<CharacterCard key={character.id} character={character} />
				))}
			</CatalogGrid>
		</main>
	)
}
