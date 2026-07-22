import { Inventory } from "./inventory"
import { PlannerRecord } from "./planner"

export type SettingsRecord = {
	appearance: {
		"use-cursors"?: boolean
	}
}

export type BackupData = {
	lastUpdated: number
	inventory: Inventory
	planner: PlannerRecord
	settings: SettingsRecord
}
