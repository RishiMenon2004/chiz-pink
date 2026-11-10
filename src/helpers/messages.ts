import { cache } from "react"

import type { Messages, PartialMessages, Translate } from "@/types/messages"

import en from "@/messages/en.json"

import { DEFAULT_LOCALE, type Locale } from "@/helpers/locale"
import { createTranslator } from "@/helpers/translate"

// One entry per locale in LOCALES (TypeScript flags a missing one). Loaded on
// the server only; pages get the merged result through LocaleProvider.
const translations: Record<Locale, () => Promise<PartialMessages>> = {
	en: async () => en,
}

/**
 * The messages for a locale, with anything it hasn't translated yet (missing
 * or empty) filled in from English. Cached per request, so server
 * components can each call getTranslator() without redoing the merge.
 */
export const getMessages = cache(async function getMessages(
	locale: Locale,
): Promise<Messages> {
	const translated = await translations[locale]()
	if (locale === DEFAULT_LOCALE) return en

	return withFallback(en, translated) as Messages
})

/** t() for server components: `const t = await getTranslator(lang)`. */
export async function getTranslator(locale: Locale): Promise<Translate> {
	return createTranslator(await getMessages(locale), locale)
}

function withFallback(fallback: unknown, translated: unknown): unknown {
	if (typeof fallback === "string") {
		return typeof translated === "string" && translated.trim()
			? translated
			: fallback
	}

	const source = fallback as Record<string, unknown>
	const target =
		typeof translated === "object" && translated !== null
			? (translated as Record<string, unknown>)
			: {}

	const merged = Object.fromEntries(
		Object.entries(source).map(([key, value]) => [
			key,
			withFallback(value, target[key]),
		]),
	)

	// Plural forms English doesn't have (Polish "_few", Arabic "_two"...).
	for (const [key, value] of Object.entries(target)) {
		if (!(key in merged) && PLURAL_FORM.test(key) && typeof value === "string" && value.trim()) {
			merged[key] = value
		}
	}

	return merged
}

const PLURAL_FORM = /_(zero|one|two|few|many|other)$/
