import type { Metadata } from "next"

import { getMetadataTranslator } from "@/helpers/metadata"

import styles from "./offline.module.css"

type Props = {
	params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const t = await getMetadataTranslator((await params).lang)
	return {
		title: t("meta.offline"),
		// Service worker fallback, not a real page.
		robots: { index: false },
	}
}

export default async function OfflinePage({ params }: Props) {
	const t = await getMetadataTranslator((await params).lang)

	return (
		<main className={`page ${styles.offlineMain}`} role="main">
			<span className={styles.offlineCard}>
				<p className={styles.offlineTitle}>
					{t("offline.title")}
				</p>
				<p className={styles.offlineDescription}>
					{t("offline.description")}
				</p>
			</span>
		</main>
	)
}
