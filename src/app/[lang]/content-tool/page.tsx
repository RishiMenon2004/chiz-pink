import { Metadata } from "next"
import { notFound } from "next/navigation"

import type { ContentToolOptions } from "@/types/content"
import type { Material } from "@/types/item"

import { patchTimings } from "@/data/activities/events"
import { getAllArcsList } from "@/data/arcs"
import { EnumArcType } from "@/data/arcs/arc"
import { getAllCharactersList } from "@/data/characters"
import { EnumCharacterElement } from "@/data/characters/character"
import { EnumMaterialType } from "@/data/items/item"
import * as materials from "@/data/items/materials"

import { listIntakeVersions, loadContent } from "./actions"
import { RenderContentTool } from "./RenderContentTool"

// A dev tool for writing content-intake/<version>/content.json. It writes
// to the repo, so it only exists under `npm run dev`.
export const metadata: Metadata = {
	title: "Content tool",
	robots: { index: false },
}

const isMaterial = (value: unknown): value is Material =>
	typeof value === "object" && value !== null && !Array.isArray(value) && "materialType" in value

// "ascLiquidDreamSet" → "Liquid Dream", which content:add matches back to
// the set by name.
function setNames(prefix: "asc" | "talent", type: EnumMaterialType) {
	return Object.entries(materials)
		.filter(([key, value]) => key.startsWith(prefix) && key.endsWith("Set") && Array.isArray(value))
		.filter(([, value]) => (value as readonly Material[])[0]?.materialType === type)
		.map(([key]) =>
			key
				.slice(prefix.length, -"Set".length)
				.replace(/([a-z])([A-Z])/g, "$1 $2")
		)
}

export default async function ContentTool() {
	if (process.env.NODE_ENV !== "development") notFound()

	const allMaterials = Object.values(materials).filter(isMaterial)
	const materialsOfType = (type: EnumMaterialType) =>
		allMaterials.filter((material) => material.materialType === type).map(({ id, name }) => ({ id, name }))

	const options: ContentToolOptions = {
		characters: getAllCharactersList().map(({ id, name }) => ({ id, name })),
		arcs: getAllArcsList().map(({ id, name }) => ({ id, name })),
		elements: Object.values(EnumCharacterElement),
		arcTypes: Object.values(EnumArcType),
		ascensionSets: setNames("asc", EnumMaterialType.CharacterAscension),
		talentSets: setNames("talent", EnumMaterialType.Talent),
		bossDrops: materialsOfType(EnumMaterialType.BossDrop),
		weeklyBossDrops: materialsOfType(EnumMaterialType.WeeklyBossDrop),
		rewards: allMaterials.map(({ id, name, materialType }) => ({ id, name, group: materialType })),
		versionsWithDates: Object.keys(patchTimings),
	}

	const versions = await listIntakeVersions()
	const initialContent = versions[0] ? await loadContent(versions[0]) : null

	return (
		<RenderContentTool
			options={options}
			versions={versions}
			initialContent={initialContent ?? { version: versions[0] ?? "" }}
		/>
	)
}
