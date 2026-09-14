import { ReactNode } from "react"

import styles from "../description.module.css"

export function DescriptionSmallHeading({ children }: { children: ReactNode }) {
	return (
		<span className={styles.smallHeading}>
			{children}
		</span>
	)
}
