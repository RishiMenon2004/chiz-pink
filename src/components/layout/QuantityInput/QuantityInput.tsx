"use client"

import {
	ChangeEvent,
	FocusEvent,
	KeyboardEvent,
	MouseEvent,
	RefObject,
} from "react"

export function QuantityInput({
	name,
	value,
	inputRef,
	styles,
	onChange,
	onFocus,
	onBlur,
	onKeyDown,
	onInputClick,
	onIncrement,
	onDecrement,
}: {
	name: string
	value: number | string
	inputRef?: RefObject<HTMLInputElement | null>
	styles: Readonly<Record<string, string>>
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
	onFocus?: (e: FocusEvent<HTMLInputElement>) => void
	onBlur?: (e: FocusEvent<HTMLInputElement>) => void
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
	onInputClick?: (e: MouseEvent<HTMLInputElement>) => void
	onIncrement: (e: MouseEvent<HTMLSpanElement>) => void
	onDecrement: (e: MouseEvent<HTMLSpanElement>) => void
}) {
	return (
		<span className={`raised-control ${styles.amount}`}>
			<span
				aria-label={`${name} minus one button`}
				className={`${styles.countBtn} ${styles.minus}`}
				onClick={onDecrement}
			/>
			<span className={`${styles.countContainer}`}>
				<input
					tabIndex={0}
					ref={inputRef}
					type={"text"}
					min="0"
					pattern="[0-9]*"
					inputMode="numeric"
					name={`${name} quantity input box`}
					value={value}
					onChange={onChange}
					onFocus={onFocus}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					onClick={onInputClick}
				/>
			</span>
			<span
				aria-label={`${name} plus one button`}
				className={`${styles.countBtn} ${styles.plus}`}
				onClick={onIncrement}
			/>
		</span>
	)
}
