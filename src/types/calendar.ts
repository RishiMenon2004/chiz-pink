import type { SettingsRecord } from "./settings"

export type DayBoundaryMode = SettingsRecord["behaviour"]["calendar-day-boundary"]

export type MonthChunk = {
	year: number
	month: number
	firstDay: number
	lastDay: number
}
