"use client"

import {
	CSSProperties,
	ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import Image from "next/image"

import type { MiracleBoxPull, ScarboroughFairPull } from "@/types/pulls"

import { getItemRarityStyle } from "@/data/items"

import { useTooltip } from "@/hooks/useTooltip"

import {
	findPullItem,
	getOptimizedImageUrl,
	isRateUp,
	isScarboroughPull,
} from "@/helpers"

import {
	usePullTrackerContext,
	useSettingsConfigContext,
	useT,
} from "@/contexts"

import type { Pull } from "./pullsGrouping"

import styles from "./pullsListSection.module.css"

const HOLD_MS = 500
const HOLD_SLOP = 10
const GHOST_CLICK_MS = 450
const TOOLTIP_OFFSET = { x: 32, y: 0 }

// Lifting the finger that just opened the lifted editor fires touchend and
// then synthesized mouse/click events at the same coordinates, which now sit
// over the editor's inputs (e.g. the item name field). Suppress that release
// until the press finishes, disarming immediately on any new press.
let releaseGuardCleanup: (() => void) | null = null

function swallowHoldRelease(pointerId: number | null) {
	releaseGuardCleanup?.()

	let released = pointerId === null
	let releaseTimer: number | null = null

	const cleanup = () => {
		if (releaseTimer !== null) {
			window.clearTimeout(releaseTimer)
			releaseTimer = null
		}
		window.removeEventListener("touchend", onTouchEnd, true)
		window.removeEventListener("touchcancel", onRelease, true)
		window.removeEventListener("pointerup", onPointerRelease, true)
		window.removeEventListener("pointercancel", onPointerRelease, true)
		window.removeEventListener("pointerdown", onNewPointerDown, true)
		window.removeEventListener("touchstart", onNewTouchStart, true)
		window.removeEventListener("contextmenu", onContextMenu, true)
		window.removeEventListener("mousedown", onMouseEvent, true)
		window.removeEventListener("mouseup", onMouseEvent, true)
		window.removeEventListener("click", onMouseEvent, true)
		window.removeEventListener("blur", cleanup)
		if (releaseGuardCleanup === cleanup) releaseGuardCleanup = null
	}

	const scheduleCleanup = () => {
		released = true
		if (releaseTimer === null) {
			releaseTimer = window.setTimeout(cleanup, GHOST_CLICK_MS)
		}
	}

	const onTouchEnd = (e: TouchEvent) => {
		if (e.cancelable) e.preventDefault()
		if (e.touches.length === 0) scheduleCleanup()
	}

	const onRelease = () => {
		scheduleCleanup()
	}

	const onPointerRelease = (e: PointerEvent) => {
		if (pointerId === null || e.pointerId === pointerId) {
			scheduleCleanup()
		}
	}

	const onNewPointerDown = (e: PointerEvent) => {
		if (released || (e.isPrimary && e.pointerId !== pointerId)) {
			cleanup()
		}
	}

	const onNewTouchStart = (e: TouchEvent) => {
		if (released || e.touches.length === 1) {
			cleanup()
		}
	}

	const onContextMenu = (e: MouseEvent) => {
		if (!released) {
			e.preventDefault()
			e.stopPropagation()
			e.stopImmediatePropagation()
		}
	}

	const onMouseEvent = (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		e.stopImmediatePropagation()
		if (e.type === "click") cleanup()
	}

	if (released) scheduleCleanup()

	window.addEventListener("touchend", onTouchEnd, {
		capture: true,
		passive: false,
	})
	window.addEventListener("touchcancel", onRelease, true)
	window.addEventListener("pointerup", onPointerRelease, true)
	window.addEventListener("pointercancel", onPointerRelease, true)
	window.addEventListener("pointerdown", onNewPointerDown, true)
	window.addEventListener("touchstart", onNewTouchStart, true)
	window.addEventListener("contextmenu", onContextMenu, true)
	window.addEventListener("mousedown", onMouseEvent, true)
	window.addEventListener("mouseup", onMouseEvent, true)
	window.addEventListener("click", onMouseEvent, true)
	window.addEventListener("blur", cleanup)

	releaseGuardCleanup = cleanup
}

export type PullActions = {
	onMenu: (pull: Pull, anchor: HTMLElement, x: number, y: number) => void
	onEdit: (pull: Pull, anchor: HTMLElement) => void
}

function DiceRoll({ pull }: { pull: MiracleBoxPull | ScarboroughFairPull }) {
	const { selectedBanner } = usePullTrackerContext()
	const t = useT()

	if (selectedBanner === "arcsBanner") return null

	const isScarborough = isScarboroughPull(pull)
	if (isScarborough) {
		const pullDice = () => {
			switch (pull.resultType) {
				case "dice":
					return pull.diceRoll !== undefined ? (
						<Image
							width={84}
							height={32}
							src={`/pulls/dice_${pull.diceRoll}.png`}
							alt={t("pulls.list.diceRollAlt", { roll: pull.diceRoll })}
						/>
					) : (
						<div className={styles.nonDice}>{t("pulls.list.ntewizSource")}</div>
					)
				case "pointsGift":
					return <div className={styles.nonDice}>{t("pulls.list.pointsGift")}</div>
				case "slumberland":
					return <div className={styles.nonDice}>{t("pulls.list.slumberland")}</div>
			}
		}
		return <div className={styles.pullDice}>{pullDice()}</div>
	}
}

export function PullEntry({
	pull,
	pity,
	pullNumber,
	actions,
	slots,
	highlighted = false,
}: {
	pull: MiracleBoxPull | ScarboroughFairPull
	pity: number
	pullNumber: number
	highlighted?: boolean
	actions?: PullActions
	slots?: { dice?: ReactNode; name: ReactNode; pity: ReactNode }
}) {
	const t = useT()
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()
	const [hoveringManualTag, setHoveringManualTag] = useState(false)
	const hold = useRef<{
		timer: number
		pointerId: number
		x: number
		y: number
		fired: boolean
	} | null>(null)
	const lastPointer = useRef<string>("mouse")

	const cancelHold = () => {
		if (hold.current) window.clearTimeout(hold.current.timer)
		hold.current = null
	}

	useEffect(() => {
		return () => {
			if (hold.current) window.clearTimeout(hold.current.timer)
			hold.current = null
		}
	}, [])

	const { selectedBanner, gachaBanners } = usePullTrackerContext()
	const {
		userdata: { server },
	} = useSettingsConfigContext()

	const isScarborough = isScarboroughPull(pull)

	const item = findPullItem(
		pull.rewardId,
		isScarborough ? pull.rewardType : "arc"
	)

	const rewardType = isScarborough ? pull.rewardType : "arc"
	const sourceDir: Record<ScarboroughFairPull["rewardType"], string> = {
		arc: "/arcs/",
		item: "/materials/",
		cosmetic: "/materials/",
		character: "/characters/avatar/",
	}
	const imageSrc = `${sourceDir[rewardType]}${item.imageSrc}`

	const isRateup = useMemo(
		() => isRateUp(selectedBanner, gachaBanners, pull, server),
		[selectedBanner, gachaBanners, pull, server]
	)

	return (
		<>
			<div className={styles.pullNumber}>
				{pullNumber > 0 ? pullNumber : "-"}
			</div>
			<div
				key={pull.uid}
				data-rateup={isRateup}
				data-rewardtype={rewardType}
				data-highlighted={highlighted || undefined}
				style={
					{
						"--bg-image": `url("${getOptimizedImageUrl(imageSrc)}")`,
					} as CSSProperties
				}
				className={`${styles.pullEntry} ${getItemRarityStyle(item)}`}
				tabIndex={actions ? 0 : undefined}
				aria-label={
					actions
						? t("pulls.manual.rowLabel", {
								name: item?.name ?? pull.rewardId,
								pity: pullNumber > 0 ? pity : "-",
							})
						: undefined
				}
				aria-haspopup={actions ? "menu" : undefined}
				onKeyDown={(e) => {
					if (!actions || e.target !== e.currentTarget) return
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						hideTooltip()
						actions.onEdit(pull, e.currentTarget)
					}
				}}
				onPointerEnter={actions ? showTooltip : undefined}
				onPointerLeave={
					actions
						? () => {
								setHoveringManualTag(false)
								hideTooltip()
							}
						: undefined
				}
				onPointerDown={(e) => {
					lastPointer.current = e.pointerType
					if (!actions || e.pointerType === "mouse") return
					cancelHold()
					if (!e.isPrimary) return
					const anchor = e.currentTarget
					const { pointerId } = e
					hold.current = {
						pointerId,
						x: e.clientX,
						y: e.clientY,
						fired: false,
						timer: window.setTimeout(() => {
							if (hold.current) hold.current.fired = true
							hideTooltip()
							swallowHoldRelease(pointerId)
							actions.onEdit(pull, anchor)
						}, HOLD_MS),
					}
				}}
				onPointerMove={(e) => {
					const start = hold.current
					if (
						start &&
						!start.fired &&
						start.pointerId === e.pointerId &&
						Math.hypot(e.clientX - start.x, e.clientY - start.y) > HOLD_SLOP
					)
						cancelHold()
				}}
				onPointerUp={(e) => {
					if (hold.current?.pointerId === e.pointerId) cancelHold()
				}}
				onPointerCancel={(e) => {
					if (hold.current?.pointerId === e.pointerId) cancelHold()
				}}
				onContextMenu={(e) => {
					if (!actions) return
					e.preventDefault()
					hideTooltip()
					// Long-press on touch also raises contextmenu; edit instead.
					if (lastPointer.current !== "mouse") {
						if (!hold.current?.fired) {
							const activePointerId = hold.current?.pointerId ?? null
							cancelHold()
							swallowHoldRelease(activePointerId)
							actions.onEdit(pull, e.currentTarget)
						}
						return
					}
					const rect = e.currentTarget.getBoundingClientRect()
					const fromKeyboard = e.clientX === 0 && e.clientY === 0
					actions.onMenu(
						pull,
						e.currentTarget,
						fromKeyboard ? rect.left + 16 : e.clientX,
						fromKeyboard ? rect.bottom : e.clientY
					)
				}}>
				<div className={styles.pullArt} aria-hidden />
				{slots?.dice ? (
					<div className={styles.pullDice}>{slots.dice}</div>
				) : (
					<DiceRoll pull={pull} />
				)}

				<div
					className={styles.pullName}
					style={{
						gridColumn:
							selectedBanner === "arcsBanner" ? "span 2" : "unset",
					}}>
					{slots ? (
						slots.name
					) : (
						<>
							{item?.name}
							{isScarborough &&
								pull.rewardType === "item" &&
								pull.quantity > 0 &&
								` ×${pull.quantity}`}
							{pull.manual && (
								<span
									role="img"
									className={styles.manualTag}
									aria-label={t("pulls.manual.tag_tooltip")}
									onPointerEnter={(e) => {
										setHoveringManualTag(true)
										showTooltip(e)
									}}
									onPointerLeave={(e) => {
										setHoveringManualTag(false)
										showTooltip(e)
									}}
								/>
							)}
						</>
					)}
				</div>
				<div className={styles.pullPity}>
					{slots ? slots.pity : pullNumber > 0 ? pity : "-"}
				</div>
				{actions && (
					<Tooltip
						offset={TOOLTIP_OFFSET}
						subText={
							hoveringManualTag ? t("pulls.list.editHintDesktop") : undefined
						}>
						{hoveringManualTag ? (
							t("pulls.manual.tag_tooltip")
						) : (
							<div className={styles.editTooltip}>
								{t("pulls.list.editHintDesktop")}
							</div>
						)}
					</Tooltip>
				)}
			</div>
		</>
	)
}
