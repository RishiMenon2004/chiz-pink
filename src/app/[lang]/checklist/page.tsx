import { Metadata } from "next"

import { buildRouteMetadata } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"
import RenderChecklist from "./RenderChecklist"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return buildRouteMetadata("/checklist", (await params).lang)
}

export default async function Checklist({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["checklist", "home"]}>
			<RenderChecklist />
		</PageMessages>
	)
}
