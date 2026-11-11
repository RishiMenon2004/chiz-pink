// npm run messages:check [locale]
//
// Compares every translation in src/messages with English (en.json, the
// source) and reports how much of each language is done. Read-only. Run it
// after pulling translations from Weblate.
//
// Problems make it exit with code 1: invalid JSON, keys English doesn't
// have, and placeholders or <tags> that don't match the English text (they'd
// show up raw or go missing on the page). Missing translations are only
// counted, since they fall back to English; pass a locale to list them.
//
// A language is only served once it's in LOCALES (src/helpers/locale.ts)
// and in the loader map in src/helpers/messages.ts.

import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_LOCALE, LOCALES } from "@/helpers/locale"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const messagesDir = path.join(root, "src", "messages")

const PLURAL_FORM = /^(.*)_(zero|one|two|few|many|other)$/
const PLACEHOLDER = /\{(\w+)\}/g
const TAG = /<(\w+)>[\s\S]*?<\/\1>/g

type Leaves = Map<string, unknown>

/** "a.b.c" paths to every non-object value; objects are recursed into. */
function flatten(node: unknown, prefix = "", out: Leaves = new Map()): Leaves {
	if (typeof node === "object" && node !== null && !Array.isArray(node)) {
		for (const [key, value] of Object.entries(node)) {
			flatten(value, prefix ? `${prefix}.${key}` : key, out)
		}
	} else {
		out.set(prefix, node)
	}
	return out
}

const names = (text: string, pattern: RegExp) =>
	[...text.matchAll(pattern)].map((m) => m[1]).sort()

function readJson(file: string): unknown {
	return JSON.parse(readFileSync(path.join(messagesDir, file), "utf8"))
}

const english = flatten(readJson(`${DEFAULT_LOCALE}.json`)) as Map<string, string>
const pluralBases = new Set(
	[...english.keys()]
		.map((key) => PLURAL_FORM.exec(key))
		.filter((m) => m?.[2] === "other")
		.map((m) => m![1]),
)

/** The English base of a plural form ("x.pulls_few" -> "x.pulls"), if any. */
function pluralBase(key: string) {
	const match = PLURAL_FORM.exec(key)
	return match && pluralBases.has(match[1])
		? { base: match[1], category: match[2] }
		: null
}

const only = process.argv[2]
const files = readdirSync(messagesDir)
	.filter((file) => file.endsWith(".json"))
	.map((file) => file.slice(0, -".json".length))
	.filter((locale) => locale !== DEFAULT_LOCALE)
	.filter((locale) => !only || locale === only)

let failed = false
const report = (title: string, lines: string[]) => {
	if (!lines.length) return
	console.log(`\n  ${title}`)
	for (const line of lines) console.log(`    ${line}`)
}

if (only && !files.length) {
	console.error(`No src/messages/${only}.json`)
	process.exit(1)
}

for (const locale of LOCALES) {
	if (locale !== DEFAULT_LOCALE && !files.includes(locale) && !only) {
		console.log(`${locale}: in LOCALES but src/messages/${locale}.json doesn't exist`)
		failed = true
	}
}

for (const locale of files) {
	const problems: string[] = []
	const warnings: string[] = []

	let categories: Set<string>
	let translated: Leaves
	try {
		categories = new Set(new Intl.PluralRules(locale).resolvedOptions().pluralCategories)
		translated = flatten(readJson(`${locale}.json`))
	} catch (error) {
		console.log(`\n${locale}: ${(error as Error).message}`)
		failed = true
		continue
	}

	for (const [key, value] of translated) {
		const plural = pluralBase(key)
		const source = english.get(key) ?? (plural ? english.get(`${plural.base}_other`) : undefined)

		if (source === undefined) {
			const group = [...english.keys()].some((k) => k.startsWith(`${key}.`))
			problems.push(group ? `${key}: should be a group of texts, not text` : `${key}: not in English (removed or misspelt?)`)
			continue
		}
		if (typeof value !== "string") {
			problems.push(`${key}: should be text`)
			continue
		}
		if (plural && !categories.has(plural.category)) {
			warnings.push(`${key}: ${locale} has no "${plural.category}" plural form, so this is never shown`)
		}
		if (!value.trim()) continue

		const expected = new Set(names(source, PLACEHOLDER))
		const used = new Set(names(value, PLACEHOLDER))
		for (const name of used) {
			if (!expected.has(name)) problems.push(`${key}: unknown placeholder {${name}}`)
		}
		for (const name of expected) {
			// "one" forms may spell the number out ("um item").
			if (!used.has(name) && !(plural && name === "count")) {
				problems.push(`${key}: missing placeholder {${name}}`)
			}
		}

		if (names(source, TAG).join() !== names(value, TAG).join()) {
			const tags = names(source, TAG).map((tag) => `<${tag}>`).join(" ") || "none"
			problems.push(`${key}: tags don't match English (expected ${tags})`)
		}
	}

	// English plural forms the language doesn't use (a "_one" in a language
	// without one) aren't needed.
	const needed = [...english.keys()].filter((key) => {
		const plural = pluralBase(key)
		return !plural || categories.has(plural.category)
	})
	const missing = needed.filter((key) => {
		const value = translated.get(key)
		return typeof value !== "string" || !value.trim()
	})

	const done = needed.length - missing.length
	const percent = Math.floor((done / needed.length) * 100)
	const enabled = (LOCALES as readonly string[]).includes(locale)
	console.log(
		`\n${locale}: ${done} / ${needed.length} translated (${percent}%)` +
			(enabled ? "" : ", not enabled (not in LOCALES)"),
	)

	report("Problems", problems)
	report("Warnings", warnings)
	if (only) report("Untranslated (shown in English)", missing)

	if (problems.length) failed = true
}

process.exit(failed ? 1 : 0)
