"use client"

import { CSSProperties, ReactNode, useMemo, useRef } from "react"
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

export type PullActions = {
	onMenu: (pull: Pull, anchor: HTMLElement, x: number, y: number) => void
	onEdit: (pull: Pull, anchor: HTMLElement) => void
}

function DiceRoll({ pull }: { pull: MiracleBoxPull | ScarboroughFairPull }) {
	const { selectedBanner } = usePullTrackerContext()
	const t = useT()

	if (selectedBanner === "arcsBanner") return null

	const isScarborough = isScarboroughPull(pull)
	if (isScarborough && pull.diceRoll !== undefined) {
		const pullDice = () => {
			switch (pull.resultType) {
				case "dice":
					return (
						<Image
							width={84}
							height={32}
							src={`/pulls/dice_${pull.diceRoll}.png`}
							alt={t("pulls.list.diceRollAlt", { roll: pull.diceRoll })}
						/>
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
	const hold = useRef<{ timer: number; x: number; y: number; fired: boolean } | null>(null)
	const lastPointer = useRef<string>("mouse")

	const cancelHold = () => {
		if (hold.current) window.clearTimeout(hold.current.timer)
		hold.current = null
	}

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
						actions.onEdit(pull, e.currentTarget)
					}
				}}
				onPointerDown={(e) => {
					lastPointer.current = e.pointerType
					if (!actions || e.pointerType === "mouse") return
					const anchor = e.currentTarget
					cancelHold()
					hold.current = {
						x: e.clientX,
						y: e.clientY,
						fired: false,
						timer: window.setTimeout(() => {
							if (hold.current) hold.current.fired = true
							actions.onEdit(pull, anchor)
						}, HOLD_MS),
					}
				}}
				onPointerMove={(e) => {
					const start = hold.current
					if (
						start &&
						Math.hypot(e.clientX - start.x, e.clientY - start.y) > HOLD_SLOP
					)
						cancelHold()
				}}
				onPointerUp={cancelHold}
				onPointerCancel={cancelHold}
				onContextMenu={(e) => {
					if (!actions) return
					e.preventDefault()
					// Long-press on touch also raises contextmenu; edit instead.
					if (lastPointer.current !== "mouse") {
						if (!hold.current?.fired) {
							cancelHold()
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
								` ×${pull.quantity}`}
							{pull.manual && (
								<>
									<span
										role="img"
										className={styles.manualTag}
										aria-label={t("pulls.manual.tag_tooltip")}
										onPointerEnter={showTooltip}
										onPointerLeave={hideTooltip}
									/>
									<Tooltip offset={{ x: 32, y: 0 }}>{t("pulls.manual.tag_tooltip")}</Tooltip>
								</>
							)}
						</>
					)}
				</div>
				<div className={styles.pullPity}>
					{slots ? slots.pity : pullNumber > 0 ? pity : "-"}
				</div>
			</div>
		</>
	)
}
