import type { Metadata } from "next"

import { getMetadataTranslator } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import { RenderMigrate } from "./RenderMigrate"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const t = await getMetadataTranslator((await params).lang)
	return {
		title: t("routes.migrate.head"),
		robots: { index: false },
	}
}

export default async function MigratePage({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["migrate"]}>
			<RenderMigrate />
		</PageMessages>
	)
}
