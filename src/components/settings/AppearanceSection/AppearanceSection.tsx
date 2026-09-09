"use client"

import { useSettingsStore } from "@/hooks"

import {
	ConfigCheckbox,
	Content,
	ContentColumn,
	ContentRow,
	Section,
	TitleBar,
} from "../SettingsShared"

export function AppearanceSection() {
	const { settings, actions } = useSettingsStore()

	return (
		<Section>
			<TitleBar title="APPEARANCE" />
			<Content>
				<ContentRow equalColumns>
					<ContentColumn>
						<ConfigCheckbox
							name="Custom Cursors"
							checked={settings.appearance["use-cursors"]}
							onChange={(e) =>
								actions.setConfig("appearance", {
									"use-cursors": e.currentTarget.checked,
								})
							}
						/>
					</ContentColumn>

					{/* //TODO Disabling separate planners for now. Will add them in the future when I figure out mobile navbar having too many icons */}
					{/* <ContentColumn>
						<ConfigCheckbox
							name="Hybrid Planner"
							checked={
								settings.appearance["use-hybrid-planner"] ??
								false
							}
							onChange={(e) =>
								actions.setConfig("appearance", {
									"use-hybrid-planner":
										e.currentTarget.checked,
								})
							}
						/>
					</ContentColumn> */}
				</ContentRow>
			</Content>
		</Section>
	)
}
