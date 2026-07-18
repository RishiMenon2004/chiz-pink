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
		<div>
			<div>{arc.name}</div>
			{arc.description && parseDescription(arc.description, 1)}
			<div>{arc.effect.name}</div>
			<div>
				{parseDescription(arc.effect.description, 1, arc.effect.values)}
			</div>
		</div>
	)
}
