import { ReactNode } from "react"

import { useArcCatalog, useCharacterCatalog } from "@/components/catalog"

import { LocaleLink } from "@/components/layout"

import { DashFeaturedArcs } from "../DashFeaturedArcs"
import { DashFeaturedCarousel } from "../DashFeaturedCarousel"

import pageStyles from "@/app/[lang]/page.module.css"

export function DashShowcase() {
	const characters = useCharacterCatalog(true)
	const arcs = useArcCatalog(true)

	if (characters.length === 0 && arcs.length === 0) return null

	return (
		<div className={pageStyles.twoColumns}>
			{characters.length > 0 && (
				<ShowcaseSection title="Characters" href="/characters">
					<DashFeaturedCarousel entries={characters} />
				</ShowcaseSection>
			)}
			{arcs.length > 0 && (
				<ShowcaseSection title="Arcs" href="/arcs">
					<DashFeaturedArcs entries={arcs} />
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
				<LocaleLink
					href={href}
					className={`pill-button ${pageStyles.sectionButton}`}>
					VIEW ALL
				</LocaleLink>
			</div>
			{children}
		</section>
	)
}
