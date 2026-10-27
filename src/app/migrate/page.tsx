import type { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { RenderMigrate } from "./RenderMigrate"

export const metadata: Metadata = {
	title: RoutesData["/migrate"].head,
	robots: { index: false },
}

export default function MigratePage() {
	return <RenderMigrate />
}
