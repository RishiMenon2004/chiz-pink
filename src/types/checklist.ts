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
	lastDailyReset: number
}
