"use client"

import { setSplashState } from "@/helpers/splashState"

import { useT } from "@/contexts"

import { InstallPWAButton } from "../InstallPWAButton"

import styles from "./splashScreen.module.css"

const DISCORD_INVITE_URL = "https://discord.gg/rSeMKWMy69"

const showUpdates = () => setSplashState("update")
const closeSplash = () => setSplashState("none")

export function SplashButtons({ last }: { last?: boolean }) {
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
				<span className={styles.longLabel}>
					{t("layout.splash.joinDiscord")}
				</span>
				<span className={styles.shortLabel}>
					{t("layout.splash.discord")}
				</span>
			</a>
			<button
				className="pill-button"
				onClick={last ? closeSplash : showUpdates}>
				{last ? t("layout.splash.close") : t("layout.splash.continue")}
			</button>
		</div>
	)
}
