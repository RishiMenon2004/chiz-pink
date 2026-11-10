"use client"

import { usePathname } from "next/navigation"

import { splitLocalePath } from "@/helpers/locale"

/**
 * The current path without its language prefix: "/pt-BR/inventory" and
 * "/inventory" both give "/inventory". Use this instead of usePathname() for
 * comparing against routes. A prerendered English page sees "/en/inventory"
 * on the server but "/inventory" in the browser (src/proxy.ts rewrites it),
 * and the raw value would cause a hydration mismatch.
 */
export function useLocalePathname() {
	return splitLocalePath(usePathname()).path
}
