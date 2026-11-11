"use client"

import { useT } from "@/contexts"

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
	const t = useT()
	const { isStandalone } = usePWAInstall()

	if (isStandalone) return null

	return (
		<Section>
			<TitleBar title={t("settings.pwa.title")} />

			<Content>
				<ContentColumn>
					{t("settings.pwa.description")}
					<Blockquote>
						{t("settings.pwa.offlineNote")}
					</Blockquote>
				</ContentColumn>

				<ContentRow buttonRow>
					<InstallPWAButton type="button" />
				</ContentRow>
			</Content>
		</Section>
	)
}
