import type { Metadata } from "next"

import styles from "./offline.module.css"

export const metadata: Metadata = {
	title: "You're Offline",
}

export default function OfflinePage() {
	return (
		<main className={`page ${styles.offlineMain}`} role="main">
			<span className={styles.offlineCard}>
				<p className={styles.offlineTitle}>
					{"Eek! Y-You're offline!"}
				</p>
				<p className={styles.offlineDescription}>
					{
						"You should be able to see p-pages that you've a-already visited."
					}
				</p>
			</span>
		</main>
	)
}
