"use client"

import { KeyboardEvent, useCallback, useId, useRef, useState } from "react"

import { useT } from "@/contexts"

import { FloatingPanel } from "./FloatingPanel"
import { ItemGrid, searchCandidates } from "./ItemGrid"
import type { Candidate } from "./manualPulls"

import styles from "./manualPullEntry.module.css"

// A search box that drops down a grid of everything the board can give.
// Typing narrows the grid, the chips narrow it by rank or to cosmetics, and
// picking a tile fills in its name.
export function ItemPicker({
	value,
	onChange,
	candidates,
	label,
	className,
}: {
	value: string
	onChange: (name: string) => void
	candidates: Candidate[]
	label: string
	className?: string
}) {
	const t = useT()
	const panelId = useId()
	const inputRef = useRef<HTMLInputElement>(null)
	const [open, setOpen] = useState(false)
	const close = useCallback(() => setOpen(false), [])

	const selected = candidates.find(
		(c) => c.name.toLowerCase() === value.trim().toLowerCase()
	)
	// A name already picked shows the whole grid again, not just itself.
	const query = selected ? "" : value.trim()

	const pick = (candidate: Candidate) => {
		onChange(candidate.name)
		setOpen(false)
		inputRef.current?.focus()
	}

	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && open && !selected) {
			const first = searchCandidates(candidates, query)[0]
			if (!first) return
			e.preventDefault()
			pick(first)
		} else if (e.key === "ArrowDown") {
			e.preventDefault()
			setOpen(true)
			requestAnimationFrame(() =>
				document
					.getElementById(panelId)
					?.querySelector<HTMLButtonElement>(`.${styles.pickerTile}`)
					?.focus()
			)
		}
	}

	return (
		<>
			<input
				ref={inputRef}
				type="text"
				role="combobox"
				aria-expanded={open}
				aria-controls={panelId}
				aria-label={label}
				autoComplete="off"
				className={`inset-control ${styles.input} ${className ?? ""}`}
				data-valid={value === "" ? undefined : Boolean(selected)}
				placeholder={t("pulls.manual.itemPlaceholder")}
				value={value}
				onFocus={() => setOpen(true)}
				onClick={() => setOpen(true)}
				onKeyDown={onKeyDown}
				onChange={(e) => {
					onChange(e.currentTarget.value)
					setOpen(true)
				}}
			/>
			{open && (
				<FloatingPanel anchorRef={inputRef} onClose={close} matchWidth>
					<ItemGrid
						id={panelId}
						candidates={candidates}
						query={query}
						selected={selected}
						onPick={pick}
					/>
				</FloatingPanel>
			)}
		</>
	)
}
