import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"
import { RenderSettings } from "./RenderSettings"

// Personal settings: nothing here for search.
type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return {
		...(await buildRouteMetadata("/settings", (await params).lang)),
		robots: { index: false },
	}
}

export default async function Settings({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["settings"]}>
			<RenderSettings />
		</PageMessages>
	)
}
