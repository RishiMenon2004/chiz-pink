"use client"

import { ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import type { Pull, ScarboroughFairPull } from "@/types/pulls"

import { EnumRarity } from "@/data/items"

import { useGachaStore } from "@/hooks"
import { useTooltip } from "@/hooks/useTooltip"

import { findPullItem, isScarboroughPull } from "@/helpers"

import { usePullTrackerContext, useSettingsConfigContext, useT } from "@/contexts"

import { AlertContainer, ModalContainer } from "@/components/layout"
import { alertMessage } from "@/components/layout/Alert/AlertContainer"

import { DicePicker } from "./DicePicker"
import { FloatingPanel } from "./FloatingPanel"
import { ItemGrid } from "./ItemGrid"
import { NumberStepper } from "./NumberStepper"
import {
	candidatesFor,
	HARD_PITY,
	resultFields,
	toLocalInput,
	type Result,
} from "./manualPulls"

import styles from "./manualPullEntry.module.css"

function resultOf(pull: Pull): Result {
	if (!isScarboroughPull(pull)) return "1"
	if (pull.resultType === "dice") return String(pull.diceRoll) as Result
	return pull.resultType
}

// Controls laid into the pull's own row, in place of what it shows.
export type PreviewSlots = { dice?: ReactNode; name: ReactNode; pity: ReactNode }

// Edits one stored pull by editing its row: `renderPreview` draws the row
// for the pull as edited so far, its dice, name and pity swapped for
// controls; the rest (the item grid, pity, quantity, time, buttons) opens
// in a box under it. Saving a change to an imported pull turns it into a
// manual one (see gachaPullsActions.editPull); a manual pull can also be
// deleted. `shownPity` is the pity the list shows for it now.
export function PullEditor({
	pull,
	shownPity,
	onClose,
	renderPreview,
}: {
	pull: Pull
	shownPity: number
	onClose: () => void
	renderPreview: (draft: Pull, pity: number, slots: PreviewSlots) => ReactNode
}) {
	const { selectedBanner } = usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()
	const { actions } = useGachaStore()
	const t = useT()
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const scarborough = isScarboroughPull(pull) ? pull : undefined
	const hasDice = selectedBanner !== "arcsBanner"
	// What the banners running when it was pulled feature goes first.
	const candidates = useMemo(
		() => candidatesFor(selectedBanner, { timestamp: pull.timestamp, server }),
		[selectedBanner, pull.timestamp, server]
	)

	// Its name as the picker has it (with "(Arc)" or the like where two
	// items share a name), else the item's own.
	const originalType = scarborough ? scarborough.rewardType : "arc"
	const originalName =
		candidates.find((c) => c.id === pull.rewardId && c.rewardType === originalType)?.name ??
		findPullItem(pull.rewardId, originalType).name
	const originalDate = toLocalInput(pull.timestamp)

	const [itemName, setItemName] = useState(originalName)
	const [result, setResult] = useState<Result>(() => resultOf(pull))
	const [quantity, setQuantity] = useState(scarborough?.quantity || 1)
	const [pity, setPity] = useState(shownPity)
	// Reset: the pity set by hand is dropped, back to the counted one.
	const [pityReset, setPityReset] = useState(false)
	const [dateInput, setDateInput] = useState(originalDate)
	const [gridOpen, setGridOpen] = useState(false)
	const gridId = useId()
	const nameRef = useRef<HTMLInputElement>(null)
	const closeGrid = useCallback(() => setGridOpen(false), [])
	const [confirmingDelete, setConfirmingDelete] = useState(false)

	// Escape closes the delete alert alone, not the editor under it.
	useEffect(() => {
		if (!confirmingDelete) return
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return
			e.stopImmediatePropagation()
			setConfirmingDelete(false)
		}
		window.addEventListener("keydown", onKeyDown, true)
		return () => window.removeEventListener("keydown", onKeyDown, true)
	}, [confirmingDelete])

	const item = candidates.find(
		(c) => c.name.toLowerCase() === itemName.trim().toLowerCase()
	)
	// Any pull's pity can be set; it's only stored once it differs from the
	// pity shown. Arc pity can be 0 (a second rate-up in one ten-pull).
	const isSRank = item?.rarity === EnumRarity.Epic
	const minPity = hasDice ? 1 : 0
	const pityOverride = pityReset ? undefined : pity !== shownPity ? pity : pull.pity

	// Unchanged, the time keeps its seconds; the input only has minutes.
	const timestamp =
		dateInput === originalDate ? pull.timestamp : new Date(dateInput).getTime()
	const valid = Boolean(item) && !Number.isNaN(timestamp)

	// The pull as edited so far. Until a typed name matches an item, it
	// keeps its old one.
	const draft = useMemo((): Pull => {
		const { pity: _oldPity, ...rest } = pull
		void _oldPity
		const edited = {
			...rest,
			timestamp: Number.isNaN(timestamp) ? pull.timestamp : timestamp,
			rank: item?.rarity ?? pull.rank,
			rewardId: item?.id ?? pull.rewardId,
			...(pityOverride !== undefined ? { pity: pityOverride } : {}),
		}
		if (!hasDice) return edited

		const rewardType = item?.rewardType ?? scarborough?.rewardType ?? "item"
		return {
			...(edited as ScarboroughFairPull),
			...resultFields(result),
			rewardType,
			quantity: rewardType === "item" ? quantity : (scarborough?.quantity ?? 1),
		} satisfies ScarboroughFairPull
	}, [pull, timestamp, item, pityOverride, hasDice, scarborough, result, quantity])

	const save = () => {
		if (!valid) return
		const changed = (Object.keys({ ...pull, ...draft }) as (keyof Pull)[]).some(
			(key) =>
				(pull as Record<string, unknown>)[key] !== (draft as Record<string, unknown>)[key]
		)
		if (changed) actions.editPull(selectedBanner, pull.uid, draft)
		onClose()
	}

	const slots: PreviewSlots = {
		dice: hasDice ? (
			<DicePicker
				value={result}
				onChange={setResult}
				label={t("pulls.manual.result")}
				className={styles.previewDice}
			/>
		) : undefined,
		name: (
			<input
				ref={nameRef}
				type="text"
				role="combobox"
				aria-controls={gridId}
				className={styles.previewName}
				aria-label={t("pulls.manual.item")}
				aria-expanded={gridOpen}
				data-valid={Boolean(item)}
				autoComplete="off"
				value={itemName}
				onFocus={() => setGridOpen(true)}
				onClick={() => setGridOpen(true)}
				onChange={(e) => {
					setItemName(e.currentTarget.value)
					setGridOpen(true)
				}}
			/>
		),
		pity: <span className={styles.previewPity}>{pity}</span>,
	}

	return (
		<form
			className={styles.editor}
			aria-label={t("pulls.manual.editTitle")}
			onClick={(e) => e.stopPropagation()}
			onSubmit={(e) => {
				e.preventDefault()
				save()
			}}>
			{renderPreview(draft, pity, slots)}
			{gridOpen && (
				<FloatingPanel anchorRef={nameRef} onClose={closeGrid}>
					<ItemGrid
						id={gridId}
						candidates={candidates}
						query={item ? "" : itemName.trim()}
						selected={item}
						onPick={(candidate) => {
							setItemName(candidate.name)
							setGridOpen(false)
							nameRef.current?.focus()
						}}
					/>
				</FloatingPanel>
			)}

			<div className={`metallic-panel ${styles.editorBox}`}>
				{!pull.manual && (
					<p className={styles.note}>{t("pulls.manual.editNote")}</p>
				)}

				<div className={styles.fields}>
					<div
						className={styles.field}
						onPointerEnter={showTooltip}
						onPointerLeave={hideTooltip}>
						<b>{t("pulls.manual.pity")}</b>
						<span className={styles.pityControl}>
							<NumberStepper
								value={pity}
								onChange={(value) => {
									setPityReset(false)
									setPity(value)
								}}
								min={minPity}
								max={HARD_PITY[selectedBanner]}
								label={t("pulls.manual.pity")}
							/>
							{pull.pity !== undefined && !pityReset && (
								<button
									type="button"
									className={styles.advancedLink}
									onClick={() => {
										setPityReset(true)
										setPity(shownPity)
									}}>
									{t("pulls.manual.pityReset")}
								</button>
							)}
						</span>
					</div>

					<Tooltip offset={{ x: 32, y: 0 }}>
						<div>{t("pulls.manual.pity")}</div>
						<div className="tooltip-details">
							{t(isSRank ? "pulls.manual.pityHint" : "pulls.manual.pityHintAny")}
						</div>
					</Tooltip>

					{item?.rewardType === "item" && hasDice && (
						<div className={styles.field}>
							<b>{t("pulls.manual.quantity")}</b>
							<NumberStepper
								value={quantity}
								onChange={setQuantity}
								min={1}
								label={t("pulls.manual.quantity")}
							/>
						</div>
					)}

					<label className={styles.field}>
						<b>{t("pulls.manual.date")}</b>
						<input
							type="datetime-local"
							className={`inset-control ${styles.input}`}
							value={dateInput}
							required
							onChange={(e) => setDateInput(e.currentTarget.value)}
						/>
					</label>
				</div>

				<div className={styles.actions}>
					{pull.manual && (
						<button
							type="button"
							className="pill-button"
							data-variant="danger"
							onClick={() => setConfirmingDelete(true)}>
							{t("pulls.manual.deleteButton")}
						</button>
					)}
					<button type="button" className="pill-button" onClick={onClose}>
						{t("pulls.manual.cancel")}
					</button>
					<button type="submit" className="pill-button" disabled={!valid}>
						{t("pulls.manual.saveEdit")}
					</button>
				</div>
			</div>

			{confirmingDelete &&
				createPortal(
					<ModalContainer>
						<AlertContainer
							type="dangerous-confirm"
							confirmLabel={t("pulls.manual.deleteButton")}
							cancelLabel={t("pulls.manual.cancel")}
							onCancel={() => setConfirmingDelete(false)}
							onConfirm={() => {
								actions.removePulls(selectedBanner, [pull.uid])
								onClose()
							}}>
							{t("pulls.manual.deleteConfirm")}
							<br />
							<p className={alertMessage}>{t("pulls.manual.deleteConfirmNote")}</p>
						</AlertContainer>
					</ModalContainer>,
					document.body
				)}
		</form>
	)
}
