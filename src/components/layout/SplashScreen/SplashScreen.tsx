"use client"

import Image from "next/image"
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

	const chizContainerRefCallback = (node: HTMLDivElement) => {
		if (resizeObserverRef.current) {
			resizeObserverRef.current.disconnect()
			resizeObserverRef.current = null!
		}

		if (node !== null) {
			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const chizContainerWidth = entry.contentRect.width
					const chizImageHeight = chizContainerWidth * 1.165
					const leftOffset = chizContainerWidth * 0.165

					setImageClipPath(
						`M ${chizContainerWidth} 0 L ${leftOffset} 0 L ${leftOffset} ${chizImageHeight / 2} A ${(chizContainerWidth - leftOffset) / 2} ${(chizContainerWidth - leftOffset) / 2} 0 0 0 ${chizContainerWidth} ${chizImageHeight / 2} Z`
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
										<a className="btn-anchor" href={"/"}>
											Dashboard
										</a>
										{
											" — Track your stamina, current events and featured boards."
										}
									</li>
									<li>
										<a
											className="btn-anchor"
											href={"/checklist"}>
											Checklist
										</a>
										{
											" — Your handy To-Do list for dailies and weeklies."
										}
									</li>
									<li>
										<a
											className="btn-anchor"
											href={"/characters"}>
											Esper
										</a>
										{" & "}
										<a className="btn-anchor" href={"/arcs"}>
											Arc Planner
										</a>
										{
											" — Ascension planners for your characters and arcs."
										}
									</li>
									<li>
										<a
											className="btn-anchor"
											href={"/inventory"}>
											Inventory
										</a>
										{
											" — Easy-to-use inventory for your in-game items."
										}
									</li>
								</ul>
							</div>
							<div className={styles.btnContainer}>
								<button
									onClick={() => setShowWelcomeSplash(false)}>
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
									src="/characters/full/chiz.png"
									alt="Chiz Art - Full"
									width={512}
									height={512}
									quality={100}
									preload
									loading="eager"
									style={{
										clipPath: `path("${imageClipPath}")`,
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
