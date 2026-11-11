"use client"

import { ReactNode, useState } from "react"

import { useLocalePathname } from "@/hooks/useLocalePathname"

import styles from "./pullOutToolbar.module.css"

export function PullOutToolbar({ children, className }: { children: ReactNode; className?: string }) {
	const [isToolbarOpen, setIsToolbarOpen] = useState<boolean>(false)
	const pathname = useLocalePathname()

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
