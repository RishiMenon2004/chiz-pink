"use client"

import { useEffect, useState } from "react"

import type { SelectionOption } from "@/types/item"

import { findMaterial } from "@/data/items"

import { MaterialIcon } from "@/components/layout"

const CYCLE_MS = 1500

// Every badge reads the same clock, so all boxes change icon together.
const currentStep = () => Math.floor(Date.now() / CYCLE_MS)

// Steps through what a selection box can grant, one icon at a time.
export function InventorySelectionBadge({
	options,
	className,
}: {
	options: SelectionOption[]
	className?: string
}) {
	// Starts on the first option so the server render matches, then joins
	// the shared clock once mounted.
	const [step, setStep] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => setStep(currentStep()), CYCLE_MS / 4)
		return () => clearInterval(interval)
	}, [])

	const activeIndex = step % options.length

	// All icons are stacked and only the active one is opaque, so each
	// change crossfades (and every icon is loaded before its turn).
	return (
		<div className={className}>
			{options.map(({ id }, index) => (
				<MaterialIcon
					key={id}
					material={findMaterial(id)}
					alt=""
					width={64}
					height={64}
					loading="eager"
					data-active={index === activeIndex}
				/>
			))}
		</div>
	)
}
