"use client"

import { SettingsRecord } from "@/types/settings"

import { useSettingsStore } from "@/hooks"

import {
	ConfigInputbox,
	ConfigNumberBox,
	ConfigSelect,
	Content,
	ContentRow,
	Section,
	TitleBar,
} from "../SettingsShared"
import { PixelRefillCountdown, StaminaResetCountdown } from "../SettingsTimers"

import styles from "@/app/settings/settings.module.css"

export function AppraiserSection() {
	const { settings, actions } = useSettingsStore()

	return (
		<Section>
			<TitleBar title="APPRAISER" />

			<Content>
				<ContentRow equalColumns>
					<ConfigInputbox
						name="Nickname"
						value={settings.userdata.nickname}
						placeholder="Appraiser"
						type="text"
						onChange={(e) => {
							actions.setConfig("userdata", {
								nickname: e.currentTarget.value,
							})
						}}
					/>
					<ConfigSelect
						name="Server"
						value={settings.userdata.server}
						onChange={(e) => {
							actions.setConfig("userdata", {
								server: e.currentTarget
									.value as SettingsRecord["userdata"]["server"],
							})
						}}>
						<option value="America">America</option>
						<option value="Europe">Europe</option>
						<option value="Asia">Asia</option>
						<option value="SEA">SEA</option>
					</ConfigSelect>
				</ContentRow>

				<div className={styles.pixelStaminaGrid}>
					<ConfigNumberBox
						name="Character Pixels"
						min={0}
						max={999}
						value={settings.userdata["current-pixels"]}
						onChange={(value) => {
							actions.setConfig("userdata", {
								"current-pixels": value,
								"pixels-last-edited": Date.now(),
							})
						}}>
						<PixelRefillCountdown
							current={settings.userdata["current-pixels"]}
							max={settings.userdata["max-pixels"]}
							lastEdited={settings.userdata["pixels-last-edited"]}
						/>
					</ConfigNumberBox>
					<ConfigNumberBox
						name="Max Pixels"
						min={0}
						value={settings.userdata["max-pixels"]}
						onChange={(value) => {
							actions.setConfig("userdata", {
								"max-pixels": value,
							})
						}}
					/>
					<ConfigNumberBox
						name="City Stamina"
						min={0}
						max={settings.userdata["max-stamina"]}
						value={settings.userdata["current-stamina"]}
						onChange={(value) => {
							actions.setConfig("userdata", {
								"current-stamina": value,
							})
						}}>
						<StaminaResetCountdown
							server={settings.userdata.server}
						/>
					</ConfigNumberBox>
					<ConfigNumberBox
						name="Max Stamina"
						min={0}
						value={settings.userdata["max-stamina"]}
						onChange={(value) => {
							actions.setConfig("userdata", {
								"max-stamina": value,
							})
						}}
					/>
				</div>
			</Content>
		</Section>
	)
}
