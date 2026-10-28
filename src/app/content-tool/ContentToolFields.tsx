"use client"

import { CSSProperties, PointerEvent, ReactNode, useRef, useState } from "react"

import { PullOutToolbar } from "@/components/layout"

import { styles as toolbarStyles } from "@/components/layout/PullOutToolbar"
import { CALENDAR_DAY_REM } from "@/helpers/contentJson"

import pageStyles from "@/app/page.module.css"
import styles from "./page.module.css"

// wide: the whole row. span: two columns, for a field holding two inputs.
export function Field({
	label,
	wide,
	span,
	children,
}: {
	label: string
	wide?: boolean
	span?: boolean
	children: ReactNode
}) {
	return (
		<label className={`${styles.field} ${wide ? styles.wide : ""} ${span ? styles.span : ""}`}>
			<span className={styles.fieldLabel}>{label}</span>
			{children}
		</label>
	)
}

export function TextInput({
	value,
	onChange,
	placeholder,
	multiline,
}: {
	value: string | undefined
	onChange: (value: string) => void
	placeholder?: string
	multiline?: boolean
}) {
	return multiline ? (
		<textarea
			className={`inset-control ${styles.input}`}
			rows={3}
			value={value ?? ""}
			placeholder={placeholder}
			onChange={(e) => onChange(e.target.value)}
		/>
	) : (
		<input
			className={`inset-control ${styles.input}`}
			value={value ?? ""}
			placeholder={placeholder}
			onChange={(e) => onChange(e.target.value)}
		/>
	)
}

export type SelectOption = { value: string; label: string; group?: string }

// A value the list doesn't know (typed into the file by hand) stays
// selectable instead of silently turning into the empty option.
export function SelectInput({
	value,
	onChange,
	options,
	empty = "—",
}: {
	value: string | undefined
	onChange: (value: string) => void
	options: SelectOption[]
	empty?: string
}) {
	const current = value ?? ""
	const all =
		current && !options.some((option) => option.value === current)
			? [{ value: current, label: `${current} (not on the site)` }, ...options]
			: options

	const groups = [...new Set(all.map((option) => option.group))]
	const render = (list: SelectOption[]) =>
		list.map((option) => (
			<option key={option.value} value={option.value}>
				{option.label}
			</option>
		))

	return (
		<select className={`inset-control ${styles.input}`} value={current} onChange={(e) => onChange(e.target.value)}>
			<option value="">{empty}</option>
			{groups.map((group) =>
				group === undefined ? (
					render(all.filter((option) => option.group === undefined))
				) : (
					<optgroup key={group} label={group}>
						{render(all.filter((option) => option.group === group))}
					</optgroup>
				)
			)}
		</select>
	)
}

// "2026-11-11", or "2026-11-11T01:00" when a UTC time is given.
export function DateInput({ value, onChange }: { value: string | undefined; onChange: (value: string) => void }) {
	const [date = "", time = ""] = (value ?? "").split("T")
	const join = (nextDate: string, nextTime: string) => onChange(nextTime ? `${nextDate}T${nextTime}` : nextDate)

	return (
		<span className={styles.inline}>
			<input className={`inset-control ${styles.input}`} type="date" value={date} onChange={(e) => join(e.target.value, time)} />
			<input
				className={`inset-control ${styles.input} ${styles.time} ${time ? "" : styles.unset}`}
				type="time"
				title="Optional UTC start time, for a start that isn't the usual reset"
				value={time}
				onChange={(e) => join(date, e.target.value)}
			/>
		</span>
	)
}

// An event's start or end: a phase boundary or a date.
export function DateRefInput({
	value,
	onChange,
	allowEnd,
}: {
	value: string
	onChange: (value: string) => void
	allowEnd?: boolean
}) {
	const refs = allowEnd ? ["phase1", "phase2", "end"] : ["phase1", "phase2"]
	const isRef = refs.includes(value)
	const labels: Record<string, string> = {
		phase1: allowEnd ? "Phase 1 end" : "Phase 1 start",
		phase2: allowEnd ? "Phase 2 end" : "Phase 2 start",
		end: "Version end",
	}

	return (
		<span className={styles.stack}>
			<select
				className={`inset-control ${styles.input}`}
				value={isRef ? value : "date"}
				onChange={(e) => onChange(e.target.value === "date" ? "" : e.target.value)}
			>
				{refs.map((ref) => (
					<option key={ref} value={ref}>
						{labels[ref]}
					</option>
				))}
				<option value="date">Date…</option>
			</select>
			{!isRef && <DateInput value={value} onChange={onChange} />}
		</span>
	)
}

// The recurring events' shared colours in globals.css.
const NAMED_COLORS = ["--fons-rush", "--pixel-surge", "--stamina-recharge", "--gold-clash"]

