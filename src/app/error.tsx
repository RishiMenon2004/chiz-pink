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
			<div
				className={styles.section}
				style={{
					gap: "1rem",
				}}>
				<div className={styles.sectionTitleRow}>
					<div
						className={styles.sectionTitle}
						style={{ color: "var(--foreground)" }}>
						Something has gone wrong!
					</div>
				</div>
				<code className="inset-control">{error.message}</code>
				<button
					style={{
						alignSelf: "start",
						boxShadow: "var(--shadow-button)",
					}}
					className="pill-button"
					onClick={() => retry()}>
					TRY AGAIN
				</button>
			</div>
		</div>
	)
}
