import { Metadata } from "next"

import { getMetadataTranslator } from "@/helpers/metadata"
import { PageMessages } from "@/helpers/PageMessages"

import { ExternalImport } from "@/components/pulls/ExternalImport"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const t = await getMetadataTranslator((await params).lang)
	return {
		title: t("routes.import_external.head"),
		robots: { index: false, follow: false },
	}
}

export default async function ImportExternal({ params }: Props) {
	const { lang } = await params

	return (
		<PageMessages lang={lang} namespaces={["pulls"]}>
			<main className="page" role="main">
				<ExternalImport />
			</main>
		</PageMessages>
	)
}
