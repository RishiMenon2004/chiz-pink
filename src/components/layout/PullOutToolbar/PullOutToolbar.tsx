"use client"

import { usePathname } from "next/navigation"
import { ReactNode, useState } from "react"

import styles from "./pullOutToolbar.module.css"

export function PullOutToolbar({ children, className }: { children: ReactNode; className?: string }) {
	const [isToolbarOpen, setIsToolbarOpen] = useState<boolean>(false)
	const pathname = usePathname()

	const isInventory = pathname === "/inventory"

	return (
		<div
			className={`${styles.plannerToolbar} ${isInventory ? styles.inventory : ""} ${isToolbarOpen ? styles.toolbarOpen : ""} ${className ?? ""}`}>
			{children}
			<div
				className={styles.pullOutTab}
				onClick={() => setIsToolbarOpen((prev) => !prev)}
			/>
		</div>
	)
}
