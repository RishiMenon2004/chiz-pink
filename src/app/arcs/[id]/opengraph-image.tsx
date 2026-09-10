import { notFound } from "next/navigation"

import { findArc, getAllArcsList } from "@/data/arcs"
import { generateArcOgImage } from "@/helpers/ogImageGenerator"

export const alt = "Arc Weapon"
export const size = {
	width: 1200,
	height: 630,
}
export const contentType = "image/png"

type Props = {
	params: Promise<{ id: string }>
}

export async function generateStaticParams() {
	const arcs = getAllArcsList()
	return arcs.map((arc) => ({
		id: arc.id,
	}))
}

export default async function Image({ params }: Props) {
	const { id } = await params
	const arc = findArc(id)

	if (!arc) {
		notFound()
	}

	return generateArcOgImage(arc)
}
