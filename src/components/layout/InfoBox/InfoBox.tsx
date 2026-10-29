import { ReactNode } from "react"
import Image from "next/image"

import styles from "./infoBox.module.css"

export type InfoBoxSticker = "cry" | "faint" | "peek" | "rich"

export function InfoBox({
	className,
	sticker,
	hidden,
	onDismiss,
	children,
}: {
	className?: string
	sticker?: InfoBoxSticker
	hidden?: boolean
	// Adds a close button in the top-right corner.
	onDismiss?: () => void
	children: ReactNode
}) {
	return (
		<div
			className={`${styles.infoBox} ${className}`}
			data-sticker={sticker}
			data-dismissible={onDismiss ? "" : undefined}
			hidden={hidden}>
			{sticker && (
				<Image
					className={styles.sticker}
					src={`/stickers/chiz_${sticker}.webp`}
					alt=""
					width={256}
					height={256}
				/>
			)}
			<div className={styles.body}>{children}</div>
			{onDismiss && (
				<button
					className={styles.dismiss}
					onClick={onDismiss}
					aria-label="Dismiss">
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<path d="M4 4l8 8M12 4l-8 8" />
					</svg>
				</button>
			)}
		</div>
	)
}
