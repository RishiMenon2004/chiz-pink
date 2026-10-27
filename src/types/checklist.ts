export type ChecklistEntry = {
	disabled: boolean
	checked: number
	claimed?: number
	claimedAt?: number | null
}

// `anchorDate` is a server-time "YYYY-MM-DD" on which the task resets; it
// fixes which weeks are "on" and stays put if the player switches server.
// Monthly `day` is clamped to the month's length (31 → Feb 28/29).
export type CustomTaskSchedule =
	| { type: "daily" }
	| { type: "weekly" }
	| { type: "biWeekly"; anchorDate: string }
	| { type: "monthly"; day: number }
	| { type: "seasonal" }

export type CustomTask = {
	id: string
	title: string
	description: string
	schedule: CustomTaskSchedule
	createdAt: number
	// Completion is derived (checkedAt >= the schedule's previous reset)
	// rather than cleared by the reset loop, so custom tasks need no reset
	// timestamps of their own.
	checkedAt: number | null
}

export type ChecklistRecord = {
	// Optional on disk: saves and backups from before custom tasks existed
	// don't have it. getSnapshot() backfills it in memory.
	customTasks?: Record<string, CustomTask>
	activities: {
		daily: Record<string, ChecklistEntry>
		weekly: Record<string, ChecklistEntry>
		biWeekly: Record<string, ChecklistEntry>
		monthly: Record<string, ChecklistEntry>
		seasonal: Record<string, ChecklistEntry>
	}
	events: Record<string, number>
	resetTimestamps: {
		lastDailyReset: number
		lastWeeklyReset: number
		lastBiWeeklyMondayReset: number
		lastBiWeeklyWednesdayReset: number
		lastMonthlyReset: number
		lastSeasonalReset: number
	}
}
