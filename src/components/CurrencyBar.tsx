"use client"

import dynamic from "next/dynamic"
import PageTitle from "@/components/PageTitle"
import { beetleCoin, dreamlessSeed, fons } from "@/database/materials"

const CurrencyBox = dynamic(() => import('../components/CurrencyBox'), { ssr: false })

export default function CurrencyBar() {
	return (
		<div className="title-bar">
			<PageTitle />
			<span className="currency-section">
				<CurrencyBox currency={dreamlessSeed} />
				<CurrencyBox currency={beetleCoin} />
				<CurrencyBox currency={fons} />
			</span>
		</div>
	)
}