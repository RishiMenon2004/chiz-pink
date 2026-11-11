"use client"

import { useLocalePathname } from "@/hooks/useLocalePathname"

import {
	isLocale,
	LOCALE_COOKIE,
	LOCALES,
	localizePath,
	type Locale,
} from "@/helpers/locale"

import { useLocale, useT } from "@/contexts"

import { LocaleLink } from "@/components/layout"

import {
	ConfigSelect,
	Content,
	ContentColumn,
	ContentRow,
	TitleBar,
} from "../SettingsShared"

// The Weblate project, where anyone can translate without touching the code.
const TRANSLATE_URL = "https://hosted.weblate.org/engage/chiz-pink/"

const ONE_YEAR = 60 * 60 * 24 * 365

/** A language's name in that language: "English", "Português (Brasil)". */
function nativeName(locale: Locale) {
	const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale)
	return name ? name.charAt(0).toLocaleUpperCase(locale) + name.slice(1) : locale
}

export function LanguageSection() {
	const t = useT()
	const locale = useLocale()
	const path = useLocalePathname()

	const switchTo = (next: Locale) => {
		// The proxy reads this before the browser's language, so unprefixed
		// URLs (bookmarks, the installed app) keep opening in this language.
		document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`

		// A full load: every page's text comes from the root layout, which
		// only runs again for a fresh document.
		const { search, hash } = window.location
		window.location.assign(localizePath(path, next) + search + hash)
	}

	return (
		<>
			<TitleBar title={t("settings.language.title")} />
			<Content>
				{/* Nothing to pick until a second language is enabled. */}
				{LOCALES.length > 1 && (
					<ContentRow>
						<ConfigSelect
							name={t("settings.language.label")}
							value={locale}
							onChange={(e) => {
								const next = e.currentTarget.value
								if (isLocale(next) && next !== locale) switchTo(next)
							}}>
							{LOCALES.map((option) => (
								<option key={option} value={option} lang={option}>
									{nativeName(option)}
								</option>
							))}
						</ConfigSelect>
					</ContentRow>
				)}

				<ContentColumn>{t("settings.language.helpTranslate")}</ContentColumn>

				<ContentRow buttonRow>
					<LocaleLink
						className="pill-button"
						data-variant="normal"
						href={TRANSLATE_URL}
						target="_blank"
						rel="noopener noreferrer">
						{t("settings.language.translateButton")}
					</LocaleLink>
				</ContentRow>
			</Content>
		</>
	)
}
