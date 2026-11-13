"use client"

import { useMemo, useState } from "react"

import type { MiracleBoxPull, ScarboroughFairPull } from "@/types/pulls"

import { findArc } from "@/data/arcs"
import { getItemRarityStyle } from "@/data/items"

import { useGachaStore } from "@/hooks"

import { getCharacterBannerThemeColor } from "@/helpers/bannerStatus"
import {
	getResolvedGachaBanners,
	isPullInBannerWindow,
	poolIdForBanner,
	staticArcBanners,
} from "@/helpers"

import {
	usePullTrackerContext,
	useSettingsConfigContext,
	useT,
} from "@/contexts"

import { BannerPicker, type BannerOption } from "./BannerPicker"
import { DicePicker } from "./DicePicker"
import { ItemPicker } from "./ItemPicker"
import { NumberStepper } from "./NumberStepper"
import {
	candidatesFor,
	newManualUid,
	resultFields,
	toLocalInput,
	type Result,
} from "./manualPulls"

import styles from "./manualPullEntry.module.css"

type Row = { key: number; itemName: string; result: Result; quantity: number }

let nextRowKey = 0
const newRow = (): Row => ({
	key: nextRowKey++,
	itemName: "",
	result: "1",
	quantity: 1,
})
const newRows = (count: number) => Array.from({ length: count }, newRow)

