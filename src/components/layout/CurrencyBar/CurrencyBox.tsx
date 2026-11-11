"use client"

import Image from "next/image"
import {
	ChangeEvent,
	CSSProperties,
	FocusEvent,
	KeyboardEvent,
	MouseEvent,
	useEffect,
	useRef,
	useState,
} from "react"

import type { Material } from "@/types/item"

import { findItem } from "@/data/items/findItem"

import { useInventoryStore } from "@/hooks/useInventoryStore"
import { useLocalePathname } from "@/hooks/useLocalePathname"
import { usePlannerStore } from "@/hooks/usePlannerStore"
import { useTooltip } from "@/hooks/useTooltip"
import { getAggregatedMaterial } from "@/hooks/usePlannerStore"

import { formatLocale } from "@/helpers/locale"

import { useLocale, useT } from "@/contexts"

import styles from "./currencyBar.module.css"
import { MaterialIcon } from "../MaterialIcon"

export function CurrencyBox({ currency }: { currency: Material }) {
	const t = useT()
	const numberLocale = formatLocale(useLocale(), "en-US")
	const { Tooltip, showTooltip, hideTooltip } = useTooltip()

	const [isEdit, setIsEdit] = useState<boolean>(false)
	const [inputWidth, setInputWidth] = useState<string>("10px")
	const inputBoxRef = useRef<HTMLInputElement>(null)
	const valueDispRef = useRef<HTMLSpanElement>(null)
	const editBtnRef = useRef<HTMLButtonElement>(null)
	const { inventory, updateInventory } = useInventoryStore()
	const currencyValue = inventory[currency.id] || 0

	const { plannerData } = usePlannerStore()
	const { amount: requiredQuantity, sources: requiredSources } =
		getAggregatedMaterial(plannerData, currency) || {
			amount: 0,
			sources: [],
		}

	const hasRequired = requiredQuantity > 0
	const hasAcquired = currencyValue >= requiredQuantity

	const ownedOrNeededStyle = hasRequired && !hasAcquired ? styles.needed : ""

	const toggleEdit = () => {
		if (inputBoxRef.current) {
			changeInputWidth()
			if (!isEdit) {
				inputBoxRef.current.value = currencyValue.toString()
			} else {
				let newValue = parseInt(inputBoxRef.current.value)
				if (Number.isNaN(newValue)) {
					newValue = 0
				}
				setCurrency(newValue)
			}
		}

		setIsEdit((oldState) => !oldState)
	}

	const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
		e.stopPropagation()
		if (!isEdit) toggleEdit()
	}

	const changeInputWidth = () => {
		if (valueDispRef.current) {
			setInputWidth(`calc(${valueDispRef.current.clientWidth}px + 0.5ch)`)
		}
	}

	const setCurrency = (value: number) => {
		updateInventory({ [currency.id]: value || 0 })
	}

	useEffect(() => {
		if (isEdit) inputBoxRef?.current?.focus()
	}, [isEdit])
	useEffect(() => {
		changeInputWidth()
	}, [currencyValue])

	const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			const newValue = parseInt(e.currentTarget.value.replaceAll(/\D/g, ""))
			setCurrency(newValue)
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key == "Enter" || e.key == "Tab") {
			e.stopPropagation()
			e.currentTarget.blur()
		}
	}

	const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
		if (e.relatedTarget !== editBtnRef.current) {
			toggleEdit()
		}
	}

	const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
		e.currentTarget.setSelectionRange(999, 999)
	}

	const pathname = useLocalePathname()

	const isInventory = pathname === "/inventory"
	const showRequirementIndicator = isInventory && hasRequired && !hasAcquired

	const requiredAmount = requiredQuantity - (hasAcquired ? 0 : currencyValue)

	return (
		<div
			className={`inset-control ${styles.currencyBox} ${ownedOrNeededStyle}`}
			id={currency.id}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
			style={
				{
					"--input-width": inputWidth,
				} as CSSProperties
			}>
			<MaterialIcon
				material={currency}
				className={styles.icon}
				data-currency-id={currency.id}
				width={64}
				height={64}
				alt={t("layout.currencyBox.icon", { name: currency.name })}
				loading="eager"
			/>

			{showRequirementIndicator && (
				<div className={styles.requirementIndicator}>
					{requiredAmount.toLocaleString(numberLocale)}
				</div>
			)}

			<input
				name={currency.name}
				ref={inputBoxRef}
				type={"text"}
				min="0"
				pattern="[0-9]*"
				inputMode="numeric"
				value={currencyValue}
				className={!isEdit ? styles.hidden : undefined}
				onChange={handleEdit}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				onFocus={handleFocus}
			/>
			<span
				ref={valueDispRef}
				onClick={handleClick}
				className={`${styles.amountDisplay} ${isEdit ? styles.editing : ""}`}>
				{currencyValue.toLocaleString(numberLocale)}
			</span>
			<button
				className={styles.editBtn}
				onClick={toggleEdit}
				ref={editBtnRef}
			/>

			<Tooltip subText={currency.materialType} offset={{ x: 32, y: 0 }}>
				<div>{currency.name}</div>
				{hasRequired && (
					<>
						<div className="tooltip-details">
							<span>
								{t("layout.currencyBox.need")}{" "}
								<span className="font-barlow">
									{requiredQuantity}
								</span>
							</span>
							{currencyValue < requiredQuantity && (
								<span>
									<span className="font-barlow tooltip-deficit">
										{" \u25bc "}
										{requiredQuantity - currencyValue}
									</span>
								</span>
							)}
						</div>
						<hr className="tooltip-hr" />
						<div className="tooltip-source-list">
							{t("layout.currencyBox.neededFor")}
							{Object.entries(requiredSources).map(
								([id, amount]) => {
									const item = findItem(id) ?? undefined
									if (item === undefined) return
									return (
										<div className="tooltip-source" key={id}>
											<Image
												src={
													"effect" in item
														? "/icons/arc.png"
														: "/icons/character.png"
												}
												width={16}
												height={16}
												alt={t("layout.currencyBox.source", { name: currency.name })}
											/>
											{amount > 1
												? t("layout.currencyBox.sourceItem", {
														name: item.name,
														amount,
													})
												: item.name}
										</div>
									)
								}
							)}
						</div>
					</>
				)}
				<hr className="tooltip-hr" />
				{currency.id === "annulith" && (
					<div className="tooltip-source-list">
						{t("layout.currencyBox.annulithProcessing")}
						<div className="tooltip-source">
							<Image
								className={styles.dice}
								src={"/materials/rewards/dice_limited.png"}
								width={24}
								height={24}
								alt={t("layout.currencyBox.source", { name: currency.name })}
							/>
							{t("layout.currencyBox.solidDice", {
								amount: Math.floor(currencyValue / 160),
							})}
						</div>
					</div>
				)}
				{currency.sources.length > 0 && (
					<>
						<div className="tooltip-source-list">
							{t("layout.currencyBox.sources")}
							{currency.sources.map((source) => (
								<div className="tooltip-source" key={source}>
									{source}
								</div>
							))}
						</div>
						<hr className="tooltip-hr" />
					</>
				)}
			</Tooltip>
		</div>
	)
}
