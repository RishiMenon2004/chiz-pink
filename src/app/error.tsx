"use client"

import styles from "./page.module.css"

export default function Error({
	error,
	retry,
}: {
	error: Error & { digest?: string }
	retry: () => void
}) {
	return (
		<div className={`page ${styles.page}`}>
			<div className={`${styles.section} ${styles.errorSection}`}>
				<div className={styles.sectionTitleRow}>
					<div className={`${styles.sectionTitle} ${styles.errorTitle}`}>
						Something has gone wrong!
					</div>
				</div>
				<code className="inset-control">{error.message}</code>
				<button
					className={`pill-button ${styles.errorButton}`}
					onClick={() => retry()}>
					TRY AGAIN
				</button>
			</div>
		</div>
	)
}
