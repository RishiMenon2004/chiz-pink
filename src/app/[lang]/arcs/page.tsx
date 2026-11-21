import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import { ArcCatalog } from "@/components/catalog"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/arcs", (await params).lang)
}

export default async function Arcs({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["catalog"]}>
			<ArcCatalog />
		</PageMessages>
	)
}
