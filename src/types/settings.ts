import { ChecklistRecord } from "./checklist"
import { Inventory } from "./inventory"
import { StoredPlannerItem } from "./planner"
import { PullsRecord } from "./pulls"

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

// Decoupled main payload for Convex cloud sync (checklist, inventory, planner, settings)
export type MainBackupData = {
	checklist: ChecklistRecord
	lastUpdated: number
	inventory: Inventory
	planner: StoredPlannerItem[]
	settings: SettingsRecord
}

// Decoupled gacha payload for Convex cloud sync
export type GachaBackupData = {
	gachaLastUpdated: number
	gachaPulls: PullsRecord
}

// Combined export/import format for local JSON file backup/restore
export type BackupData = MainBackupData & {
	gachaPulls: PullsRecord
	gachaLastUpdated?: number
}
