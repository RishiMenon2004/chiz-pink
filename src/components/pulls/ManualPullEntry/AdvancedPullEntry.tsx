"use client"

import { useMemo, useState } from "react"

import type { MiracleBoxPull, ScarboroughFairPull } from "@/types/pulls"

import { useGachaStore } from "@/hooks"

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

import settingsStyles from "@/app/[lang]/settings/settings.module.css"
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
export function AdvancedPullEntry({ onClose }: { onClose: () => void }) {
	const { selectedBanner, gachaBanners } = usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()
	const { actions } = useGachaStore()
	const t = useT()

	const [dateInput, setDateInput] = useState(() => toLocalInput(Date.now()))
	const [bannerName, setBannerName] = useState<string>("")
	const [rows, setRows] = useState<Row[]>(() => newRows(1))
	const [savedCount, setSavedCount] = useState<number | null>(null)

	const isArcs = selectedBanner === "arcsBanner"
	const hasDice = !isArcs
	const timestamp = new Date(dateInput).getTime()


	// The banners running at the chosen time, reruns included. The
	// permanent board has just the one.
	const banners = useMemo(() => {
		if (selectedBanner === "permanentBanner" || Number.isNaN(timestamp)) return []
		const all = isArcs
			? staticArcBanners
			: getResolvedGachaBanners(gachaBanners, server)
		return all.filter((banner) =>
			isPullInBannerWindow(banner, { timestamp } as MiracleBoxPull)
		)
	}, [selectedBanner, isArcs, gachaBanners, server, timestamp])

	const banner =
		banners.find((b) => b.name === bannerName) ?? banners[0] ?? undefined

	// What the banners running at the chosen time feature goes first.
	const candidates = useMemo(
		() =>
			candidatesFor(
				selectedBanner,
				Number.isNaN(timestamp) ? undefined : { timestamp, server }
			),
		[selectedBanner, timestamp, server]
	)
	const byName = useMemo(
		() => new Map(candidates.map((c) => [c.name.toLowerCase(), c])),
		[candidates]
	)

	const resolved = rows.map((row) => byName.get(row.itemName.trim().toLowerCase()))
	const canSave =
		!Number.isNaN(timestamp) && rows.length > 0 && resolved.every(Boolean)

	const updateRow = (key: number, change: Partial<Row>) => {
		setSavedCount(null)
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
		setSavedCount(pulls.length)
		setRows(newRows(rows.length))
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
							setSavedCount(null)
							setDateInput(e.currentTarget.value)
						}}
					/>
				</label>

				{selectedBanner !== "permanentBanner" && (
					<label className={styles.field}>
						<b>{t("pulls.manual.banner")}</b>
						<select
							className={`inset-control ${settingsStyles.configSelect}`}
							value={banner?.name ?? ""}
							disabled={banners.length === 0}
							onChange={(e) => setBannerName(e.currentTarget.value)}>
							{banners.length === 0 && (
								<option value="">{t("pulls.manual.noBanner")}</option>
							)}
							{banners.map((b) => (
								<option key={`${b.name}-${b.startDate}`} value={b.name}>
									{b.name}
								</option>
							))}
						</select>
					</label>
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
									setSavedCount(null)
									setRows(newRows(count))
								}}>
								{t(count === 1 ? "pulls.manual.single" : "pulls.manual.tenPull")}
							</button>
						))}
					</div>
				</div>
			</div>

			<ol className={styles.rows}>
				{rows.map((row, index) => {
					const item = resolved[index]
					return (
						<li key={row.key} className={styles.row}>
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
							{item?.rewardType === "item" && (
								<NumberStepper
									value={row.quantity}
									onChange={(quantity) => updateRow(row.key, { quantity })}
									min={1}
									label={t("pulls.manual.quantityLabel", { number: index + 1 })}
								/>
							)}
							{rows.length > 1 && (
								<button
									type="button"
									className={styles.removeRow}
									aria-label={t("pulls.manual.removeRow", { number: index + 1 })}
									onClick={() => {
										setSavedCount(null)
										setRows((current) => current.filter((r) => r.key !== row.key))
									}}
								/>
							)}
						</li>
					)
				})}
			</ol>

			{hasDice && (
				<button
					type="button"
					className={`pill-button ${styles.addRow}`}
					onClick={() => {
						setSavedCount(null)
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

			{savedCount !== null && (
				<p className={styles.saved} role="status">
					{t("pulls.manual.saved", { count: savedCount })}
				</p>
			)}
		</form>
	)
}
