"use client"

import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

import type { MiracleBoxPull, ScarboroughFairPull } from "@/types/pulls"

import { EnumRarity } from "@/data/items"

import { useGachaStore } from "@/hooks"
import { useTooltip } from "@/hooks/useTooltip"

import {
	findRateUpBanner,
	getResolvedGachaBanners,
	isRateUp,
	isPullInBannerWindow,
	isScarboroughPull,
	poolIdForBanner,
	staticArcBanners,
} from "@/helpers"

import {
	usePullTrackerContext,
	useSettingsConfigContext,
	useT,
} from "@/contexts"

import { ModalContainer } from "@/components/layout"

import { AdvancedPullEntry } from "./AdvancedPullEntry"
import { DicePicker } from "./DicePicker"
import { ItemPicker } from "./ItemPicker"
import { NumberStepper } from "./NumberStepper"
import {
	candidatesFor,
	HARD_PITY,
	newManualUid,
	resultFields,
	type Result,
} from "./manualPulls"

import styles from "./manualPullEntry.module.css"

type Row = { key: number; itemName: string; result: Result; pity: number | null }

// At most a ten-pull's worth of rows at a time.
const MAX_ROWS = 10

// A Points Gift comes with every 10 dice pulls on the character boards.
const PULLS_PER_GIFT = 10

let nextRowKey = 0
const newRow = (result: Result): Row => ({
	key: nextRowKey++,
	itemName: "",
	result,
	pity: null,
})
const randomDice = () => String(1 + Math.floor(Math.random() * 6)) as Result
const isDiceResult = (result: Result) => /^[1-6]$/.test(result)

