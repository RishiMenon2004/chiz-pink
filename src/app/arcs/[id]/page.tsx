"use client"

import { useParams } from "next/navigation"

import { findArc } from "@/data/arcs"
import { parseDescription } from "@/helpers"

export default function ArcInfoPage() {
	const params = useParams()
	const arc = findArc(params?.id as string)

	if (!arc) {
		return <div>Arc not found.</div>
	}

	return (
		<div className="page">
			<h1>{arc.name}</h1>
			{arc.description && parseDescription(arc.description, 1)}
			<h2>{arc.effect.name}</h2>
			<div>
				{parseDescription(arc.effect.description, 1, arc.effect.values)}
			</div>
		</div>
	)
}
