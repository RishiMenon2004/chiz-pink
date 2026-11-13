"use client"

import { CSSProperties, useCallback, useId, useRef, useState } from "react"

import { formatLocale } from "@/helpers/locale"

import { useLocale, useT } from "@/contexts"

import { FloatingPanel } from "./FloatingPanel"

import styles from "./manualPullEntry.module.css"

// A banner as the picker draws it: its art (event art, or the arc's), how
// far down to show it, and its theme colour.
export type BannerOption = {
	key: string
	name: string
	startDate: number
	endDate: number
	image: string
	offset?: string
	themeColor?: string
}

// As the home page's calendar dates its events: "Sep 30 ▸ Oct 14".
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }

function BannerArt({ banner, className }: { banner: BannerOption; className: string }) {
	const locale = useLocale()
	const format = (time: number) =>
		new Date(time).toLocaleDateString(formatLocale(locale), DATE_FORMAT)
	return (
		<span
			className={className}
			style={
				{
					"--bg-image": `url("${banner.image}")`,
					"--offset": banner.offset ?? "30%",
					"--theme-color": banner.themeColor ?? "var(--pink)",
				} as CSSProperties
			}>
			<span className={styles.bannerName}>{banner.name}</span>
			<span className={styles.bannerDate}>
				{format(banner.startDate)}
				{" ▸ "}
				{format(banner.endDate)}
			</span>
		</span>
	)
}

// The banner a manual pull was made on: a button showing the chosen one's
// art, dropping down every banner the same way.
export function BannerPicker({
	banners,
	value,
	onChange,
	label,
}: {
	banners: BannerOption[]
	value: BannerOption | undefined
	onChange: (key: string) => void
	label: string
}) {
	const t = useT()
	const listId = useId()
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const close = useCallback(() => setOpen(false), [])

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className={styles.bannerButton}
				aria-label={label}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={open ? listId : undefined}
				onClick={() => setOpen((current) => !current)}>
				{value ? (
					<BannerArt banner={value} className={styles.bannerArt} />
				) : (
					<span className={styles.bannerNone}>{t("pulls.manual.noBanner")}</span>
				)}
			</button>
			{open && (
				<FloatingPanel
					anchorRef={buttonRef}
					onClose={close}
					matchWidth
					id={listId}
					role="listbox"
					label={label}
					className={styles.bannerList}>
					{banners.map((banner) => (
						<button
							key={banner.key}
							type="button"
							role="option"
							aria-selected={banner.key === value?.key}
							className={styles.bannerOption}
							onClick={() => {
								onChange(banner.key)
								setOpen(false)
								buttonRef.current?.focus()
							}}>
							<BannerArt banner={banner} className={styles.bannerArt} />
						</button>
					))}
				</FloatingPanel>
			)}
		</>
	)
}
