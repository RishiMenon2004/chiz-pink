import type { Metadata } from "next"

import { getMetadataTranslator } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import { RenderNteWizMigrate } from "./RenderNteWizMigrate"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const t = await getMetadataTranslator((await params).lang)
	return {
		title: t("routes.migrate_ntewiz.head"),
		description: t("routes.migrate_ntewiz.description"),
	}
}

export default async function MigrateNteWizPage({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["migrate", "settings"]}>
			<RenderNteWizMigrate />
		</PageMessages>
	)
}
