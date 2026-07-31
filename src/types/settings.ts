import { Inventory } from "./inventory"
import { HybridPlannerRecord, PlannerRecord } from "./planner"

export type SettingsRecord = {
	appearance: {
		"use-cursors": boolean
		"use-hybrid-planner": boolean
	}
	behaviour: {
		"auto-claim": boolean
		"calendar-day-boundary": "server" | "local"
	}
	userdata: {
		nickname: string
		server: "America" | "Asia" | "Europe" | "SEA"
		"current-stamina": number
		"max-stamina": number
		"last-stamina-reset": number
		"current-pixels": number
		"max-pixels": number
		"pixels-last-edited": number
	}
}

export type BackupData = {
	lastUpdated: number
	inventory: Inventory
	planner: PlannerRecord
	hybridPlanner: HybridPlannerRecord
	settings: SettingsRecord
}
