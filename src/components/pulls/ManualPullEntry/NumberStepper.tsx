"use client"

import { useState } from "react"

import { QuantityInput } from "@/components/layout"

import inventoryStyles from "@/components/inventory/MaterialBox/inventoryMaterial.module.css"
import styles from "./manualPullEntry.module.css"

// A whole number with the inventory's -/+ buttons around it (the same
// QuantityInput and look). Typing is free while focused, then clamped.
export function NumberStepper({
	value,
	onChange,
	min = 0,
	max = Infinity,
	label,
}: {
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	label: string
}) {
	const [draft, setDraft] = useState<string | null>(null)
	const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)))

	return (
		<span className={styles.stepper}>
			<QuantityInput
				name={label}
				styles={inventoryStyles}
				value={draft ?? value}
				onChange={(e) => {
					const digits = e.currentTarget.value.replace(/\D/g, "")
					setDraft(digits)
					if (digits !== "") onChange(clamp(Number(digits)))
				}}
				onFocus={(e) => e.currentTarget.select()}
				onBlur={() => setDraft(null)}
				onKeyDown={(e) => {
					if (e.key === "ArrowUp") {
						e.preventDefault()
						onChange(clamp(value + 1))
					} else if (e.key === "ArrowDown") {
						e.preventDefault()
						onChange(clamp(value - 1))
					}
				}}
				onIncrement={() => onChange(clamp(value + 1))}
				onDecrement={() => onChange(clamp(value - 1))}
			/>
		</span>
	)
}
