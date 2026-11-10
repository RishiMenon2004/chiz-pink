"use client"

import { SettingsRecord } from "@/types/settings"

import { useT } from "@/contexts"

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

import styles from "@/app/[lang]/settings/settings.module.css"

export function AppraiserSection() {
	const t = useT()
	const { settings, actions } = useSettingsStore()

	return (
		<Section>
			<TitleBar title={t("settings.appraiser.title")} />

			<Content>
				<ContentRow equalColumns>
					<ConfigInputbox
						name={t("settings.appraiser.nickname")}
						value={settings.userdata.nickname}
						placeholder={t("settings.appraiser.nicknamePlaceholder")}
						type="text"
						onChange={(e) => {
							actions.setConfig("userdata", {
								nickname: e.currentTarget.value,
							})
						}}
					/>
					<ConfigSelect
						name={t("settings.appraiser.server")}
						value={settings.userdata.server}
						onChange={(e) => {
							actions.setConfig("userdata", {
								server: e.currentTarget
									.value as SettingsRecord["userdata"]["server"],
							})
						}}>
						<option value="America">{t("settings.appraiser.servers.america")}</option>
						<option value="Europe">{t("settings.appraiser.servers.europe")}</option>
						<option value="Asia">{t("settings.appraiser.servers.asia")}</option>
						<option value="SEA">{t("settings.appraiser.servers.sea")}</option>
					</ConfigSelect>
				</ContentRow>

				<div className={styles.pixelStaminaGrid}>
					<ConfigNumberBox
						name={t("settings.appraiser.characterPixels")}
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
						name={t("settings.appraiser.maxPixels")}
						min={0}
						value={settings.userdata["max-pixels"]}
						onChange={(value) => {
							actions.setConfig("userdata", {
								"max-pixels": value,
							})
						}}
					/>
					<ConfigNumberBox
						name={t("settings.appraiser.cityStamina")}
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
						name={t("settings.appraiser.maxStamina")}
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
