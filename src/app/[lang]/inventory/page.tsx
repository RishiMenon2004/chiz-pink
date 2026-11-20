import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import RenderInventory from "./RenderInventory"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/inventory", (await params).lang)
}

export default async function Inventory({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["inventory"]}>
			<RenderInventory />
		</PageMessages>
	)
}
