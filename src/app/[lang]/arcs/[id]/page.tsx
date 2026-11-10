import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findArc, getAllArcsList } from "@/data/arcs"

import { buildMetadata, rankWithArticle } from "@/helpers/metadata"

import { ArcProfile } from "@/components/profile"

type Props = {
	params: Promise<{ id: string }>
}

export async function generateStaticParams() {
	const arcs = getAllArcsList()
	return arcs.map((arc) => ({
		id: arc.id,
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params
	const arc = findArc(id)

	if (!arc) {
		return {
			title: "Arc Not Found",
		}
	}

	const intro = `${arc.name} is ${rankWithArticle(arc.rarity)} ${arc.type} arc in Neverness to Everness.`

	return buildMetadata({
		title: `${arc.name}: NTE Arc Index`,
		description: arc.isPlaceholder
			? `${intro} Details will be announced soon.`
			: `${intro} View it's Stats, passive and materials.`,
		path: `/arcs/${id}`,
		image: {
			url: `/arcs/${id}/opengraph-image`,
			alt: `${arc.name} arc card`,
		},
	})
}

export default async function ArcInfoPage({ params }: Props) {
	const { id } = await params
	const arc = findArc(id)

	if (!arc) {
		notFound()
	}

	return <ArcProfile arc={arc} />
}
