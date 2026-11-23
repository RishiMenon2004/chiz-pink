import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findArc, getAllArcsList } from "@/data/arcs"

import { getArcName, getArcTypeLabel } from "@/helpers/gameLabels"
import { toLocale } from "@/helpers/locale"
import {
	buildMetadata,
	getMetadataTranslator,
	rankForIntro,
} from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import { ArcProfile } from "@/components/profile"

type Props = {
	params: Promise<{ lang: string; id: string }>
}

export async function generateStaticParams() {
	const arcs = getAllArcsList()
	return arcs.map((arc) => ({
		id: arc.id,
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { lang, id } = await params
	const t = await getMetadataTranslator(lang)
	const arc = findArc(id)

	if (!arc) {
		return {
			title: t("meta.arc.notFound"),
		}
	}

	const arcName = getArcName(arc, t)
	const { rank, takesAn } = rankForIntro(arc.rarity, t)
	const intro = t(takesAn ? "meta.arc.introAn" : "meta.arc.introA", {
		name: arcName,
		rank,
		type: getArcTypeLabel(arc.type, t),
	})

	return buildMetadata({
		title: t("meta.arc.title", { name: arcName }),
		description: t(
			arc.isPlaceholder ? "meta.arc.comingSoon" : "meta.arc.released",
			{ intro },
		),
		path: `/arcs/${id}`,
		image: {
			url: `/arcs/${id}/opengraph-image`,
			alt: t("meta.arc.imageAlt", { name: arcName }),
		},
	}, t)
}

export default async function ArcInfoPage({ params }: Props) {
	const { lang, id } = await params
	const arc = findArc(id)

	if (!arc) {
		notFound()
	}

	return (
		<PageMessages lang={lang} namespaces={["profile"]}>
			<ArcProfile arc={arc} locale={toLocale(lang)} />
		</PageMessages>
	)
}
