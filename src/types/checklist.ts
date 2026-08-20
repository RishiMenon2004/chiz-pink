export type ChecklistEntry = {
	disabled: boolean
	checked: number
	claimed?: number
	claimedAt?: number | null
}

export type ChecklistRecord = {
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
