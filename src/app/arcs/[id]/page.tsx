import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findArc, getAllArcsList } from "@/data/arcs"

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

	const title = `${arc.name} | Arc Index`
	const description =
		arc.description ||
		`${arc.name} arc effects, stats, and ascension materials on Chiz.Pink`

	return {
		title,
		description,
		openGraph: {
			title: `${arc.name} - Arc Index`,
			description,
		},
		twitter: {
			card: "summary_large_image",
			title: `${arc.name} - Arc Index`,
			description,
		},
	}
}

export default async function ArcInfoPage({ params }: Props) {
	const { id } = await params
	const arc = findArc(id)

	if (!arc) {
		notFound()
	}

	return <ArcProfile arc={arc} />
}
