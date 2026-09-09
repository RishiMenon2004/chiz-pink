import { ReactNode } from "react"

import styles from "@/app/inventory/page.module.css"

export function MaterialGroup({
	title,
	isEmpty,
	isOpen = true,
	emptyFallback,
	children,
}: {
	title: string
	isEmpty?: boolean
	isOpen?: boolean
	emptyFallback?: ReactNode
	children: ReactNode
}) {
	return (
		<details
			className={`metallic-panel ${styles.matGroup} ${isEmpty && styles.emptyGroup}`}
			open={isOpen}>
			<summary>{title}</summary>
			{isEmpty ? emptyFallback : children}
		</details>
	)
}
