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

export type BackupData = {
	checklist: ChecklistRecord,
	lastUpdated: number
	inventory: Inventory
	// Characters and arcs combined into one list, in hybrid-planner display
	// order, instead of two separately-keyed collections - keeps the export
	// human-readable as a single ordered sequence and makes plannerOrder's
	// three views (hybrid/characters/arcs) simple to re-derive on import
	// instead of needing to be exported and kept in sync themselves. See
	// backupData.ts's buildBackupPayload()/backupSetImport().
	planner: StoredPlannerItem[]
	gachaPulls: PullsRecord
	settings: SettingsRecord
}
