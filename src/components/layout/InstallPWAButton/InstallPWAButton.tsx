"use client"

import { ReactNode, useState } from "react"

import type { MessageKey } from "@/types/messages"

import { PWAInstallPlatform, usePWAInstall } from "@/hooks/usePWAInstall"

import { useT } from "@/contexts"

import { ModalContainer } from "@/components/layout/Modal/ModalContainer"

import styles from "./installPWAButton.module.css"
import { AlertContainer } from "../Alert"
import { alertTextBox } from "../Alert/AlertContainer"

const MANUAL_INSTRUCTIONS = {
	"ios-safari": {
		title: "layout.installPwa.iosSafari.title",
		steps: [
			"layout.installPwa.iosSafari.step1",
			"layout.installPwa.iosSafari.step2",
			"layout.installPwa.iosSafari.step3",
		],
	},
	"ios-other": {
		title: "layout.installPwa.iosOther.title",
		steps: [
			"layout.installPwa.iosOther.step1",
			"layout.installPwa.iosOther.step2",
			"layout.installPwa.iosOther.step3",
		],
	},
	"macos-safari": {
		title: "layout.installPwa.macosSafari.title",
		steps: [
			"layout.installPwa.macosSafari.step1",
			"layout.installPwa.macosSafari.step2",
			"layout.installPwa.macosSafari.step3",
		],
	},
	firefox: {
		title: "layout.installPwa.firefox.title",
		steps: [
			"layout.installPwa.firefox.step1",
			"layout.installPwa.firefox.step2",
			"layout.installPwa.firefox.step3",
		],
	},
	samsung: {
		title: "layout.installPwa.samsung.title",
		steps: [
			"layout.installPwa.samsung.step1",
			"layout.installPwa.samsung.step2",
			"layout.installPwa.samsung.step3",
		],
	},
	other: {
		title: "layout.installPwa.other.title",
		steps: [
			"layout.installPwa.other.step1",
			"layout.installPwa.other.step2",
			"layout.installPwa.other.step3",
		],
	},
} as const satisfies Record<
	PWAInstallPlatform,
	{ title: MessageKey; steps: MessageKey[] }
>

export function InstallPWAButton({
	type,
	children = <></>,
}: {
	type: "button" | "link"
	children?: ReactNode
}) {
	const t = useT()
	const { isStandalone, platform, canUseNativePrompt, promptInstall } =
		usePWAInstall()
	const [showInstructions, setShowInstructions] = useState(false)

	if (isStandalone) return null

	const handleClick = () => {
		if (canUseNativePrompt) {
			promptInstall()
			return
		}

		setShowInstructions(true)
	}

	const instructions = MANUAL_INSTRUCTIONS[platform]

	return (
		<>
			{type === "button" ? (
				<button
					className="pill-button"
					data-variant="normal"
					onClick={handleClick}>
					{t("layout.installPwa.button")}
				</button>
			) : (
				<a className="btn-anchor" onClick={handleClick}>
					{children}
				</a>
			)}

			{showInstructions && (
				<ModalContainer>
					<AlertContainer
						type="acknowledge"
						confirmLabel={t("layout.installPwa.gotIt")}
						onConfirm={() => setShowInstructions(false)}>
						{t(instructions.title)}
						<div className={`inset-control ${alertTextBox}`}>
							<ol className={styles.instructionsSteps}>
								{instructions.steps.map((step, index) => (
									<li key={index}>{t(step)}</li>
								))}
							</ol>
						</div>
					</AlertContainer>
				</ModalContainer>
			)}
		</>
	)
}