// Hex through the picker, or anything CSS takes (var(--pixel-surge)) typed.
// The swatch paints the value itself, so a var() shows its real colour.
export function ColorInput({ value, onChange }: { value: string | undefined; onChange: (value: string) => void }) {
	const isHex = /^#[0-9a-f]{6}$/i.test(value ?? "")

	return (
		<span className={styles.inline}>
			<label className={styles.swatch} style={{ background: value || undefined }} title="Pick a colour">
				<input
					type="color"
					value={isHex ? value : "#ff569f"}
					onChange={(e) => onChange(e.target.value)}
				/>
			</label>
			<input
				className={`inset-control ${styles.input}`}
				value={value ?? ""}
				placeholder="#ab9dec"
				list="content-tool-colors"
				onChange={(e) => onChange(e.target.value)}
			/>
		</span>
	)
}

// Rendered once on the page for every ColorInput's suggestions.
export function NamedColorList() {
	return (
		<datalist id="content-tool-colors">
			{NAMED_COLORS.map((name) => (
				<option key={name} value={`var(${name})`} />
			))}
		</datalist>
	)
}

// fallback: the crop the site uses when yOffset is left out.
export function OffsetInput({
	value,
	onChange,
	fallback = "50%",
}: {
	value: string | undefined
	onChange: (value: string) => void
	fallback?: string
}) {
	const percent = Number.parseFloat(value || fallback)

	return (
		<span className={styles.inline}>
			<input
				className={styles.range}
				type="range"
				min={0}
				max={100}
				value={Number.isNaN(percent) ? 50 : percent}
				onChange={(e) => onChange(`${e.target.value}%`)}
			/>
			<input
				className={`inset-control ${styles.input} ${styles.short}`}
				value={value ?? ""}
				placeholder={fallback}
				onChange={(e) => onChange(e.target.value)}
			/>
		</span>
	)
}

// A calendar item's height, near enough for a gacha or event item.
const STRIP_HEIGHT_REM = 3.5

// The calendar's crop: the image spans the width and slides up by yOffset.
// Below it the whole image at the same width, with the cropped band marked;
// with onOffsetChange the band can be dragged to set the offset.
export function BannerPreview({
	src,
	themeColor,
	yOffset,
	fallback = "50%",
	days,
	title,
	dates,
	isVersion,
	onOffsetChange,
}: {
	src: string | undefined
	themeColor?: string
	yOffset?: string
	fallback?: string
	// Length on the calendar, which sets the strip's real width.
	days?: number
	// The item's text as the calendar shows it. The version item has its
	// name only, in italics.
	title?: string
	dates?: string
	isVersion?: boolean
	onOffsetChange?: (yOffset: string) => void
}) {
	const bandRef = useRef<HTMLDivElement>(null)
	const [showTitle, setShowTitle] = useState(true)
	const stripWidth = days ? days * CALENDAR_DAY_REM : 32
	const style = {
		"--theme-color": themeColor || undefined,
		"--y-offset": yOffset || fallback,
		"--strip-width": `${stripWidth}rem`,
		// The band on the full image keeps the strip's proportions.
		"--band-ratio": `${stripWidth} / ${STRIP_HEIGHT_REM}`,
		"--strip-rem": stripWidth,
	} as CSSProperties

	// The band's top sits at offset × (image height − band height), so the
	// pointer maps back the same way, centred on the band.
	const dragTo = (e: PointerEvent<HTMLDivElement>) => {
		if (!onOffsetChange || !bandRef.current) return
		const rect = e.currentTarget.getBoundingClientRect()
		const band = bandRef.current.offsetHeight
		const offset = (e.clientY - rect.top - band / 2) / (rect.height - band)
		onOffsetChange(`${Math.round(Math.min(Math.max(offset, 0), 1) * 100)}%`)
	}

	return (
		<div className={styles.previewGroup} style={style}>
			{title && (
				<label className={styles.checkbox}>
					<input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} />
					Show title
				</label>
			)}
			<div className={`${styles.preview} ${isVersion ? styles.versionItem : ""}`}>
				{src ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img className={styles.previewImage} src={src} alt="" />
				) : (
					<span className={styles.previewEmpty}>No image yet</span>
				)}
				{showTitle && title && (
					<div className={styles.previewText}>
						<div className={styles.previewName}>{title}</div>
						{!isVersion && dates && <div className={styles.previewDates}>{dates}</div>}
					</div>
				)}
			</div>
			{days && (
				<span className={styles.note}>
					{days} days on the calendar ({stripWidth}rem)
				</span>
			)}
			{src && (
				<div
					className={`${styles.fullPreview} ${onOffsetChange ? styles.draggable : ""}`}
					title={onOffsetChange ? "Drag to set the y offset" : "The calendar crops events at 50%"}
					onPointerDown={(e) => {
						if (!onOffsetChange) return
						e.currentTarget.setPointerCapture(e.pointerId)
						dragTo(e)
					}}
					onPointerMove={(e) => {
						if (e.currentTarget.hasPointerCapture(e.pointerId)) dragTo(e)
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={src} alt="" draggable={false} />
					<div ref={bandRef} className={styles.cropBand} />
				</div>
			)}
		</div>
	)
}