// The full manual entry form, opened from the simple one: a date, the
// banner, and a single pull or a ten-pull with a row per result in the
// order pulled, extra results (points gifts, Slumberland) included.
// Saving closes it; `onSaved` hears how many pulls were added.
export function AdvancedPullEntry({
	onClose,
	onSaved,
}: {
	onClose: () => void
	onSaved: (count: number) => void
}) {
	const { selectedBanner, gachaBanners } = usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()
	const { actions } = useGachaStore()
	const t = useT()

	const [dateInput, setDateInput] = useState(() => toLocalInput(Date.now()))
	// A banner picked from the list ("" goes by the date).
	const [bannerKey, setBannerKey] = useState("")
	const [openedAt] = useState(() => Date.now())
	const [rows, setRows] = useState<Row[]>(() => newRows(1))

	const isArcs = selectedBanner === "arcsBanner"
	const hasDice = !isArcs
	const timestamp = new Date(dateInput).getTime()

	// Every banner that has started, reruns included, newest first. The
	// permanent board has just the one, so no list.
	// Each with its art: a limited banner's event art, an arc banner's arc.
	const banners = useMemo(() => {
		if (selectedBanner === "permanentBanner") return []
		const all = isArcs
			? staticArcBanners.map((b) => ({
					...b,
					image: `/arcs/${findArc(b.rateupItem).imageSrc}`,
					offset: "30%",
					themeColor:
						b.themeColor ??
						(b.character ? getCharacterBannerThemeColor(b.character) : null) ??
						undefined,
				}))
			: getResolvedGachaBanners(gachaBanners, server).map((b, index) => ({
					...b,
					image: `/events/${gachaBanners[index].eventImage}`,
					offset: gachaBanners[index].yOffset,
				}))
		return all
			.filter((b) => b.startDate <= openedAt)
			.toSorted((a, b) => b.startDate - a.startDate)
	}, [selectedBanner, isArcs, gachaBanners, server, openedAt])
	const keyOf = (b: { name: string; startDate: number }) => `${b.name}-${b.startDate}`
	const inWindow = (b: { startDate: number; endDate: number }, time: number) =>
		isPullInBannerWindow(b, { timestamp: time } as MiracleBoxPull)

	// The one picked, else the one running at the chosen time.
	const banner =
		banners.find((b) => keyOf(b) === bannerKey) ??
		(Number.isNaN(timestamp) ? undefined : banners.find((b) => inWindow(b, timestamp)))

	// What the banners running at the chosen time feature goes first.
	// (Memoized by the React Compiler.)
	const candidates = candidatesFor(
		selectedBanner,
		Number.isNaN(timestamp) ? undefined : { timestamp, server }
	)
	const byName = new Map(candidates.map((c) => [c.name.toLowerCase(), c]))

	const resolved = rows.map((row) => byName.get(row.itemName.trim().toLowerCase()))
	const canSave =
		!Number.isNaN(timestamp) && rows.length > 0 && resolved.every(Boolean)

	const updateRow = (key: number, change: Partial<Row>) => {
		setRows((current) =>
			current.map((row) => (row.key === key ? { ...row, ...change } : row))
		)
	}

	const save = () => {
		if (!canSave) return
		const poolId = poolIdForBanner(selectedBanner, banner)

		// Rows are in the order pulled; the list wants the newest first.
		const pulls = rows
			.map((row, index) => {
				const item = resolved[index]!
				const base = {
					uid: newManualUid(),
					timestamp,
					rank: item.rarity,
					rewardId: item.id,
					...(poolId ? { poolId } : {}),
					manual: true as const,
				}
				if (!hasDice) return base satisfies MiracleBoxPull

				return {
					...base,
					...resultFields(row.result),
					rewardType: item.rewardType,
					quantity: item.rewardType === "item" ? row.quantity : 1,
				} satisfies ScarboroughFairPull
			})
			.reverse()

		actions.addManualPulls(
			pulls as MiracleBoxPull[] | ScarboroughFairPull[],
			selectedBanner
		)
		onSaved(pulls.length)
		onClose()
	}

	return (
		<form
			className={`metallic-panel ${styles.advanced}`}
			aria-label={t("pulls.manual.advancedTitle")}
			onClick={(e) => e.stopPropagation()}
			onSubmit={(e) => {
				e.preventDefault()
				save()
			}}>
			<div className={styles.advancedTitle}>{t("pulls.manual.advancedTitle")}</div>

			<div className={styles.fields}>
				<label className={styles.field}>
					<b>{t("pulls.manual.date")}</b>
					<input
						type="datetime-local"
						className={`inset-control ${styles.input}`}
						value={dateInput}
						required
						onChange={(e) => {
							const value = e.currentTarget.value
							setDateInput(value)
							// A time outside the picked banner goes back to the one
							// running then.
							const picked = banners.find((b) => keyOf(b) === bannerKey)
							if (picked && !inWindow(picked, new Date(value).getTime())) {
								setBannerKey("")
							}
						}}
					/>
				</label>

				{selectedBanner !== "permanentBanner" && (
					<div className={styles.field}>
						<b>{t("pulls.manual.banner")}</b>
						<BannerPicker
							banners={banners.map((b): BannerOption => ({ ...b, key: keyOf(b) }))}
							value={banner && { ...banner, key: keyOf(banner) }}
							label={t("pulls.manual.banner")}
							onChange={(key) => {
								setBannerKey(key)
								// Picking a banner the chosen time isn't in moves the
								// time to its start.
								const picked = banners.find((b) => keyOf(b) === key)
								if (picked && (Number.isNaN(timestamp) || !inWindow(picked, timestamp))) {
									setDateInput(toLocalInput(picked.startDate))
								}
							}}
						/>
					</div>
				)}

				<div className={styles.field}>
					<b>{t("pulls.manual.count")}</b>
					<div className={`inset-control ${styles.countToggle}`}>
						{[1, 10].map((count) => (
							<button
								key={count}
								type="button"
								aria-pressed={rows.length === count}
								className={styles.countButton}
								onClick={() => {
									setRows(newRows(count))
								}}>
								{t(count === 1 ? "pulls.manual.single" : "pulls.manual.tenPull")}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Laid out as the quick form's rows: one strip each, under
			    headers. Every row has every cell (empty where it doesn't
			    apply) so the columns line up. */}
			<div className={styles.entryTable} data-dice={hasDice} data-quantity={hasDice}>
				<div className={styles.entryHead} aria-hidden>
					<span />
					<span>{t("pulls.list.item")}</span>
					{hasDice && <span>{t("pulls.list.dice")}</span>}
					{hasDice && <span>{t("pulls.manual.quantity")}</span>}
					<span />
				</div>
				<ol className={styles.entryRows}>
					{rows.map((row, index) => {
						const item = resolved[index]
						return (
							<li
								key={row.key}
								className={`inset-control ${styles.entryRow} ${item ? getItemRarityStyle(item) : ""}`}
								data-picked={Boolean(item)}>
								<span className={styles.rowNumber}>{index + 1}</span>
								<ItemPicker
									value={row.itemName}
									onChange={(name) => updateRow(row.key, { itemName: name })}
									candidates={candidates}
									label={t("pulls.manual.itemLabel", { number: index + 1 })}
									className={styles.itemInput}
								/>
								{hasDice && (
									<DicePicker
										value={row.result}
										onChange={(result) => updateRow(row.key, { result })}
										label={t("pulls.manual.resultLabel", { number: index + 1 })}
									/>
								)}
								{hasDice &&
									(item?.rewardType === "item" ? (
										<NumberStepper
											value={row.quantity}
											onChange={(quantity) => updateRow(row.key, { quantity })}
											min={1}
											label={t("pulls.manual.quantityLabel", { number: index + 1 })}
										/>
									) : (
										<span />
									))}
								{rows.length > 1 ? (
									<button
										type="button"
										className={styles.removeRow}
										aria-label={t("pulls.manual.removeRow", { number: index + 1 })}
										onClick={() => {
											setRows((current) => current.filter((r) => r.key !== row.key))
										}}
									/>
								) : (
									<span />
								)}
							</li>
						)
					})}
				</ol>
			</div>

			{hasDice && (
				<button
					type="button"
					className={`pill-button ${styles.addRow}`}
					onClick={() => {
						setRows((current) => [...current, newRow()])
					}}>
					{t("pulls.manual.addRow")}
				</button>
			)}

			<div className={styles.actions}>
				<button type="button" className="pill-button" onClick={onClose}>
					{t("pulls.manual.close")}
				</button>
				<button type="submit" className="pill-button" disabled={!canSave}>
					{t("pulls.manual.save", { count: rows.length })}
				</button>
			</div>
		</form>
	)
}
