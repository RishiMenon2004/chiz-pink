import { ReactNode } from "react"

import styles from "../description.module.css"

export function DescriptionNumber({ children }: { children: ReactNode }) {
	return (
		<span className={styles.number}>
			{children}
		</span>
	)
}
