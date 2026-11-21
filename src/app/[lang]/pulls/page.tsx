import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"
import { RenderPulls } from "./RenderPulls"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/pulls", (await params).lang)
}

export default async function Pulls({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["pulls"]}>
			<RenderPulls />
		</PageMessages>
	)
}
