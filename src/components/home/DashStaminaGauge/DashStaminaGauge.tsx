"use client"

import Link from "next/link"
import { Ref, useRef } from "react"

import { characterPixel, cityStamina } from "@/data/items/materials"

import { useSettingsStore } from "@/hooks"

import {
	PixelRefillCountdown,
	StaminaResetCountdown,
} from "@/app/settings/RenderSettings"

import { MaterialIcon } from "@/components/layout"

import pageStyles from "@/app/page.module.css"
import styles from "./DashStaminaGauge.module.css"

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
	const staminaRef = useRef<HTMLInputElement>(null!)

	return (
		<div className={`metallic-panel ${pageStyles.section} ${styles.section}`}>
			<div className={pageStyles.sectionTitleRow}>
				<div className={pageStyles.sectionTitle}>Stamina</div>
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
								max={999}
								ref={pixelRef}
								onChange={(value) => {
									actions.setConfig("userdata", {
										"current-pixels": value,
										"pixels-last-edited": Date.now(),
									})
								}}
							/>
							<span
								className={
									styles.gaugeMax
								}>{` / ${maxPixels}`}</span>
						</p>
					</div>
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
								onChange={(value) => {
									actions.setConfig("userdata", {
										"current-stamina": value,
									})
								}}
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
					<div className={styles.countdownText}>
						<StaminaResetCountdown
							server={settings.userdata.server}
						/>
					</div>
				</div>
			</div>
			<small className={styles.footer}>
				{"Set max Pixels/City Stamina in "}
				<Link href={"/settings"} className="btn-anchor">
					Settings
				</Link>
			</small>
		</div>
	)
}
