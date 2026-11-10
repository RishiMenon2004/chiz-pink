"use client"

import { useT } from "@/contexts"

import { useSettingsStore } from "@/hooks"

import {
	ConfigCheckbox,
	Content,
	ContentColumn,
	ContentRow,
	TitleBar,
} from "../SettingsShared"

export function AppearanceSection() {
	const t = useT()
	const { settings, actions } = useSettingsStore()

	return (
		<>
			<TitleBar title={t("settings.appearance.title")} />
			<Content>
				<ContentRow equalColumns>
					<ContentColumn>
						<ConfigCheckbox
							name={t("settings.appearance.customCursors")}
							checked={settings.appearance["use-cursors"]}
							onChange={(e) =>
								actions.setConfig("appearance", {
									"use-cursors": e.currentTarget.checked,
								})
							}
						/>
					</ContentColumn>

					<ContentColumn>
						<ConfigCheckbox
							name={t("settings.appearance.hybridPlanner")}
							checked={
								settings.appearance["use-hybrid-planner"] ?? false
							}
							onChange={(e) =>
								actions.setConfig("appearance", {
									"use-hybrid-planner": e.currentTarget.checked,
								})
							}
						/>
					</ContentColumn>
				</ContentRow>
			</Content>
		</>
	)
}
