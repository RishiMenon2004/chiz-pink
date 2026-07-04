"use client"

import { usePathname } from "next/navigation"

import {RoutesData} from "@/database/routes"

import styles from "./currencyBar.module.css"

export default function PageTitle() {
	const pathname = usePathname()

	const currentRoute = RoutesData[pathname]

	return <h1 className={styles.pageTitle}>{currentRoute?.title || "404"}</h1>
}
