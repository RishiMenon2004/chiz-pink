import { ReactNode } from "react"

import styles from "./infoBox.module.css"

export function InfoBox({ className, children }: { className?: string, children: ReactNode }) {
	return <div className={`${styles.infoBox} ${className}`}>{children}</div>
}
