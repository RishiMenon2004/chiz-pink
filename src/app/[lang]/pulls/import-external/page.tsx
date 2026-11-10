import { Metadata } from "next"

import { getMetadataTranslator } from "@/helpers/metadata"

import { ExternalImport } from "@/components/pulls"

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

export default function ImportExternal() {
	return (
		<main className="page" role="main">
			<ExternalImport />
		</main>
	)
}
