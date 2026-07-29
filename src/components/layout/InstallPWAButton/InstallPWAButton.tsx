"use client"

import { ReactNode, useState } from "react"

import { PWAInstallPlatform, usePWAInstall } from "@/hooks"

import { stopPropogation } from "@/helpers"

import { ModalContainer } from "@/components/layout/Modal"

import styles from "./installPWAButton.module.css"

const MANUAL_INSTRUCTIONS: Record<
	PWAInstallPlatform,
	{ title: string; steps: string[] }
> = {
	"ios-safari": {
		title: "Install on iPhone/iPad",
		steps: [
			"Tap the Share icon in Safari's toolbar.",
			"Scroll down and tap 'Add to Home Screen'.",
			"Tap 'Add' in the top right corner.",
		],
	},
	"ios-other": {
		title: "Install on iPhone/iPad",
		steps: [
			"Tap the Share or menu icon in your browser's toolbar.",
			"Tap 'Add to Home Screen'.",
			"Confirm by tapping 'Add'.",
		],
	},
	"macos-safari": {
		title: "Install on Mac",
		steps: [
			"Click the Share icon in Safari's toolbar.",
			"Select 'Add to Dock'.",
			"Confirm by clicking 'Add'.",
		],
	},
	firefox: {
		title: "Install on Firefox",
		steps: [
			"Open the browser menu.",
			"Tap 'Install' or 'Add to Home screen', if available.",
			"If it's missing, use Chrome, Edge, or Safari to install Chiz.Pink instead.",
		],
	},
	samsung: {
		title: "Install on Samsung Internet",
		steps: [
			"Tap the menu icon in the toolbar.",
			"Tap 'Add page to'.",
			"Select 'Home screen' and confirm.",
		],
	},
	other: {
		title: "Install Chiz.Pink",
		steps: [
			"Open your browser's menu.",
			"Look for 'Add to Home Screen' or 'Install App'.",
			"Follow the prompts to finish installing.",
		],
	},
}

export function InstallPWAButton({
	type,
	children = <></>,
}: {
	type: "button" | "link"
	children?: ReactNode
}) {
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
					INSTALL APP
				</button>
			) : (
				<a className="btn-anchor" onClick={handleClick}>
					{children}
				</a>
			)}

			{showInstructions && (
				<ModalContainer onClickOut={() => setShowInstructions(false)}>
					<div
						className={`metallic-panel ${styles.instructionsBox}`}
						onClick={stopPropogation}>
						<span className={styles.instructionsTitle}>
							{instructions.title}
						</span>
						<ol className={styles.instructionsSteps}>
							{instructions.steps.map((step, index) => (
								<li key={index}>{step}</li>
							))}
						</ol>
						<button
							className="pill-button"
							data-variant="normal"
							onClick={() => setShowInstructions(false)}>
							Got it
						</button>
					</div>
				</ModalContainer>
			)}
		</>
	)
}
