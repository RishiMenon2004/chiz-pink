"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useEffect, useSyncExternalStore } from "react"

import type { MessageKey } from "@/types/messages"

import { useFirstVisit } from "@/hooks/useFirstVisit"
import { useLocalePathname } from "@/hooks/useLocalePathname"
import { useLastSeen } from "@/hooks/useLastSeen"

import {
	getSplashStateSnapshot,
	setSplashMarker,
	setSplashState,
	subscribeSplashState,
	type SplashState,
} from "@/helpers/splashState"
import * as memoryStorage from "@/helpers/storage/memoryStorage"

import { useSplashVersion, useT } from "@/contexts"

import { LocaleLink } from "../LocaleLink"
import { SplashButtons } from "./SplashButtons"

import styles from "./splashScreen.module.css"

const SplashUpdateView = dynamic(
	() => import("./SplashUpdateView").then((mod) => mod.SplashUpdateView),
	{ ssr: false }
)

const NO_SPLASH_PATHS = new Set([
	"/migrate",
	"/migrate/ntewiz",
	"/content-tool",
	"/pulls/import-external",
])

// These pages render the card themselves, below their toolbar and intro.
const PAGE_PLACED_PATHS = new Set([
	"/planner",
	"/checklist",
	"/inventory",
	"/pulls",
	"/characters",
	"/arcs",
])

const isPagePlaced = (pathname: string) =>
	PAGE_PLACED_PATHS.has(pathname) || pathname.startsWith("/planner/")

const SPLASH_LINKS = [
	{ href: "/", key: "layout.splash.links.dashboard" },
	{ href: "/checklist", key: "layout.splash.links.checklist" },
	{ href: "/planner", key: "layout.splash.links.planner" },
	{ href: "/pulls", key: "layout.splash.links.pulls" },
	{ href: "/inventory", key: "layout.splash.links.inventory" },
] as const satisfies { href: string; key: MessageKey }[]

const closeSplash = () => setSplashState("none")

// Welcome / updates card; which view shows is CSS, via data-splash on <html>.
export function SplashScreen({ placement = "layout" }: { placement?: "layout" | "page" }) {
	const pathname = useLocalePathname()
	const latestVersion = useSplashVersion()

	if (NO_SPLASH_PATHS.has(pathname)) return null
	if (isPagePlaced(pathname) !== (placement === "page")) return null

	return <SplashCard latestVersion={latestVersion} />
}

function SplashCard({ latestVersion }: { latestVersion: string }) {
	const isHydrated = useSyncExternalStore(
		memoryStorage.subscribeHydration,
		memoryStorage.isHydrated,
		() => false
	)
	const splashState = useSyncExternalStore(
		subscribeSplashState,
		getSplashStateSnapshot,
		() => null
	)
	const isFirstVisit = useFirstVisit()
	const isLastSeenOld = useLastSeen(latestVersion)

	// Confirms the pre-paint guess once storage has loaded.
	useEffect(() => {
		if (!isHydrated) return
		const state: SplashState = isFirstVisit
			? "welcome"
			: isLastSeenOld
				? "update"
				: "none"
		setSplashState(state)
		setSplashMarker(latestVersion)
	}, [isHydrated, isFirstVisit, isLastSeenOld, latestVersion])

	return (
		<section className={`metallic-panel ${styles.card}`}>
			<WelcomeView />
			{splashState === "update" && (
				<SplashUpdateView latestVersion={latestVersion} />
			)}
		</section>
	)
}

function ChizArt() {
	const t = useT()

	return (
		<div className={styles.chizSection}>
			<Image
				className={styles.chiz}
				src="/layout/chiz_splash.png"
				alt={t("layout.splash.chizAlt")}
				width={512}
				height={512}
				sizes="(max-width: 900px) 16px, 40rem"
				loading="eager"
				fetchPriority="high"
			/>
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
						title: (text) => (
							<span className={styles.title}>{text}</span>
						),
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
									onClick={closeSplash}
									className="btn-anchor"
									href="/migrate/ntewiz">
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
