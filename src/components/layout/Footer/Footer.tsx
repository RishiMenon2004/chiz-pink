import type { ReactNode } from "react"

import type { Locale } from "@/helpers/locale"

import { getTranslator } from "@/helpers/messages"

import { FooterAbout } from "./FooterAbout"

import { LocaleLink } from "../LocaleLink"

import styles from "./footer.module.css"

export async function Footer({ locale }: { locale: Locale }) {
	const t = await getTranslator(locale)
	const pink = (text: ReactNode) => <b className={styles.pink}>{text}</b>

	return (
		<footer className={styles.footer} role="contentinfo">
			<span className={styles.left}>
				<div>{t.rich("layout.footer.copyright", { name: pink })}</div>
				<div className={styles.small}>
					{t.rich("layout.footer.links", {
						privacy: (text) => (
							<LocaleLink href="/privacy" className="btn-anchor">
								<b>{text}</b>
							</LocaleLink>
						),
						discord: (text) => (
							<LocaleLink
								target="_blank"
								rel="noopener noreferrer"
								href="https://discord.gg/rSeMKWMy69"
								className="btn-anchor">
								<b>{text}</b>
							</LocaleLink>
						),
						nextjs: (text) => (
							<LocaleLink
								target="_blank"
								rel="noopener noreferrer"
								href="https://nextjs.org/"
								className="btn-anchor">
								<b>{text}</b>
							</LocaleLink>
						),
					})}
				</div>
			</span>
			<span className={styles.right}>
				<div>{t.rich("layout.footer.gameContents", { studio: pink })}</div>
				<div className={styles.small}>
					{/* One sentence, with the about toggle as a tag in it, so
					    translators can move it to where their grammar wants. */}
					{t.rich("layout.footer.disclaimer", {
						studio: pink,
						about: (text) => (
							<FooterAbout className={styles.about}>
								<summary aria-label={t("layout.footer.aboutLabel")}>
									<b className={styles.pink}>{text}</b>
									<sup className={styles.aboutHint}>?</sup>
								</summary>
								<div className={`metallic-panel ${styles.aboutPanel}`}>
									<p className={`inset-control ${styles.aboutText}`}>
										{t.rich("layout.footer.aboutText", { name: pink })}
									</p>
								</div>
							</FooterAbout>
						),
					})}
				</div>
			</span>
		</footer>
	)
}
