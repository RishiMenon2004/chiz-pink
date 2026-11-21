"use client"

import { ChangeLogs } from "@/data/changelog"

import { parseDescription } from "@/helpers/parseDescription"
import { setSplashState } from "@/helpers/splashState"

import { useT } from "@/contexts"

import { SplashButtons } from "./SplashButtons"

import styles from "./splashScreen.module.css"

// The updates view lists only the newest changelog entries.
const RECENT_CHANGELOGS = 5

const closeSplash = () => setSplashState("none")

// Loaded lazily only when the updates splash view is active.
export function SplashUpdateView({ latestVersion }: { latestVersion: string }) {
	const t = useT()

	return (
		<div className={styles.updateView}>
			<div className={styles.infoSection}>
				<h2 className={styles.welcomeText}>
					{t("layout.splash.recentUpdates")}
				</h2>

				<div className={styles.updateBody}>
					<p className={styles.welcomeSubTitle}>
						{t("layout.splash.latestVersion", {
							version: latestVersion,
						})}
					</p>
					<div className={`inset-control ${styles.infoBox}`}>
						{Object.entries(ChangeLogs)
							.toReversed()
							.slice(0, RECENT_CHANGELOGS)
							.map(([version, logs]) => (
								<div
									key={version}
									className={styles.versionSection}>
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
					<SplashButtons last />
				</div>
			</div>
		</div>
	)
}
