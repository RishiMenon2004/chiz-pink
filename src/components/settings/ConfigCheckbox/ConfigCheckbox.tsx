"use client"

import { ChangeEventHandler } from "react"

import styles from "./configCheckbox.module.css"

export function ConfigCheckbox({
	checked,
	onChange,
	name,
}: {
	name: string
	checked: boolean
	onChange: ChangeEventHandler<HTMLInputElement>
}) {
	return (
		<div className={styles.configCheckboxRow}>
			<input
				className={`inset-control ${styles.configCheckbox}`}
				name={name}
				type="checkbox"
				checked={checked}
				onChange={onChange}
			/>
			<b>{name}</b>
		</div>
	)
}
