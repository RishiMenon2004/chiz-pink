"use client"

import { useCallback, useId, useRef, useState } from "react"
import Image from "next/image"

import { useT } from "@/contexts"

import { FloatingPanel } from "./FloatingPanel"
import { DICE_RESULTS, RESULTS, resultLabel, type Result } from "./manualPulls"

import styles from "./manualPullEntry.module.css"

// A result as the pulls list shows it: the dice face, or a labelled chip.
export function ResultFace({ result }: { result: Result }) {
	const t = useT()
	if (/^[1-6]$/.test(result)) {
		return (
			<Image
				src={`/pulls/dice_${result}.png`}
				width={84}
				height={32}
				alt={resultLabel(result, t)}
				unoptimized
				className={styles.diceFace}
			/>
		)
	}
	return <span className={styles.resultChip}>{resultLabel(result, t)}</span>
}

// A button showing the chosen result; it drops down a menu of results, each
// drawn as it looks in the list.
export function DicePicker({
	value,
	onChange,
	label,
	diceOnly = false,
	className,
}: {
	value: Result
	onChange: (result: Result) => void
	label: string
	diceOnly?: boolean
	className?: string
}) {
	const t = useT()
	const menuId = useId()
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const close = useCallback(() => setOpen(false), [])

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className={`${styles.diceButton} ${className ?? ""}`}
				aria-label={label}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				onClick={() => setOpen((current) => !current)}>
				<ResultFace result={value} />
			</button>
			{open && (
				<FloatingPanel
					anchorRef={buttonRef}
					onClose={close}
					id={menuId}
					role="menu"
					label={label}
					className={styles.diceMenu}>
					{(diceOnly ? DICE_RESULTS : RESULTS).map((result) => (
						<button
							key={result}
							type="button"
							role="menuitemradio"
							aria-checked={result === value}
							aria-label={resultLabel(result, t)}
							className={styles.diceOption}
							onClick={() => {
								onChange(result)
								setOpen(false)
								buttonRef.current?.focus()
							}}>
							<ResultFace result={result} />
						</button>
					))}
				</FloatingPanel>
			)}
		</>
	)
}
