import { ReactNode } from "react"

import styles from "./infoBox.module.css"

export function InfoBox({ children }: { children: ReactNode }) {
	return <div className={styles.emptyFilter}>{children}</div>
}