// Logs pulls by hand on the board selected at the top of the page, made
// just now. Nothing shows until +1 or +10 adds rows to fill in (more can
// be added before saving): the item, its dice roll on the character
// boards, and for an S-rank the pity it came at, which is enough to log
// only S-ranks. A date or a banner of its own is in the advanced form.
export function ManualPullEntry() {
	const { selectedBanner, gachaBanners, pulls, pityMap } = usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()
	const { actions } = useGachaStore()
	const t = useT()
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const [rows, setRows] = useState<Row[]>([])
	const [savedCount, setSavedCount] = useState<number | null>(null)
	const [showAdvanced, setShowAdvanced] = useState(false)

	const isArcs = selectedBanner === "arcsBanner"
	const hasDice = !isArcs
	// What's running when the form is first shown goes first.
	const [openedAt] = useState(() => Date.now())
	const candidates = useMemo(
		() => candidatesFor(selectedBanner, { timestamp: openedAt, server }),
		[selectedBanner, openedAt, server]
	)
	const byName = useMemo(
		() => new Map(candidates.map((c) => [c.name.toLowerCase(), c])),
		[candidates]
	)
	const resolved = rows.map((row) => byName.get(row.itemName.trim().toLowerCase()))

	// The pity the next pull would be counted at, going by what's stored.
	const nextPity = useMemo(() => {
		const latest = pulls[0]
		if (!latest) return 1
		const latestPity = pityMap[selectedBanner].get(latest.uid) ?? 0
		const latestWasSRank = isRateUp(selectedBanner, gachaBanners, latest, server)
		if (isArcs) return latestWasSRank ? 10 : latestPity
		return latestWasSRank ? 1 : latestPity + 1
	}, [pulls, pityMap, selectedBanner, isArcs, gachaBanners, server])

	// Each row's counted pity, going on from the row above as it stands (its
	// pity set by hand, if it was): on the character boards it climbs a pull
	// at a time and restarts after an S-rank. Arc pity goes by ten-pull
	// group, so a row keeps the one above's.
	// A result that isn't a dice roll (a Points Gift) doesn't count.
	const countedPities = rows.reduce<number[]>((counted, _row, index) => {
		if (index === 0) return [nextPity]
		const aboveRow = rows[index - 1]
		const above = aboveRow.pity ?? counted[index - 1]
		const aboveWasSRank = resolved[index - 1]?.rarity === EnumRarity.Epic
		if (isArcs) return [...counted, aboveWasSRank ? 10 : above]
		if (!isDiceResult(aboveRow.result)) return [...counted, above]
		return [...counted, aboveWasSRank ? 1 : above + 1]
	}, [])

	// Dice pulls since the last Points Gift in what's stored (newest first).
	// With no gift on record, where the count stands in its cycle of ten.
	const dicePullsSinceGift = useMemo(() => {
		if (isArcs) return 0
		let count = 0
		for (const pull of pulls) {
			if (!isScarboroughPull(pull)) continue
			if (pull.resultType === "pointsGift") return count
			if (pull.resultType === "dice") count++
		}
		return count % PULLS_PER_GIFT
	}, [pulls, isArcs])
	// Which row's pity the tooltip is about: an S-rank's, or any other's.
	const [hoveredSRank, setHoveredSRank] = useState(false)

	const canSave = rows.length > 0 && resolved.every(Boolean)

	// Up to MAX_ROWS: +10 fills whatever room is left. On the character
	// boards each new row gets a random dice roll, except that the pull after
	// every tenth dice roll (counting stored pulls and the rows above) is a
	// Points Gift.
	const addRows = (count: number) => {
		setSavedCount(null)
		setRows((current) => {
			let since = dicePullsSinceGift
			for (const row of current) {
				if (row.result === "pointsGift") since = 0
				else if (isDiceResult(row.result)) since++
			}
			const room = Math.min(count, MAX_ROWS - current.length)
			const added = Array.from({ length: room }, () => {
				if (!hasDice) return newRow("1")
				if (since >= PULLS_PER_GIFT) {
					since = 0
					return newRow("pointsGift")
				}
				since++
				return newRow(randomDice())
			})
			return [...current, ...added]
		})
	}
	const full = rows.length >= MAX_ROWS
	const updateRow = (key: number, change: Partial<Row>) => {
		setSavedCount(null)
		setRows((current) =>
			current.map((row) => (row.key === key ? { ...row, ...change } : row))
		)
	}

	const save = () => {
		if (!canSave) return
		const timestamp = Date.now()
		const banners = isArcs
			? staticArcBanners
			: selectedBanner === "limitedBanner"
				? getResolvedGachaBanners(gachaBanners, server)
				: []

		// Rows are in the order pulled; the list wants the newest first.
		const added = rows
			.map((row, index) => {
				const item = resolved[index]!
				const counted = countedPities[index]
				const pity = row.pity ?? counted
				// A rate-up's own banner, else whichever is running now.
				const probe = { uid: "", timestamp, rank: item.rarity, rewardId: item.id }
				const banner =
					findRateUpBanner(banners, probe) ??
					banners.find((b) => isPullInBannerWindow(b, probe))
				const poolId = poolIdForBanner(selectedBanner, banner)

				const base = {
					uid: newManualUid(),
					timestamp,
					rank: item.rarity,
					rewardId: item.id,
					...(poolId ? { poolId } : {}),
					manual: true as const,
					...(pity !== counted && (!hasDice || isDiceResult(row.result)) ? { pity } : {}),
				}
				if (!hasDice) return base satisfies MiracleBoxPull
				return {
					...base,
					...resultFields(row.result),
					rewardType: item.rewardType,
					quantity: 1,
				} satisfies ScarboroughFairPull
			})
			.reverse()

		actions.addManualPulls(added as MiracleBoxPull[] | ScarboroughFairPull[], selectedBanner)
		setSavedCount(added.length)
		setRows([])
	}

	return (
		<>
			<form
				className={styles.manualEntry}
				onSubmit={(e) => {
					e.preventDefault()
					save()
				}}>
				<div className={styles.quickButtons}>
					<button
						type="button"
						className={`pill-button ${styles.quickButton}`}
						aria-label={t("pulls.manual.addOneLabel")}
						disabled={full}
						onClick={() => addRows(1)}>
						+1
					</button>
					<button
						type="button"
						className={`pill-button ${styles.quickButton}`}
						aria-label={t("pulls.manual.addTenLabel")}
						disabled={full}
						onClick={() => addRows(MAX_ROWS)}>
						+10
					</button>
					<button
						type="button"
						className={`pill-button ${styles.advancedButton}`}
						onClick={() => setShowAdvanced(true)}>
						{t("pulls.manual.advanced")}
					</button>
				</div>

				{rows.length > 0 && (
					<div className={styles.entryTable} data-dice={hasDice}>
						<div className={styles.entryHead} aria-hidden>
							<span />
							<span>{t("pulls.list.item")}</span>
							{hasDice && <span>{t("pulls.list.dice")}</span>}
							<span>{t("pulls.list.pity")}</span>
							<span />
						</div>
						<ol className={styles.entryRows}>
							{rows.map((row, index) => {
								const item = resolved[index]
								const counted = countedPities[index]
								return (
									<li key={row.key}>
										<span className={styles.rowNumber}>{index + 1}</span>
										<ItemPicker
											value={row.itemName}
											onChange={(itemName) => updateRow(row.key, { itemName })}
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
										{/* Every row shows its pity, item picked or not; any can be
										    set by hand, as in the editor. A Points Gift has none. */}
										{hasDice && !isDiceResult(row.result) ? (
											<span className={styles.noPity}>-</span>
										) : (
											<span
												className={styles.simplePity}
												onPointerEnter={(e) => {
													setHoveredSRank(item?.rarity === EnumRarity.Epic)
													showTooltip(e)
												}}
												onPointerLeave={hideTooltip}>
												<NumberStepper
													value={row.pity ?? counted}
													onChange={(pity) => updateRow(row.key, { pity })}
													min={isArcs ? 0 : 1}
													max={HARD_PITY[selectedBanner]}
													label={t("pulls.manual.pity")}
												/>
											</span>
										)}
										<button
											type="button"
											className={styles.removeRow}
											aria-label={t("pulls.manual.removeRow", { number: index + 1 })}
											onClick={() => {
												setSavedCount(null)
												setRows((current) => current.filter((r) => r.key !== row.key))
											}}
										/>
									</li>
								)
							})}
						</ol>
					</div>
				)}
				<Tooltip offset={{ x: 32, y: 0 }}>
					<div>{t("pulls.manual.pity")}</div>
					<div className="tooltip-details">
						{t(hoveredSRank ? "pulls.manual.pityHint" : "pulls.manual.pityHintAny")}
					</div>
				</Tooltip>

				{rows.length > 0 && (
					<div className={`${styles.actions} ${styles.entryActions}`}>
						<button type="button" className="pill-button" onClick={() => setRows([])}>
							{t("pulls.manual.clear")}
						</button>
						<button type="submit" className="pill-button" disabled={!canSave}>
							{t("pulls.manual.save", { count: rows.length })}
						</button>
					</div>
				)}

				{savedCount !== null && (
					<p className={styles.saved} role="status">
						{t("pulls.manual.saved", { count: savedCount })}
					</p>
				)}
			</form>

			{showAdvanced &&
				createPortal(
					<ModalContainer onClickOut={() => setShowAdvanced(false)}>
						<AdvancedPullEntry onClose={() => setShowAdvanced(false)} />
					</ModalContainer>,
					document.body
				)}
		</>
	)
}
