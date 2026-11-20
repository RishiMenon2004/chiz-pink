import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import { CharacterCatalog } from "@/components/catalog"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/characters", (await params).lang)
}

export default async function Characters({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["catalog"]}>
			<CharacterCatalog />
		</PageMessages>
	)
}
