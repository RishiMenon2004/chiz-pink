"use client"

import Image from "next/image"
import { useEffect } from "react"

import { isChunkLoadError, reloadAfterChunkError } from "@/helpers/chunkLoadError"

import styles from "./page.module.css"

export default function Error({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string }
	unstable_retry: () => void
}) {
	const chunkError = isChunkLoadError(error)

	useEffect(() => {
		if (chunkError) reloadAfterChunkError()
	}, [chunkError])

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
					// A failed chunk stays failed until a full reload, so a
					// retry would only hit the same error.
					onClick={() =>
						chunkError ? window.location.reload() : unstable_retry()
					}>
					TRY AGAIN
				</button>
			</div>
		</div>
	)
}
