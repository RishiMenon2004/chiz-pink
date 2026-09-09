"use client"

import {
	ChangeEventHandler,
	DetailedHTMLProps,
	InputHTMLAttributes,
	ReactNode,
} from "react"

import styles from "@/app/settings/settings.module.css"

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                 */
/* ------------------------------------------------------------------ */

export function SectionColumns({ children }: { children: ReactNode }) {
	return <div className={styles.twoColumns}>{children}</div>
}

export function Section({ children }: { children: ReactNode }) {
	return (
		<div className={`metallic-panel ${styles.settingsSection}`}>
			{children}
		</div>
	)
}

export function TitleBar({
	children,
	title,
}: {
	children?: ReactNode
	title: string
}) {
	return (
		<div className={styles.settingsSectionTitlebar}>
			<Title>{title}</Title>
			{children}
		</div>
	)
}

export function Title({ children }: { children: ReactNode }) {
	return <div className={styles.settingsSectionTitle}>{children}</div>
}

export function Content({ children }: { children: ReactNode }) {
	return <div className={styles.settingsSectionContent}>{children}</div>
}

export function ContentRow({
	children,
	buttonRow,
	equalColumns,
}: {
	children: ReactNode
	buttonRow?: boolean
	equalColumns?: boolean
}) {
	return (
		<div
			className={`${styles.settingsSectionContentRow} ${buttonRow ? styles.buttonRow : ""} ${equalColumns ? styles.equalColumns : ""}`}>
			{children}
		</div>
	)
}

export function ContentColumn({ children }: { children: ReactNode }) {
	return <span className={styles.settingsSectionContentColumn}>{children}</span>
}

export function Blockquote({ children }: { children: ReactNode }) {
	return (
		<span className={`inset-control ${styles.settingsBlockquote}`}>
			{children}
		</span>
	)
}

export function BETATag() {
	return (
		<span
			style={{
				borderRadius: "100vh",
				backgroundColor: "#ffa600",
				padding: "0.25rem 0.5rem",
				color: "black",
				fontFamily: "var(--font-syne)",
				fontSize: "0.7em",
				fontWeight: 720,
				fontStyle: "normal",
				marginRight: "0.25rem",
				marginLeft: "-0.675rem",
				height: "fit-content",
				userSelect: "none",
			}}>
			BETA
		</span>
	)
}

/* ------------------------------------------------------------------ */
/*  Config input components                                           */
/* ------------------------------------------------------------------ */

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
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				alignItems: "center",
				flexWrap: "nowrap",
			}}>
			<input
				className={`inset-control ${styles.configInput}`}
				name={name}
				type="checkbox"
				checked={checked}
				onChange={onChange}
			/>
			<b>{name}</b>
		</div>
	)
}

export function ConfigInputbox(
	props: DetailedHTMLProps<
		InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	> & {
		children?: ReactNode
	}
) {
	const { children, ...inputProps } = props
	return (
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				flexDirection: "column",
				alignItems: "flex-start",
			}}>
			<b>{inputProps.name}</b>
			<input
				className={`inset-control ${styles.configInput}`}
				{...inputProps}
			/>
			{children}
		</div>
	)
}

export function ConfigNumberBox({
	name,
	value,
	onChange,
	children,
	min,
	max,
	step = 1,
}: {
	name: string
	value: number
	onChange: (value: number) => void
	children?: ReactNode
	min?: number
	max?: number
	step?: number
}) {
	const clamp = (next: number) => {
		let result = next
		if (min !== undefined) result = Math.max(result, min)
		if (max !== undefined) result = Math.min(result, max)
		return result
	}

	const step_ = (delta: number) => {
		onChange(clamp(value + delta))
	}

	return (
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				flexDirection: "column",
				alignItems: "flex-start",
				width: "100%",
			}}>
			<b>{name}</b>
			<div className={`inset-control ${styles.numberStepper}`}>
				<span
					role="button"
					tabIndex={-1}
					aria-label={`Decrease ${name}`}
					className={`${styles.stepperBtn} ${styles.minus}`}
					onClick={() => step_(-step)}
				/>
				<input
					name={name}
					className={`inset-control ${styles.configInput}`}
					type="text"
					pattern="[0-9]*"
					inputMode="numeric"
					value={value || 0}
					onChange={(e) => {
						const digits = e.currentTarget.value.replace(/\D/g, "")
						onChange(digits === "" ? 0 : clamp(parseInt(digits)))
					}}
				/>
				<span
					role="button"
					tabIndex={-1}
					aria-label={`Increase ${name}`}
					className={`${styles.stepperBtn} ${styles.plus}`}
					onClick={() => step_(step)}
				/>
			</div>
			{children}
		</div>
	)
}

export function ConfigSelect({
	name,
	value,
	onChange,
	children,
}: {
	name: string
	value?: string | number | readonly string[]
	onChange: ChangeEventHandler<HTMLSelectElement>
	children: ReactNode
}) {
	return (
		<div
			style={{
				flexGrow: 1,
				display: "flex",
				gap: "0.5rem",
				flexDirection: "column",
				alignItems: "flex-start",
			}}>
			<b>{name}</b>
			<select
				className={`inset-control ${styles.configSelect}`}
				name={name}
				value={value}
				onChange={onChange}>
				{children}
			</select>
		</div>
	)
}

/* ------------------------------------------------------------------ */
/*  Shared utilities                                                  */
/* ------------------------------------------------------------------ */

export const syncStatusLabel: Record<string, string> = {
	idle: "Not Synced",
	syncing: "Syncing...",
	synced: "Synced",
	error: "Sync Failed",
}

export const dateDisplayConfig: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "short",
	day: "2-digit",
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
}

export const formatDate = (date: number): string => {
	return new Date(date).toLocaleString("en-GB", dateDisplayConfig).toUpperCase()
}

export function hasExistingPlannerData() {
	const inventory = JSON.parse(localStorage.getItem("inventory") || "{}")
	const planner = JSON.parse(localStorage.getItem("planner") || "{}")

	return (
		Object.keys(inventory).length > 0 ||
		Object.keys(planner.characters ?? {}).length > 0 ||
		Object.keys(planner.arcs ?? {}).length > 0
	)
}
