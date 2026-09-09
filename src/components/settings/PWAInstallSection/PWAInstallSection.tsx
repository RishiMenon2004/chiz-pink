"use client"

import { usePWAInstall } from "@/hooks"

import { InstallPWAButton } from "@/components/layout"

import {
	Blockquote,
	Content,
	ContentColumn,
	ContentRow,
	Section,
	TitleBar,
} from "../SettingsShared"

export function PWAInstallSection() {
	const { isStandalone } = usePWAInstall()

	if (isStandalone) return null

	return (
		<Section>
			<TitleBar title="INSTALL AS PWA" />

			<Content>
				<ContentColumn>
					Install Chiz.Pink as a native app on any device with a
					supported browser.
					<Blockquote>
						{"Use it on the go or when you're offline too!"}
					</Blockquote>
				</ContentColumn>

				<ContentRow buttonRow>
					<InstallPWAButton type="button" />
				</ContentRow>
			</Content>
		</Section>
	)
}
