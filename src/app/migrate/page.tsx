import type { Metadata } from "next"

import { RenderMigrate } from "./RenderMigrate"

export const metadata: Metadata = {
	title: "Moving to chiz.pink",
	robots: { index: false },
}

export default function MigratePage() {
	return <RenderMigrate />
}
