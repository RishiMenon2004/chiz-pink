"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
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
import { Character } from "@/types/character"
import { Arc } from "@/types/weapon"

import { findArc } from "@/data/arcs"
import { findCharacter } from "@/data/characters"

import { useInventoryStore, usePlannerStore, useTooltip } from "@/hooks"
import { getAggregatedMaterial } from "@/hooks/usePlannerStore"

import styles from "./currencyBar.module.css"

const localeUS = (x: number) => x.toLocaleString("en-US")

export function CurrencyBox({ currency }: { currency: Material }) {
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

	const pathname = usePathname()

	const isInventory = pathname === "/inventory"

	return (
		<div
			className={`raised-control ${styles.currencyBox} ${ownedOrNeededStyle}`}
			id={currency.id}
			onPointerEnter={showTooltip}
			onPointerLeave={hideTooltip}
			style={
				{
					"--bg-image": `url('/materials/borders/${currency.id}.png')`,
					"--input-width": inputWidth,
				} as CSSProperties
			}>
			<Image
				className={styles.icon}
				src={`/materials${currency.imageSrc}.png`}
				width={64}
				height={64}
				alt={`${currency.name} icon`}
				loading="eager"
			/>

			{isInventory && hasRequired && !hasAcquired && (
				<div className={styles.requirementIndicator}>
					{hasAcquired
						? requiredQuantity
						: requiredQuantity - currencyValue}
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
				style={isEdit ? {} : { display: "none" }}
				onChange={handleEdit}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				onFocus={handleFocus}
			/>
			<span
				ref={valueDispRef}
				onClick={handleClick}
				className={styles.amountDisplay}
				style={
					isEdit
						? {
								opacity: "0",
								position: "absolute",
								pointerEvents: "none",
							}
						: {}
				}>
				{localeUS(currencyValue)}
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
						<div
							style={{
								fontSize: "0.8rem",
								opacity: 0.75,
								fontWeight: 600,
								marginBlock: "0.25rem",
								marginLeft: "0.5rem",
							}}>
							<span>
								{"Need: "}
								<span
									style={{
										fontFamily:
											"var(--font-barlow-condensed)",
										fontSize: "1rem",
										letterSpacing: "7%",
									}}>
									{requiredQuantity}
								</span>
							</span>
							{currencyValue < requiredQuantity && (
								<span>
									<span
										style={{
											fontFamily:
												"var(--font-barlow-condensed)",
											fontSize: "1rem",
											color: "#ff486d",
											fontStyle: "italic",
											letterSpacing: "7%",
											paintOrder: "stroke fill",
											WebkitTextStroke: "2px black",
										}}>
										{" ▼ "}
										{requiredQuantity - currencyValue}
									</span>
								</span>
							)}
						</div>
						<hr style={{ marginBlock: "0.5rem" }} />
						<div className="tooltip-source-list">
							Needed For:
							{Object.entries(requiredSources).map(
								([id, amount]) => {
									const item: Arc | Character | undefined =
										findArc(id) ??
										findCharacter(id) ??
										undefined
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
												alt={`${currency.name} Source`}
											/>
											{`${item.name} ${amount > 1 ? `×${amount}` : ""}`}
										</div>
									)
								}
							)}
						</div>
					</>
				)}
				<hr style={{ marginBlock: "0.5rem" }} />
				{currency.id === "annulith" && (
					<div className="tooltip-source-list">
						Annulith Processing:
						<div className="tooltip-source">
							<Image
								className={styles.dice}
								src={"/materials/rewards/dice_limited.png"}
								width={24}
								height={24}
								alt={`${currency.name} Source`}
							/>
							{`Solid Dice ×${Math.floor(currencyValue / 160)}`}
						</div>
					</div>
				)}
				{currency.sources.length > 0 && (
					<>
						<div className="tooltip-source-list">
							Sources:
							{currency.sources.map((source) => (
								<div className="tooltip-source" key={source}>
									{source}
								</div>
							))}
						</div>
						<hr style={{ marginBlock: "0.5rem" }} />
					</>
				)}
			</Tooltip>
		</div>
	)
}