// Small previews of a character's or arc's images, at their real shapes
// (sizes from the content pipeline guide). A missing one is a dashed box.
export function ImageThumbs({
	images,
}: {
	images: { label: string; src: string | undefined; aspect: string }[]
}) {
	return (
		<div className={styles.thumbs}>
			{images.map(({ label, src, aspect }) => (
				<figure key={label} className={styles.thumb}>
					<div className={`${styles.thumbFrame} ${src ? "" : styles.thumbMissing}`} style={{ aspectRatio: aspect }}>
						{src ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={src} alt={label} />
						) : (
							"Missing"
						)}
					</div>
					<figcaption>{label}</figcaption>
				</figure>
			))}
		</div>
	)
}

// A pill-button with an icon from public/button_icons before its text:
// <button className="pill-button" style={buttonIcon("plus")} data-icon>.
export const buttonIcon = (icon: string) => ({ "--icon": `url("/button_icons/${icon}.png")` }) as CSSProperties

// A round icon-only button, like the planner cards' buttons.
export function IconButton({
	icon,
	label,
	rotate,
	danger,
	disabled,
	onClick,
}: {
	icon: string
	label: string
	rotate?: number
	danger?: boolean
	disabled?: boolean
	onClick: () => void
}) {
	const style = {
		...buttonIcon(icon),
		"--icon-rotate": rotate ? `${rotate}deg` : undefined,
	} as CSSProperties

	return (
		<button
			type="button"
			className={`${styles.iconButton} ${danger ? styles.dangerIcon : ""}`}
			style={style}
			aria-label={label}
			title={label}
			disabled={disabled}
			onClick={onClick}
		/>
	)
}

export function RowHeader({
	title,
	index,
	count,
	onMove,
	onRemove,
}: {
	title: string
	index: number
	count: number
	onMove: (by: -1 | 1) => void
	onRemove: () => void
}) {
	return (
		<div className={styles.rowHeader}>
			<h3 className={pageStyles.sectionTitle}>{title}</h3>
			<span className={styles.rowActions}>
				<IconButton icon="back" rotate={90} label="Move up" disabled={index === 0} onClick={() => onMove(-1)} />
				<IconButton
					icon="back"
					rotate={-90}
					label="Move down"
					disabled={index === count - 1}
					onClick={() => onMove(1)}
				/>
				<IconButton icon="delete" label="Remove" danger onClick={onRemove} />
			</span>
		</div>
	)
}

// split: the title gets its own slim panel and each entry (a .card) is a
// panel of its own below it, instead of everything sharing one panel.
export function Section({
	id,
	title,
	count,
	note,
	onAdd,
	addLabel,
	action,
	split,
	children,
}: {
	id: string
	title: string
	count?: number
	note?: string
	onAdd?: () => void
	addLabel?: string
	// A button for the title row's right side, like the dashboard widgets'.
	action?: ReactNode
	split?: boolean
	children: ReactNode
}) {
	const header = (
		<>
			<header className={styles.sectionHeader}>
				<h2 className={pageStyles.sectionTitle}>
					{title}
					{count !== undefined && <span className={styles.count}>{count}</span>}
				</h2>
				{onAdd && (
					<button
						type="button"
						className={`pill-button ${styles.headerButton}`}
						style={buttonIcon("plus")}
						data-icon
						onClick={onAdd}
					>
						{addLabel}
					</button>
				)}
				{action}
			</header>
			{note && <p className={styles.note}>{note}</p>}
		</>
	)

	// Same bar as the planner's and inventory's, hanging off the tab bar.
	if (split) {
		return (
			<section id={id} className={styles.splitSection}>
				<PullOutToolbar className={styles.sectionToolbar}>
					<h2 className={pageStyles.sectionTitle}>
						{title}
						{count !== undefined && <span className={styles.count}>{count}</span>}
					</h2>
					{note && <p className={styles.note}>{note}</p>}
					{onAdd && (
						<button
							type="button"
							className={`pill-button ${toolbarStyles.toolbarButton} ${toolbarStyles.add} ${styles.toolbarAdd}`}
							onClick={onAdd}
						>
							{addLabel}
						</button>
					)}
				</PullOutToolbar>
				{children}
			</section>
		)
	}

	return (
		<section id={id} className={`metallic-panel ${styles.section}`}>
			{header}
			<div className={`inset-control ${styles.cardBody}`}>{children}</div>
		</section>
	)
}
