import { createElement, Fragment, type ReactNode } from "react"

import type { Locale } from "@/helpers/locale"
import type {
	MessageKey,
	MessageParams,
	Messages,
	RichParams,
	Translate,
} from "@/types/messages"

/**
 * Builds t() for a messages object (already merged with the English
 * fallback, see getMessages()).
 *
 * - `t("notFound.title")` returns the string at that path.
 * - `{name}` placeholders are filled from params: `t("x", { name: "Akane" })`.
 * - With a numeric `count` param, plural forms are picked with the
 *   language's own rules: "pulls_one" / "pulls_other" (also _zero, _two,
 *   _few, _many for languages that have them).
 * - `t.rich("x", { link: (text) => <a>{text}</a> })` wraps `<link>...</link>`
 *   spans in elements, for sentences with links or emphasis inside them.
 * - A key that doesn't exist comes back as-is, so it's easy to spot.
 */
export function createTranslator(messages: Messages, locale: Locale): Translate {
	const plurals = new Intl.PluralRules(locale)

	function resolve(key: MessageKey, params?: RichParams | MessageParams) {
		let message = lookup(messages, key)

		if (typeof params?.count === "number") {
			message =
				lookup(messages, `${key}_${plurals.select(params.count)}`) ??
				lookup(messages, `${key}_other`) ??
				message
		}

		if (message === undefined) return key
		return params ? fill(message, params) : message
	}

	const t = ((key, params) => resolve(key, params)) as Translate
	t.rich = (key, params) => wrapTags(resolve(key, params), params)
	t.locale = locale
	return t
}

function lookup(messages: Messages, path: string): string | undefined {
	let node: unknown = messages
	for (const part of path.split(".")) {
		if (typeof node !== "object" || node === null) return undefined
		node = (node as Record<string, unknown>)[part]
	}
	return typeof node === "string" ? node : undefined
}

function fill(message: string, params: RichParams | MessageParams) {
	return message.replace(/\{(\w+)\}/g, (match, name: string) => {
		const value = params[name]
		return typeof value === "string" || typeof value === "number"
			? String(value)
			: match
	})
}

// Tags aren't nested: "<b>one</b> and <link>two</link>" is fine, "<b><link>"
// isn't. A tag without a matching param keeps its text and drops the markup.
function wrapTags(message: string, params: RichParams): ReactNode {
	const parts: ReactNode[] = []
	let last = 0

	for (const match of message.matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g)) {
		const [whole, name, chunk] = match
		parts.push(message.slice(last, match.index))

		const wrap = params[name]
		parts.push(typeof wrap === "function" ? wrap(chunk) : chunk)

		last = match.index + whole.length
	}
	parts.push(message.slice(last))

	// Children as arguments rather than an array: no keys needed.
	return createElement(Fragment, null, ...parts)
}
