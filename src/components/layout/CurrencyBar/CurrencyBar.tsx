"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"

import { annulith, beetleCoin, fons } from "@/data/items/materials"

import { PageTitle } from "./PageTitle"

import styles from "./currencyBar.module.css"

const CurrencyBox = dynamic(() => import("./CurrencyBox").then((mod) => mod.CurrencyBox), {
	ssr: false,
})

export function CurrencyBar() {
	const barRef = useRef<HTMLDivElement>(null)

	// Publishes the bar's real bottom edge as --titlebar-bottom so other
	// fixed overlays (e.g. SyncToast) can sit below it. Needed because the
	// narrow layout sizes the bar to its content instead of
	// --titlebar-height.
	useEffect(() => {
		const bar = barRef.current
		if (!bar) return
		const root = document.documentElement
		const observer = new ResizeObserver(() => {
			root.style.setProperty(
				"--titlebar-bottom",
				`${bar.getBoundingClientRect().bottom}px`
			)
		})
		observer.observe(bar)
		return () => {
			observer.disconnect()
			root.style.removeProperty("--titlebar-bottom")
		}
	}, [])

	return (
		<div ref={barRef} className={styles.titleBar}>
			<PageTitle />
			<span className={styles.currencySection}>
				<CurrencyBox currency={beetleCoin} />
				<CurrencyBox currency={fons} />
				<CurrencyBox currency={annulith} />
			</span>
		</div>
	)
}
