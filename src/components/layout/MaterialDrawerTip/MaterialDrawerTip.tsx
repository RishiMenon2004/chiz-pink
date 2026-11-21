"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import {
	dismissMaterialDrawerTip,
	shouldShowMaterialDrawerTip,
	subscribeMaterialDrawerTip,
} from "@/helpers/materialDrawerTip"

import { useT } from "@/contexts"

import styles from "./materialDrawerTip.module.css"

const SHOW_DELAY_MS = 350
const HIDE_DURATION_MS = 200

export function MaterialDrawerTip() {
	const t = useT()
	const shouldShow = useSyncExternalStore(
		subscribeMaterialDrawerTip,
		shouldShowMaterialDrawerTip,
		() => false
	)
	const [isVisible, setIsVisible] = useState(false)
	const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (!shouldShow) return
		const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS)
		return () => clearTimeout(timer)
	}, [shouldShow])

	useEffect(() => {
		return () => {
			if (dismissTimerRef.current) {
				clearTimeout(dismissTimerRef.current)
				dismissMaterialDrawerTip()
			}
		}
	}, [])

	if (!shouldShow) return null

	const handleDismiss = () => {
		if (dismissTimerRef.current) return
		setIsVisible(false)
		dismissTimerRef.current = setTimeout(() => {
			dismissTimerRef.current = null
			dismissMaterialDrawerTip()
		}, HIDE_DURATION_MS)
	}

	return createPortal(
		<div
			className={styles.tip}
			data-visible={isVisible}
			role="status"
			aria-live="polite">
			<svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
				<circle cx="8" cy="8" r="6.5" />
				<path d="M8 7.25v4" />
				<circle cx="8" cy="4.75" r="0.5" fill="currentColor" />
			</svg>
			<span className={styles.text}>{t("layout.materialHint.touch")}</span>
			<button
				type="button"
				className={styles.dismiss}
				onClick={handleDismiss}
				aria-label={t("layout.infoBox.dismiss")}>
				<svg viewBox="0 0 16 16" aria-hidden="true">
					<path d="M4 4l8 8M12 4l-8 8" />
				</svg>
			</button>
		</div>,
		document.body
	)
}
