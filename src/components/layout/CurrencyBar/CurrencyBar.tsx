"use client"

import dynamic from "next/dynamic"

import { beetleCoin, dreamlessSeed, fons } from "@/data/items/materials"

import { PageTitle } from "./PageTitle"

import styles from "./currencyBar.module.css"

const CurrencyBox = dynamic(() => import("./CurrencyBox").then((mod) => mod.CurrencyBox), {
	ssr: false,
})

export function CurrencyBar() {
	return (
		<div className={styles.titleBar}>
			<PageTitle />
			<span className={styles.currencySection}>
				<CurrencyBox currency={dreamlessSeed} />
				<CurrencyBox currency={beetleCoin} />
				<CurrencyBox currency={fons} />
			</span>
		</div>
	)
}
