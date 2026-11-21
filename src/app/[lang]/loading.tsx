"use client"

import Image from "next/image"

import { useT } from "@/contexts"

import styles from "./loadingSkeleton.module.css"

export default function Loading() {
	const t = useT()

	return (
		<main className={`page ${styles.defaultPage}`} role="status" aria-live="polite">
			<div className={`metallic-panel ${styles.defaultCard}`}>
				<div className={styles.defaultHeader}>
					<Image
						className={styles.defaultSticker}
						src="/stickers/chiz_peek.webp"
						alt={t("layout.loading.stickerAlt")}
						width={64}
						height={64}
						loading="eager"
					/>
					<span className={styles.defaultTitle}>
						{t("layout.loading.title")}
					</span>
				</div>
				<div className={`inset-control ${styles.recessedBar}`} aria-hidden="true">
					<div className={styles.progressFill} />
				</div>
			</div>
		</main>
	)
}
