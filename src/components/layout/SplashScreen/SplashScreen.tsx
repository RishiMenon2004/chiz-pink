"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import type { MessageKey } from "@/types/messages"

import { ChangeLogs } from "@/data/changelog"

import { useFirstVisit } from "@/hooks/useFirstVisit"
import { useLocalePathname } from "@/hooks/useLocalePathname"
import { useLastSeen } from "@/hooks/useLastSeen"

import { useT } from "@/contexts"

import { LocaleLink } from "../LocaleLink"

import styles from "./splashScreen.module.css"
import { parseDescription } from "@/helpers/parseDescription"
import { InstallPWAButton } from "../InstallPWAButton"

const DISCORD_INVITE_URL = "https://discord.gg/rSeMKWMy69"

function DiscordButton() {
	const t = useT()

	return (
		<a
			className="pill-button"
			data-variant="normal"
			href={DISCORD_INVITE_URL}
			target="_blank"
			rel="noopener noreferrer">
			{t("layout.splash.joinDiscord")}
		</a>
	)
}

const SPLASH_LINKS = [
	{ href: "/", key: "layout.splash.links.dashboard" },
	{ href: "/checklist", key: "layout.splash.links.checklist" },
	{ href: "/planner", key: "layout.splash.links.planner" },
	{ href: "/pulls", key: "layout.splash.links.pulls" },
	{ href: "/inventory", key: "layout.splash.links.inventory" },
] as const satisfies { href: string; key: MessageKey }[]

function WelcomeSplashScreen({ closeSplash }: { closeSplash: () => void }) {
	const t = useT()
	const [imageClipPath, setImageClipPath] = useState("M 0 0 Z")

	const resizeObserverRef = useRef<ResizeObserver>(null!)

	const chizScale = 1.5

	const chizContainerRefCallback = (node: HTMLDivElement) => {
		if (resizeObserverRef.current) {
			resizeObserverRef.current.disconnect()
			resizeObserverRef.current = null!
		}

		if (node !== null) {
			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const chizContainerWidth = entry.contentRect.width

					const chizImageHeight =
						(chizContainerWidth * (2 * chizScale - 1)) / chizScale

					const inlineOffset =
						(chizContainerWidth * (chizScale - 1)) / chizScale / 2

					setImageClipPath(
						`M ${chizContainerWidth} 0 L 0 0 L ${inlineOffset} ${chizImageHeight / 2} A ${(chizContainerWidth - 2 * inlineOffset) / 2} ${(chizContainerWidth - 2 * inlineOffset) / 2} 0 0 0 ${chizContainerWidth / 2} ${chizImageHeight / 2 + (chizContainerWidth - 2 * inlineOffset) / 2} Q ${chizContainerWidth * 1.3} ${chizImageHeight / 2 + (chizContainerWidth - 2 * inlineOffset) / 2} ${chizContainerWidth} 0 Z`
					)
				}
			})

			observer.observe(node)
			resizeObserverRef.current = observer
		}
	}

	return (
		<div className={styles.welcomeSplashContainer}>
			<div className={styles.infoSection}>
				<div className={styles.welcomeText}>
					{t.rich("layout.splash.welcome", {
						title: (text) => <span className={styles.title}>{text}</span>,
					})}
				</div>

				<div className={styles.welcomeSubTitle}>
					{t("layout.splash.subtitle")}
				</div>

				<div className={`inset-control ${styles.infoBox}`}>
					<ul>
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
				</div>
				<div className={styles.btnContainer}>
					<InstallPWAButton type="button" />
					<DiscordButton />
					<button className="pill-button" onClick={closeSplash}>
						{t("layout.splash.continue")}
					</button>
				</div>
			</div>
			<div className={styles.chizSection}>
				<div
					className={styles.chizContainer}
					ref={chizContainerRefCallback}>
					<Image
						className={styles.chiz}
						src="/layout/chiz_splash.png"
						alt={t("layout.splash.chizAlt")}
						width={512}
						height={512}
						quality={100}
						preload
						loading="eager"
						style={{
							clipPath: `path("${imageClipPath}")`,
							scale: chizScale,
						}}
					/>
				</div>
			</div>
		</div>
	)
}

// The update splash lists only the newest changelog entries.
const RECENT_CHANGELOGS = 5

function UpdateSplashScreen({ closeSplash }: { closeSplash: () => void }) {
	const t = useT()

	return (
		<div className={styles.updateSplashContainer}>
			<div className={styles.infoSection}>
				<div className={styles.welcomeText}>{t("layout.splash.recentUpdates")}</div>

				<div className={styles.welcomeSubTitle}>
					{t("layout.splash.latestVersion", {
						version: Object.entries(ChangeLogs).at(-1)?.[0] ?? "",
					})}
				</div>
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
									<div
										key={line}
										className={styles.versionText}>
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
				<div className={styles.btnContainer}>
					<InstallPWAButton type="button" />
					<DiscordButton />
					<button className="pill-button" onClick={closeSplash}>
						{t("layout.splash.continue")}
					</button>
				</div>
			</div>
		</div>
	)
}

const NO_SPLASH_PATHS = new Set([
	"/migrate",
	"/content-tool",
	"/pulls/import-external",
])

export function SplashScreen() {
	const pathname = useLocalePathname()

	if (NO_SPLASH_PATHS.has(pathname)) return null

	return <SplashScreens />
}

function SplashScreens() {
	const isFirstVisit = useFirstVisit()

	const latestVersion = Object.keys(ChangeLogs).at(-1) ?? "0.0.0"
	const isLastSeenOld = useLastSeen(latestVersion)

	const [showWelcomeSplash, setShowWelcomeSplash] = useState(isFirstVisit)
	const closeWelcomeSplashScreen = () => {
		setShowWelcomeSplash(false)
	}
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setShowWelcomeSplash(isFirstVisit)
	}, [isFirstVisit])

	const [showUpdateSplash, setShowUpdateSplash] = useState(false)
	const closeUpdateSplashScreen = () => {
		setShowUpdateSplash(false)
	}
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setShowUpdateSplash(isLastSeenOld)
	}, [isLastSeenOld])

	const showSplashScreen = showWelcomeSplash || showUpdateSplash

	return (
		showSplashScreen && (
			<div className={`${styles.splashContainer} no-body-scroll`}>
				{showWelcomeSplash && (
					<WelcomeSplashScreen closeSplash={closeWelcomeSplashScreen} />
				)}
				{showUpdateSplash && !showWelcomeSplash && (
					<UpdateSplashScreen closeSplash={closeUpdateSplashScreen} />
				)}
			</div>
		)
	)
}
