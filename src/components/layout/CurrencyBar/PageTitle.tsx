"use client"

import { RoutesData, type RoutePath } from "@/data/routes"

import { useLocalePathname } from "@/hooks/useLocalePathname"

import { useT } from "@/contexts"

import styles from "./currencyBar.module.css"

const dynamicPattern = /^\/(characters|arcs)\/[^/]+$/

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

	// Character/arc profile pages render their own <h1> (the profile name),
	// so the section label here must not be a second one.
	const Tag = dynamicPattern.test(pathname) ? "p" : "h1"

	return (
		<Tag className={styles.pageTitle}>
			{currentRoute ? t(`routes.${currentRoute.id}.title`) : "404"}
		</Tag>
	)
}
