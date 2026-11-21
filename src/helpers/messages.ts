import { cache } from "react"

import type { Messages, PartialMessages, Translate } from "@/types/messages"

import en from "@/messages/en.json"

import { DEFAULT_LOCALE, type Locale } from "@/helpers/locale"
import { createTranslator } from "@/helpers/translate"

// One entry per locale in LOCALES (TypeScript flags a missing one). Loaded on
// the server only; pages get the merged result through LocaleProvider.
const translations: Record<Locale, () => Promise<PartialMessages>> = {
	en: async () => en,
	"pt-BR": async () => (await import("@/messages/pt-BR.json")).default,
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

export type MessageNamespace = keyof Messages

export function pickMessages(
	messages: Messages,
	namespaces: readonly MessageNamespace[],
): PartialMessages {
	const picked: Record<string, unknown> = {}
	for (const ns of namespaces) {
		picked[ns] = messages[ns]
	}
	return picked as PartialMessages
}

// Shared namespaces serialized by the root layout; route namespaces load per page.
export async function getLayoutMessages(
	locale: Locale,
): Promise<PartialMessages> {
	const messages = await getMessages(locale)
	return {
		layout: messages.layout,
		routes: messages.routes,
		sync: messages.sync,
		error: messages.error,
		notFound: messages.notFound,
		auth: messages.auth,
		settings: {
			shared: messages.settings.shared,
			timers: messages.settings.timers,
		},
	}
}

export async function getPageMessages(
	locale: Locale,
	namespaces: readonly MessageNamespace[],
): Promise<PartialMessages> {
	return pickMessages(await getMessages(locale), namespaces)
}

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
		if (!(key in merged) && PLURAL_FORM.test(key) && isText(value)) {
			merged[key] = value
		}
	}

	// Gendered forms are optional: one this language hasn't translated uses
	// its own neutral text ("view"), not the English "view_male".
	for (const key of Object.keys(merged)) {
		const match = GENDER_FORM.exec(key)
		const base = match && `${match[1]}${match[3] ?? ""}`
		if (base && base in merged && !isText(target[key])) {
			merged[key] = merged[base]
		}
	}

	return merged
}

const isText = (value: unknown) => typeof value === "string" && value.trim() !== ""

const PLURAL_FORM = /_(zero|one|two|few|many|other)$/
// "view_male", or "pulls_female_one" for a gendered plural.
const GENDER_FORM = /^(.*)_(male|female)(_(?:zero|one|two|few|many|other))?$/
