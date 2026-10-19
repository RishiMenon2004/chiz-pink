"use client"

import Link from "next/link"
import { Ref, useRef } from "react"

import { characterPixel, cityStamina } from "@/data/items/materials"

import { useSettingsStore } from "@/hooks"

import {
	PixelRefillCountdown,
	StaminaResetCountdown,
} from "@/components/settings"

import { MaterialIcon } from "@/components/layout"

import pageStyles from "@/app/page.module.css"
import styles from "./DashStaminaGauge.module.css"

const PIXEL_INPUT_CAP = 999

const PIXEL_STEPS = [-80, -60, -40, 1, 60]
const STAMINA_STEPS = [100]

function QuickAdjust({
	label,
	current,
	max,
	cap,
	steps,
	side,
	onChange,
}: {
	label: string
	current: number
	max: number
	cap: number
	steps: number[]
	side: "left" | "right"
	onChange: (value: number) => void
}) {
	return (
		<div
			className={`inset-control ${styles.quickAdjust}`}
			data-side={side}
			role="group"
			aria-label={`Adjust ${label}`}>
			<button
				type="button"
				className={styles.quickButton}
				disabled={current === 0}
				onClick={() => onChange(0)}>
				EMPTY
			</button>
			{steps.map((step) => (
				<button
					key={step}
					type="button"
					className={styles.quickButton}
					disabled={step < 0 ? current < -step : current >= cap}
					aria-label={`${step < 0 ? "Spend" : "Add"} ${Math.abs(step)} ${label}`}
					onClick={() => onChange(Math.min(Math.max(current + step, 0), cap))}>
					{step < 0 ? `−${-step}` : `+${step}`}
				</button>
			))}
			<button
				type="button"
				className={styles.quickButton}
				disabled={current >= max}
				onClick={() => onChange(max)}>
				FULL
			</button>
		</div>
	)
}

function GaugeValueInput({
	name,
	value,
	max,
	ref,
	onChange,
}: {
	name: string
	value: number
	max?: number
	ref: Ref<HTMLInputElement>
	onChange: (value: number) => void
}) {
	const width = `${Math.max(String(value).length + 0.375, 1)}ch`

	return (
		<input
			ref={ref}
			name={name}
			aria-label={name}
			type="text"
			pattern="[0-9]*"
			inputMode="numeric"
			value={value}
			onChange={(e) => {
				const digits = e.currentTarget.value.replace(/\D/g, "")
				const next = digits === "" ? 0 : parseInt(digits)
				onChange(max !== undefined ? Math.min(next, max) : next)
			}}
			className={styles.gaugeInput}
			style={{ width, minWidth: width }}
		/>
	)
}

export function DashStaminaGauge() {
	const { settings, actions } = useSettingsStore()
	const { "current-pixels": currentPixels, "max-pixels": maxPixels } =
		settings.userdata
	const { "current-stamina": currentStamina, "max-stamina": maxStamina } =
		settings.userdata

	const pixelRef = useRef<HTMLInputElement>(null!)

	const setStamina = (value: number) => {
		actions.setConfig("userdata", { "current-stamina": value })
	}

	const setPixels = (value: number) => {
		actions.setConfig("userdata", {
			"current-pixels": value,
			"pixels-last-edited": Date.now(),
		})
	}
	const staminaRef = useRef<HTMLInputElement>(null!)

	return (
		<div className={`metallic-panel ${pageStyles.section} ${styles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<div className={pageStyles.sectionTitle}>Stamina</div>
				<Link
					href="/settings"
					className={`pill-button ${pageStyles.sectionButton}`}>
					EDIT MAX STAMINA
				</Link>
			</div>
			<div className={styles.gaugeRow}>
				<div className={styles.gaugeColumn}>
					<div
						onClick={() => {
							if (pixelRef) pixelRef.current.focus()
						}}
						className={`inset-control ${styles.gauge} ${styles.pixelsGauge}`}>
						<MaterialIcon
							className={styles.gaugeIcon}
							material={characterPixel}
							width={64}
							height={64}
							quality={100}
							loading="eager"
						/>
						<p className={styles.gaugeText}>
							<GaugeValueInput
								name="Current Pixels"
								value={currentPixels}
								max={PIXEL_INPUT_CAP}
								ref={pixelRef}
								onChange={setPixels}
							/>
							<span
								className={
									styles.gaugeMax
								}>{` / ${maxPixels}`}</span>
						</p>
					</div>
					<QuickAdjust
						label="Pixels"
						current={currentPixels}
						max={maxPixels}
						cap={PIXEL_INPUT_CAP}
						steps={PIXEL_STEPS}
						side="left"
						onChange={setPixels}
					/>
					<div className={styles.countdownText}>
						<PixelRefillCountdown
							current={currentPixels}
							max={maxPixels}
							lastEdited={settings.userdata["pixels-last-edited"]}
						/>
					</div>
				</div>
				<div className={styles.gaugeColumn}>
					<div
						onClick={() => {
							if (staminaRef) staminaRef.current.focus()
						}}
						className={`inset-control ${styles.gauge} ${styles.staminaGauge}`}>
						<p className={styles.gaugeText}>
							<GaugeValueInput
								name="Current City Stamina"
								value={currentStamina}
								max={maxStamina}
								ref={staminaRef}
								onChange={setStamina}
							/>
							<span
								className={
									styles.gaugeMax
								}>{` / ${maxStamina}`}</span>
						</p>
						<MaterialIcon
							className={styles.gaugeIcon}
							material={cityStamina}
							width={64}
							height={64}
							quality={100}
							loading="eager"
						/>
					</div>
					<QuickAdjust
						label="City Stamina"
						current={currentStamina}
						max={maxStamina}
						cap={maxStamina}
						steps={STAMINA_STEPS}
						side="right"
						onChange={setStamina}
					/>
					<div className={styles.countdownText}>
						<StaminaResetCountdown
							server={settings.userdata.server}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
