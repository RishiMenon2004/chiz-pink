"use client"

import { RoutesData, type RoutePath } from "@/data/routes"

import { useLocalePathname } from "@/hooks/useLocalePathname"

import { useT } from "@/contexts"

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
	const pathname = useLocalePathname()
	const t = useT()

	const lookupKey = getRouteLookupKey(pathname)

	const currentRoute = RoutesData[lookupKey as RoutePath] as
		| (typeof RoutesData)[RoutePath]
		| undefined

	return (
		<h1 className={styles.pageTitle}>
			{currentRoute ? t(`routes.${currentRoute.id}.title`) : "404"}
		</h1>
	)
}
