"use client"

import { ComponentProps } from "react"
import NextLink from "next/link"

import { localizePath } from "@/helpers/locale"

import { useLocale } from "@/contexts"

/**
 * next/link that keeps the visitor in their language: "/planner" becomes
 * "/pt-BR/planner" on a Portuguese page. English links stay unprefixed, and
 * external or non-path hrefs are passed through unchanged. Use this for every
 * internal link instead of next/link.
 */
export function LocaleLink({ href, ...props }: ComponentProps<typeof NextLink>) {
	const locale = useLocale()
	const localized = typeof href === "string" ? localizePath(href, locale) : href

	return <NextLink href={localized} {...props} />
}
