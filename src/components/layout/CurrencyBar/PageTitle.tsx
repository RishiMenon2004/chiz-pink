"use client"

import { usePathname } from "next/navigation"

import { RoutesData } from "@/data/routes"

import styles from "./currencyBar.module.css"

function getRouteLookupKey(pathname: string): string {
	const dynamicPattern = /^\/(characters|arcs)\/[^/]+$/
	
	if (dynamicPattern.test(pathname)) {
		const segments = pathname.split("/")
		return `/${segments[1]}/[id]`
	}

	return pathname
}

export function PageTitle() {
	const pathname = usePathname()

	const lookupKey = getRouteLookupKey(pathname)

	const currentRoute = RoutesData[lookupKey as keyof typeof RoutesData]

	return <h1 className={styles.pageTitle}>{currentRoute?.title || "404"}</h1>
}
