import { ReactNode } from "react"
import Image from "next/image"

import styles from "./infoBox.module.css"

export type InfoBoxSticker = "cry" | "faint" | "peek" | "rich"

export function InfoBox({
	className,
	sticker,
	children,
}: {
	className?: string
	sticker?: InfoBoxSticker
	children: ReactNode
}) {
	return (
		<div
			className={`${styles.infoBox} ${className}`}
			data-sticker={sticker}>
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
		</div>
	)
}
