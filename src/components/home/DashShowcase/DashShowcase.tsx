import { ReactNode } from "react"
import Link from "next/link"

import {
	ArcCards,
	CharacterCards,
	useArcCatalog,
	useCharacterCatalog,
} from "@/components/catalog"

import pageStyles from "@/app/page.module.css"
import styles from "./DashShowcase.module.css"

export function DashShowcase() {
	const characters = useCharacterCatalog(true)
	const arcs = useArcCatalog(true)

	if (characters.length === 0 && arcs.length === 0) return null

	return (
		<div className={pageStyles.twoColumns}>
			{characters.length > 0 && (
				<ShowcaseSection title="Featured Characters" href="/characters">
					<CharacterCards entries={characters} />
				</ShowcaseSection>
			)}
			{arcs.length > 0 && (
				<ShowcaseSection title="Featured Arcs" href="/arcs">
					<ArcCards entries={arcs} />
				</ShowcaseSection>
			)}
		</div>
	)
}

function ShowcaseSection({
	title,
	href,
	children,
}: {
	title: string
	href: string
	children: ReactNode
}) {
	return (
		<section className={`metallic-panel ${pageStyles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<h2 className={pageStyles.sectionTitle}>{title}</h2>
				<Link
					href={href}
					className={`pill-button ${pageStyles.sectionButton}`}>
					VIEW ALL
				</Link>
			</div>
			<div className={`inset-control ${styles.cards}`}>{children}</div>
		</section>
	)
}
