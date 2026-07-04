import { ReactNode } from "react"
import styles from "@/app/inventory/page.module.css"

export default function MaterialGroup({
	title,
	isEmpty,
	isOpen = true,
	emptyFalback,
	children,
}: {
	title: string,
	isEmpty?: boolean
	isOpen?: boolean
	emptyFalback?: ReactNode
	children: ReactNode
}) {
	return (
		<details className={`${styles.matGroup} ${isEmpty && styles.emptyGroup}`} open={isOpen}>
			<summary>{title}</summary>
			{isEmpty ? emptyFalback : children}
		</details>
	)
}
