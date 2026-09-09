"use client"

import { useSettingsStore } from "@/hooks"

import {
	ConfigCheckbox,
	Content,
	ContentColumn,
	ContentRow,
	TitleBar,
} from "../SettingsShared"

export function BehaviourSection() {
	const { settings, actions } = useSettingsStore()

	return (
		<>
			<TitleBar title="BEHAVIOUR" />
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
							name="Daily Tasks: Add to Inventory"
						/>
					</ContentColumn>
					<ContentColumn>
						<ConfigCheckbox
							name={`Calendar: ${
								settings.behaviour["calendar-day-boundary"] ===
								"server"
									? "Server Time"
									: "Local Time"
							}`}
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
