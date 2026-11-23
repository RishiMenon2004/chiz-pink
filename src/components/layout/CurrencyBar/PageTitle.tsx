"use client"

import { RoutesData, type RoutePath } from "@/data/routes"

import { useLocalePathname } from "@/hooks/useLocalePathname"

import { useT } from "@/contexts"

import styles from "./currencyBar.module.css"

const dynamicPattern = /^\/(characters|arcs)\/[^/]+$/
const OWN_H1_PATHS = new Set(["/migrate/ntewiz"])

function getRouteLookupKey(pathname: string): string {
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

	// Pages that render their own <h1> (profile names, NTEWiz migration)
	// shouldn't get a second one from the top bar.
	const Tag =
		dynamicPattern.test(pathname) || OWN_H1_PATHS.has(pathname) ? "p" : "h1"

	return (
		<Tag className={styles.pageTitle}>
			{currentRoute ? t(`routes.${currentRoute.id}.title`) : "404"}
		</Tag>
	)
}
