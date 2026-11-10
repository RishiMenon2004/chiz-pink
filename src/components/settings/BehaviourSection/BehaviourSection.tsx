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

export function BehaviourSection() {
	const t = useT()
	const { settings, actions } = useSettingsStore()

	return (
		<>
			<TitleBar title={t("settings.behaviour.title")} />
			<Content>
				<ContentRow equalColumns>
					<ContentColumn>
						<ConfigCheckbox
							checked={settings.behaviour["auto-claim"]}
							onChange={(e) =>
								actions.setConfig("behaviour", {
									"auto-claim": e.currentTarget.checked,
								})
							}
							name={t("settings.behaviour.autoClaim")}
						/>
					</ContentColumn>
					<ContentColumn>
						<ConfigCheckbox
							name={
								settings.behaviour["calendar-day-boundary"] ===
								"server"
									? t("settings.behaviour.calendarServerTime")
									: t("settings.behaviour.calendarLocalTime")
							}
							checked={
								(settings.behaviour["calendar-day-boundary"] ??
									"server") === "local"
							}
							onChange={(e) =>
								actions.setConfig("behaviour", {
									"calendar-day-boundary": e.currentTarget
										.checked
										? "local"
										: "server",
								})
							}
						/>
					</ContentColumn>
				</ContentRow>
			</Content>
		</>
	)
}
