"use client"

import Image from "next/image"

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
					<Image
						className={styles.errorSticker}
						src="/stickers/chiz_faint.webp"
						alt=""
						width={256}
						height={256}
					/>
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
