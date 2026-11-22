"use client"

import { useEffect, useRef } from "react"

import { annulith, beetleCoin, fons } from "@/data/items/materials"

import { CurrencyBox } from "./CurrencyBox"
import { PageTitle } from "./PageTitle"

import styles from "./currencyBar.module.css"

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
		let rafId = 0
		let lastBottom = ""
		const observer = new ResizeObserver(() => {
			const nextBottom = `${bar.getBoundingClientRect().bottom}px`
			if (nextBottom === lastBottom) return
			lastBottom = nextBottom
			cancelAnimationFrame(rafId)
			// Defer the root style write so other ResizeObserver callbacks in
			// the same frame don't hit a forced reflow after we dirty <html>.
			rafId = requestAnimationFrame(() => {
				root.style.setProperty("--titlebar-bottom", nextBottom)
			})
		})
		observer.observe(bar)
		return () => {
			cancelAnimationFrame(rafId)
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
