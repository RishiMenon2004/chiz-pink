"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { useFirstVisit } from "@/hooks/useFirstVisit"
// import { useLastSeen } from "@/hooks/useLastSeen"

import styles from "./splashScreen.module.css"

export function SplashScreen() {
	const { isFirstVisit } = useFirstVisit()
	// const isLastSeenOld = useLastSeen()

	const [showWelcomeSplash, setShowWelcomeSplash] = useState(false)
	// const [showUpdateSplash, setShowUpdateSplash] = useState(false)

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

	const showSplashScreen = showWelcomeSplash /* || showUpdateSplash */

	useEffect(() => {
		if (isFirstVisit) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setShowWelcomeSplash(true)
		}
	}, [isFirstVisit])

	const closeSplashScreen = () => {
		setShowWelcomeSplash(false)
	}

	return (
		showSplashScreen && (
			<div className={`${styles.splashContainer} no-body-scroll`}>
				{showWelcomeSplash && (
					<div className={styles.welcomeSplashContainer}>
						<div className={styles.infoSection}>
							<div className={styles.welcomeText}>
								{"W-WELCOME TO "}
								<span className={styles.title}>CHIZ.PINK!</span>
							</div>
							<div className={styles.welcomeSubTitle}>
								{
									"Your favourite Ascension Planner, Checklist, and Inventory Tracker!"
								}
							</div>
							<div className={styles.infoBox}>
								<ul className="">
									<li>
										<Link
											onClick={closeSplashScreen}
											className="btn-anchor"
											href={"/"}>
											Dashboard
										</Link>
										{
											" — Track your stamina, current events and featured boards."
										}
									</li>
									<li>
										<Link
											onClick={closeSplashScreen}
											className="btn-anchor"
											href={"/checklist"}>
											Checklist
										</Link>
										{
											" — Your handy To-Do list for dailies and weeklies."
										}
									</li>
									<li>
										<Link
											onClick={closeSplashScreen}
											className="btn-anchor"
											href={"/characters"}>
											Esper
										</Link>
										{" & "}
										<Link
											onClick={closeSplashScreen}
											className="btn-anchor"
											href={"/arcs"}>
											Arc Planner
										</Link>
										{
											" — Ascension planners for your characters and arcs."
										}
									</li>
									<li>
										<Link
											onClick={closeSplashScreen}
											className="btn-anchor"
											href={"/inventory"}>
											Inventory
										</Link>
										{
											" — Easy-to-use inventory for your in-game items."
										}
									</li>
								</ul>
							</div>
							<div className={styles.btnContainer}>
								<button onClick={closeSplashScreen}>
									{"CONTINUE >>"}
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
									alt="Chiz Art - Full"
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
				)}
				{/* {showUpdateSplash && (
					<div className={styles.updateSplashContainer}></div>
				)} */}
			</div>
		)
	)
}
