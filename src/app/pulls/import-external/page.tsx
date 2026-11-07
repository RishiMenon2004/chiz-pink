import { Metadata } from "next"

import { RoutesData } from "@/data/routes"

import { ExternalImport } from "@/components/pulls"

export const metadata: Metadata = {
	title: RoutesData["/pulls/import-external"].head,
	robots: { index: false, follow: false },
}

export default function ImportExternal() {
	return (
		<main className="page" role="main">
			<ExternalImport />
		</main>
	)
}
