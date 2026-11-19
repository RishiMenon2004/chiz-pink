"use client"

import Image from "next/image"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import type { MessageKey } from "@/types/messages"

import { ChangeLogs } from "@/data/changelog"

import { useFirstVisit } from "@/hooks/useFirstVisit"
import { useLocalePathname } from "@/hooks/useLocalePathname"
import { useLastSeen } from "@/hooks/useLastSeen"

import { parseDescription } from "@/helpers/parseDescription"
import {
	setSplashMarker,
	setSplashState,
	type SplashState,
} from "@/helpers/splashState"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

import { useT } from "@/contexts"

import { InstallPWAButton } from "../InstallPWAButton"
import { LocaleLink } from "../LocaleLink"

import styles from "./splashScreen.module.css"

const DISCORD_INVITE_URL = "https://discord.gg/rSeMKWMy69"

// The updates view lists only the newest changelog entries.
const RECENT_CHANGELOGS = 5

const LATEST_VERSION = Object.keys(ChangeLogs).at(-1) ?? "0.0.0"

const NO_SPLASH_PATHS = new Set([
	"/migrate",
	"/content-tool",
	"/pulls/import-external",
])

const SPLASH_LINKS = [
	{ href: "/", key: "layout.splash.links.dashboard" },
	{ href: "/checklist", key: "layout.splash.links.checklist" },
	{ href: "/planner", key: "layout.splash.links.planner" },
	{ href: "/pulls", key: "layout.splash.links.pulls" },
	{ href: "/inventory", key: "layout.splash.links.inventory" },
] as const satisfies { href: string; key: MessageKey }[]

const showUpdates = () => setSplashState("update")
const closeSplash = () => setSplashState("none")

// The welcome / recent-updates card at the top of every page. Both views
// are in the server HTML; which one shows (if any) is CSS driven by the
// data-splash attribute on <html> (see helpers/splashState).
export function SplashScreen() {
	const pathname = useLocalePathname()

	if (NO_SPLASH_PATHS.has(pathname)) return null

	return <SplashCard />
}

function SplashCard() {
	const isHydrated = useSyncExternalStore(
		memoryStorage.subscribe,
		memoryStorage.isHydrated,
		() => false
	)
	const isFirstVisit = useFirstVisit()
	const isLastSeenOld = useLastSeen(LATEST_VERSION)

	// Confirms the pre-paint guess once storage has loaded.
	useEffect(() => {
		if (!isHydrated) return
		const state: SplashState = isFirstVisit
			? "welcome"
			: isLastSeenOld
				? "update"
				: "none"
		setSplashState(state)
		setSplashMarker(LATEST_VERSION)
	}, [isHydrated, isFirstVisit, isLastSeenOld])

	return (
		<section className={`metallic-panel ${styles.card}`}>
			<WelcomeView />
			<UpdateView />
		</section>
	)
}

function SplashButtons({ last }: { last?: boolean }) {
	const t = useT()

	return (
		<div className={styles.btnContainer}>
			<InstallPWAButton type="button" />
			<a
				className="pill-button"
				data-variant="normal"
				href={DISCORD_INVITE_URL}
				target="_blank"
				rel="noopener noreferrer">
				{t("layout.splash.joinDiscord")}
			</a>
			<button
				className="pill-button"
				onClick={last ? closeSplash : showUpdates}>
				{last ? t("layout.splash.close") : t("layout.splash.continue")}
			</button>
		</div>
	)
}

// Chiz pops out of the top of her circle: the image is scaled up from the
// bottom and clipped to the circle's lower half plus everything above it.
function ChizArt() {
	const t = useT()
	const [clipPath, setClipPath] = useState<string>()
	const observerRef = useRef<ResizeObserver>(null)

	const chizScale = 1.5

	const containerRef = (node: HTMLDivElement | null) => {
		observerRef.current?.disconnect()
		observerRef.current = null
		if (!node) return

		const observer = new ResizeObserver(([entry]) => {
			const width = entry.contentRect.width
			if (!width) return
			const height = (width * (2 * chizScale - 1)) / chizScale
			const inset = (width * (chizScale - 1)) / chizScale / 2
			const radius = (width - 2 * inset) / 2

			setClipPath(
				`M ${width} 0 L 0 0 L ${inset} ${height / 2} A ${radius} ${radius} 0 0 0 ${width / 2} ${height / 2 + radius} Q ${width * 1.3} ${height / 2 + radius} ${width} 0 Z`
			)
		})
		observer.observe(node)
		observerRef.current = observer
	}

	return (
		<div className={styles.chizSection}>
			<div className={styles.chizContainer} ref={containerRef}>
				<Image
					className={styles.chiz}
					src="/layout/chiz_splash.png"
					alt={t("layout.splash.chizAlt")}
					width={512}
					height={512}
					sizes="20rem"
					style={{
						clipPath: clipPath ? `path("${clipPath}")` : undefined,
						visibility: clipPath ? undefined : "hidden",
						scale: chizScale,
					}}
				/>
			</div>
		</div>
	)
}

function WelcomeView() {
	const t = useT()

	return (
		<div className={styles.welcomeView}>
			<div className={styles.infoSection}>
				<h2 className={styles.welcomeText}>
					{t.rich("layout.splash.welcome", {
						title: (text) => <span className={styles.title}>{text}</span>,
					})}
				</h2>

				<p className={styles.welcomeSubTitle}>
					{t("layout.splash.subtitle")}
				</p>

				<ul className={`inset-control ${styles.infoBox}`}>
					{SPLASH_LINKS.map(({ href, key }) => (
						<li key={href}>
							{t.rich(key, {
								link: (text) => (
									<LocaleLink
										onClick={closeSplash}
										className="btn-anchor"
										href={href}>
										{text}
									</LocaleLink>
								),
							})}
						</li>
					))}
					<li>
						{t.rich("layout.splash.links.settings", {
							link: (text) => (
								<LocaleLink
									onClick={closeSplash}
									className="btn-anchor"
									href="/settings">
									{text}
								</LocaleLink>
							),
							ntePlanner: (text) => (
								<LocaleLink
									className="btn-anchor"
									href="https://nteplanner.app/"
									target="_blank">
									{text}
								</LocaleLink>
							),
							nteWiz: (text) => (
								<LocaleLink
									className="btn-anchor"
									href="https://www.ntewiz.xyz/"
									target="_blank">
									{text}
								</LocaleLink>
							),
						})}
					</li>
				</ul>
				<SplashButtons />
			</div>
			<ChizArt />
		</div>
	)
}

function UpdateView() {
	const t = useT()

	return (
		<div className={styles.updateView}>
			<div className={styles.infoSection}>
				<h2 className={styles.welcomeText}>
					{t("layout.splash.recentUpdates")}
				</h2>

				<p className={styles.welcomeSubTitle}>
					{t("layout.splash.latestVersion", { version: LATEST_VERSION })}
				</p>
				<div className={`inset-control ${styles.infoBox}`}>
					{Object.entries(ChangeLogs)
						.toReversed()
						.slice(0, RECENT_CHANGELOGS)
						.map(([version, logs]) => (
							<div key={version} className={styles.versionSection}>
								<h3
									id={`changelog-v${version}`}
									className={styles.versionTitle}>
									v{version}
								</h3>
								<hr />
								{logs.map((log, line) => (
									<div key={line} className={styles.versionText}>
										{typeof log === "string"
											? parseDescription(
													log,
													undefined,
													undefined,
													closeSplash
												)
											: log}
									</div>
								))}
							</div>
						))}
				</div>
				<SplashButtons last />
			</div>
		</div>
	)
}
