"use client"

import Image from "next/image"

import { useT } from "@/contexts"

import { LocaleLink } from "@/components/layout"

import styles from "./page.module.css"

export default function NotFound() {
	const t = useT()

	return (
		<div className={`page ${styles.page}`}>
			<div className={`${styles.section} ${styles.errorSection}`}>
				<div className={styles.sectionTitleRow}>
					<Image
						className={styles.errorSticker}
						src="/stickers/chiz_cry.webp"
						alt=""
						width={256}
						height={256}
					/>
					<div className={`${styles.sectionTitle} ${styles.errorTitle}`}>
						{t("notFound.title")}
					</div>
				</div>
				<LocaleLink className={`pill-button ${styles.errorButton}`} href="/">
					{t("notFound.goHome")}
				</LocaleLink>
			</div>
		</div>
	)
}
